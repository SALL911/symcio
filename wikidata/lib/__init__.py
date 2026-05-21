"""Wikidata automation library for Symcio."""

from .client import WikidataClient
from .schema import validate_items_file

__all__ = ['WikidataClient', 'validate_items_file']
