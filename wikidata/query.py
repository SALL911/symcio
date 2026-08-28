#!/usr/bin/env python3
"""SPARQL helper for Wikidata.

Examples:
    python query.py --user Symcio --limit 50
    python query.py --sparql "SELECT ?item WHERE { ?item wdt:P31 wd:Q4830453 } LIMIT 5"
"""

from __future__ import annotations

import argparse
import json
import sys

import requests

WDQS_ENDPOINT = 'https://query.wikidata.org/sparql'
USER_AGENT = 'symcio-bot/1.0 (https://github.com/sall911/symcio)'


def recent_edits_query(user: str, limit: int) -> str:
    # Items most recently edited by a given user — via revision metadata.
    # Note: WDQS does not expose user names; use the MediaWiki API for that.
    return f'''
SELECT ?item ?itemLabel ?modified WHERE {{
  ?item schema:dateModified ?modified.
  ?item rdfs:label ?label.
  FILTER(LANG(?label) IN ("en", "zh", "zh-tw")).
  SERVICE wikibase:label {{ bd:serviceParam wikibase:language "en,zh-tw,zh". }}
}}
ORDER BY DESC(?modified)
LIMIT {limit}
'''.strip()


def run_sparql(query: str) -> dict:
    response = requests.get(
        WDQS_ENDPOINT,
        params={'query': query, 'format': 'json'},
        headers={'User-Agent': USER_AGENT, 'Accept': 'application/sparql-results+json'},
        timeout=60,
    )
    response.raise_for_status()
    return response.json()


def list_user_contributions(user: str, limit: int) -> list[dict]:
    """Use the MediaWiki API to list a user's recent Wikidata contributions."""
    response = requests.get(
        'https://www.wikidata.org/w/api.php',
        params={
            'action': 'query',
            'list': 'usercontribs',
            'ucuser': user,
            'uclimit': limit,
            'ucprop': 'title|timestamp|comment|ids',
            'format': 'json',
        },
        headers={'User-Agent': USER_AGENT},
        timeout=30,
    )
    response.raise_for_status()
    return response.json().get('query', {}).get('usercontribs', [])


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description='Wikidata SPARQL / contribution query helper')
    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument('--user', help='List recent contributions for a Wikidata username')
    g.add_argument('--sparql', help='Raw SPARQL query string')
    p.add_argument('--limit', type=int, default=20)
    return p.parse_args()


def main() -> int:
    args = parse_args()
    if args.user:
        contribs = list_user_contributions(args.user, args.limit)
        print(json.dumps(contribs, ensure_ascii=False, indent=2))
    else:
        result = run_sparql(args.sparql)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    sys.exit(main())
