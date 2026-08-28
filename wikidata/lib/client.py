"""Thin wrapper around pywikibot for Wikidata CRUD operations.

Supports:
  - Creating new items with labels/descriptions/aliases
  - Updating existing items (by QID)
  - Adding statements with item / string / url / time / quantity / monolingual values
  - Qualifiers and references on statements
  - Lookup-by-label to deduplicate before creation
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Optional

import pywikibot
from pywikibot import Claim, ItemPage, Site, WbMonolingualText, WbQuantity, WbTime
from pywikibot.data import api

log = logging.getLogger(__name__)


@dataclass
class SyncResult:
    qid: str
    created: bool
    statements_added: int
    statements_skipped: int


class WikidataClient:
    def __init__(self, dry_run: bool = False):
        self.dry_run = dry_run
        self.site = Site('wikidata', 'wikidata')
        self.repo = self.site.data_repository()

    # ----- lookup helpers -----
    def find_item_by_label(self, label: str, language: str = 'en') -> Optional[str]:
        """Search Wikidata for an existing item with matching label.

        Returns the QID of the first exact match, or None.
        """
        params = {
            'action': 'wbsearchentities',
            'search': label,
            'language': language,
            'type': 'item',
            'limit': 5,
        }
        request = api.Request(site=self.site, parameters=params)
        data = request.submit()
        for hit in data.get('search', []):
            if hit.get('match', {}).get('text', '').lower() == label.lower():
                return hit['id']
        return None

    # ----- item lifecycle -----
    def upsert_item(self, spec: dict) -> SyncResult:
        """Create or update a Wikidata item from a spec dict.

        Spec shape:
            {
              "id": "Q123" | None,
              "labels": {lang: text},
              "descriptions": {lang: text},
              "aliases": {lang: [text, ...]},
              "statements": [ {property, value, qualifiers?, references?}, ... ]
            }
        """
        qid = spec.get('id')
        created = False

        if qid:
            item = ItemPage(self.repo, qid)
            item.get()
        else:
            # Try to find by label before creating
            labels = spec.get('labels', {})
            for lang, label in labels.items():
                found = self.find_item_by_label(label, lang)
                if found:
                    log.info('Found existing item %s matching label %r (%s)', found, label, lang)
                    qid = found
                    item = ItemPage(self.repo, qid)
                    item.get()
                    break
            else:
                item = ItemPage(self.repo)
                created = True

        # Build edit payload
        data: dict[str, Any] = {}
        if spec.get('labels'):
            data['labels'] = spec['labels']
        if spec.get('descriptions'):
            data['descriptions'] = spec['descriptions']
        if spec.get('aliases'):
            data['aliases'] = spec['aliases']

        if data:
            if self.dry_run:
                log.info('[DRY-RUN] editEntity on %s: %s', qid or '(new)', data)
            else:
                item.editEntity(data, summary='Symcio bot: sync labels/descriptions/aliases')
                qid = item.getID()

        if created and self.dry_run:
            # synthesize a placeholder so callers can continue
            qid = qid or 'Q?'

        added = skipped = 0
        for stmt in spec.get('statements', []):
            if self._add_statement_if_missing(item, stmt):
                added += 1
            else:
                skipped += 1

        return SyncResult(qid=qid or 'Q?', created=created, statements_added=added, statements_skipped=skipped)

    # ----- statement helpers -----
    def _add_statement_if_missing(self, item: ItemPage, stmt: dict) -> bool:
        prop = stmt['property']
        target = self._build_target(stmt['value'])

        # Skip if an identical claim already exists
        existing = item.claims.get(prop, []) if hasattr(item, 'claims') else []
        for claim in existing:
            if self._claim_target_equals(claim, target):
                return False

        claim = Claim(self.repo, prop)
        claim.setTarget(target)

        if self.dry_run:
            log.info('[DRY-RUN] addClaim %s %s = %r', item.getID() if item.exists() else '(new)', prop, target)
        else:
            item.addClaim(claim, summary=f'Symcio bot: add {prop}')
            for q in stmt.get('qualifiers', []):
                qclaim = Claim(self.repo, q['property'], is_qualifier=True)
                qclaim.setTarget(self._build_target(q['value']))
                claim.addQualifier(qclaim)
            for ref_group in stmt.get('references', []):
                ref_claims = []
                for ref in ref_group:
                    rclaim = Claim(self.repo, ref['property'], is_reference=True)
                    rclaim.setTarget(self._build_target(ref['value']))
                    ref_claims.append(rclaim)
                if ref_claims:
                    claim.addSources(ref_claims)
        return True

    def _build_target(self, value: dict) -> Any:
        vtype = value['type']
        if vtype == 'item':
            return ItemPage(self.repo, value['id'])
        if vtype == 'string':
            return value['value']
        if vtype == 'url':
            return value['value']
        if vtype == 'monolingual':
            return WbMonolingualText(text=value['text'], language=value['language'])
        if vtype == 'time':
            return WbTime.fromTimestr(value['value'], precision=value.get('precision', 11))
        if vtype == 'quantity':
            return WbQuantity(amount=value['amount'], unit=value.get('unit'), site=self.repo)
        raise ValueError(f'Unsupported value type: {vtype}')

    def _claim_target_equals(self, claim: Claim, target: Any) -> bool:
        try:
            current = claim.getTarget()
        except Exception:
            return False
        if isinstance(target, ItemPage) and isinstance(current, ItemPage):
            return target.getID() == current.getID()
        return current == target
