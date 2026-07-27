# v91 migration notes

## Application entry points

- New guided home: `index.html`
- Full previous trainer: `practice.html`
- Story reading engine: `story-study.html`

Existing links that opened `index.html` now enter Course. Free Words, Grammar, Sentences and Text practice remains one tap away.

## Knowledge migration

On first Story Study load for a language, v91:

1. scans existing `ld-story-study-v3:<language>:<unit>` localStorage records;
2. resolves old IDs through `aliases.csv`;
3. merges duplicate states using the highest achieved level;
4. writes shared word knowledge to IndexedDB `reading_items`;
5. writes shared grammar knowledge to `reading_patterns`;
6. keeps sentence state and chapter position in the original chapter-specific localStorage record.

The old records are not destructively deleted in this release. This gives a rollback path while the migration is being tested.

## Reset behaviour

- **Erase chapter progress:** resets reading position and sentence state for the current chapter only.
- **Erase German knowledge:** clears shared word and grammar knowledge but leaves chapter positions intact.

These actions are intentionally separate.
