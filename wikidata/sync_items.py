#!/usr/bin/env python3
"""Sync Wikidata items from a JSON spec file.

Usage:
    python sync_items.py --input data/items.json [--dry-run]

The input file is validated against lib/schema.py before any writes.
After a successful run, QIDs of newly-created items are written back
into the input file in-place, so subsequent runs become idempotent updates.
"""

from __future__ import annotations

import argparse
import json
import logging
import sys
from pathlib import Path

from dotenv import load_dotenv

from lib import WikidataClient, validate_items_file

log = logging.getLogger('symcio.wikidata.sync')


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description='Sync Symcio items to Wikidata')
    p.add_argument('--input', type=Path, required=True, help='Path to items JSON spec')
    p.add_argument('--dry-run', action='store_true', help='Print actions without writing to Wikidata')
    p.add_argument('--verbose', '-v', action='count', default=0)
    return p.parse_args()


def configure_logging(verbosity: int) -> None:
    level = logging.WARNING
    if verbosity == 1:
        level = logging.INFO
    elif verbosity >= 2:
        level = logging.DEBUG
    logging.basicConfig(level=level, format='%(asctime)s %(levelname)s %(name)s: %(message)s')


def main() -> int:
    load_dotenv()
    args = parse_args()
    configure_logging(max(args.verbose, 1))

    spec = validate_items_file(args.input)
    log.info('Validated %d items from %s', len(spec['items']), args.input)

    client = WikidataClient(dry_run=args.dry_run)

    changed = False
    for idx, item_spec in enumerate(spec['items']):
        label_en = item_spec.get('labels', {}).get('en', '(no en label)')
        log.info('[%d/%d] Processing %s (current id=%s)', idx + 1, len(spec['items']),
                 label_en, item_spec.get('id'))
        try:
            result = client.upsert_item(item_spec)
        except Exception as exc:
            log.exception('Failed on item %d (%s): %s', idx, label_en, exc)
            return 2

        log.info('  -> %s %s (statements +%d, ~%d)',
                 'CREATED' if result.created else 'UPDATED',
                 result.qid, result.statements_added, result.statements_skipped)

        if not args.dry_run and result.qid and result.qid != 'Q?' and item_spec.get('id') != result.qid:
            item_spec['id'] = result.qid
            changed = True

    if changed:
        args.input.write_text(json.dumps(spec, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        log.info('Wrote back QIDs to %s', args.input)

    return 0


if __name__ == '__main__':
    sys.exit(main())
