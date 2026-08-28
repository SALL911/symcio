"""JSON Schema validation for items.json."""

from __future__ import annotations

import json
from pathlib import Path

from jsonschema import Draft202012Validator

ITEMS_SCHEMA = {
    '$schema': 'https://json-schema.org/draft/2020-12/schema',
    'type': 'object',
    'required': ['items'],
    'properties': {
        'items': {
            'type': 'array',
            'items': {'$ref': '#/$defs/item'},
        },
    },
    '$defs': {
        'item': {
            'type': 'object',
            'properties': {
                'id': {'type': ['string', 'null'], 'pattern': '^Q[0-9]+$'},
                'labels': {'type': 'object', 'additionalProperties': {'type': 'string'}},
                'descriptions': {'type': 'object', 'additionalProperties': {'type': 'string'}},
                'aliases': {
                    'type': 'object',
                    'additionalProperties': {'type': 'array', 'items': {'type': 'string'}},
                },
                'statements': {'type': 'array', 'items': {'$ref': '#/$defs/statement'}},
            },
            'required': ['labels'],
            'additionalProperties': False,
        },
        'statement': {
            'type': 'object',
            'required': ['property', 'value'],
            'properties': {
                'property': {'type': 'string', 'pattern': '^P[0-9]+$'},
                'value': {'$ref': '#/$defs/value'},
                'qualifiers': {
                    'type': 'array',
                    'items': {
                        'type': 'object',
                        'required': ['property', 'value'],
                        'properties': {
                            'property': {'type': 'string', 'pattern': '^P[0-9]+$'},
                            'value': {'$ref': '#/$defs/value'},
                        },
                    },
                },
                'references': {
                    'type': 'array',
                    'items': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'required': ['property', 'value'],
                            'properties': {
                                'property': {'type': 'string', 'pattern': '^P[0-9]+$'},
                                'value': {'$ref': '#/$defs/value'},
                            },
                        },
                    },
                },
            },
        },
        'value': {
            'oneOf': [
                {'type': 'object', 'required': ['type', 'id'], 'properties': {
                    'type': {'const': 'item'}, 'id': {'type': 'string', 'pattern': '^Q[0-9]+$'}}},
                {'type': 'object', 'required': ['type', 'value'], 'properties': {
                    'type': {'enum': ['string', 'url']}, 'value': {'type': 'string'}}},
                {'type': 'object', 'required': ['type', 'text', 'language'], 'properties': {
                    'type': {'const': 'monolingual'}, 'text': {'type': 'string'}, 'language': {'type': 'string'}}},
                {'type': 'object', 'required': ['type', 'value'], 'properties': {
                    'type': {'const': 'time'}, 'value': {'type': 'string'}, 'precision': {'type': 'integer'}}},
                {'type': 'object', 'required': ['type', 'amount'], 'properties': {
                    'type': {'const': 'quantity'}, 'amount': {'type': ['number', 'string']}, 'unit': {'type': 'string'}}},
            ],
        },
    },
}


def validate_items_file(path: Path) -> dict:
    raw = json.loads(Path(path).read_text(encoding='utf-8'))
    Draft202012Validator(ITEMS_SCHEMA).validate(raw)
    return raw
