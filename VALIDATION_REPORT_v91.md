# LanguageDeck v91 validation report

**Build:** `v91-course-core-20260727`  
**Date:** 2026-07-27

## Automated results

### JavaScript syntax

`node --check` passed for all inline scripts extracted from:

- `index.html`
- `practice.html`
- `story-study.html`
- `course-builder.html`
- `pack-builder.html`
- `reset.html`

### Static/data validation

`tools/validate-v91.py` result:

```
OK=15
WARN=3
ERROR=0
```

Verified:

- 3,582 unique POS-independent canonical lexemes;
- 4,097 old-to-canonical aliases, with no missing targets or cycles;
- every included German Words deck row has a resolving `lexeme_id`;
- Maja and Sterntaler legacy Story Study word files also resolve;
- all three Baker Street chapters have continuous sentence order, authored chunks and valid source IDs;
- all anchors point to existing sentences and word items;
- all story chapter counts and section counts match `story.json`;
- all service-worker application-shell assets exist;
- no book-level target/ID conflicts in the mini-arc.

Warnings are expected preparation splits:

- ch01 scene 1: 11 first-seen lexemes → two batches by source attribution;
- ch01 scene 7: 17 first-seen lexemes → two batches;
- ch02 scene 1: 12 first-seen lexemes → two batches.

The actual Course token/form matcher, which excludes names and handles anchors, produces two batches for ch01 scene 7 and ch02 scene 4; all other scenes fit one ten-word batch.

### Story Study loader

The patched real `loaderBuild` was executed against all chapter files:

| chapter | sentences | resolved vocabulary | unknown tokens | sections |
|---|---:|---:|---:|---:|
| ch01 | 29 | 67 | 0 | 7 |
| ch02 | 31 | 84 | 0 | 6 |
| ch03 | 33 | 93 | 0 | 6 |

All chapters reached **0 unresolved tokens**.

### HTML structure

Parsed HTML checks found:

- no duplicate element IDs;
- one main content region on each primary app page;
- valid titles and expected interactive controls.

## Manual test still required

The container’s Chromium is blocked from navigating to localhost, custom hostnames and `file://` URLs by administrator policy. As a result, a full live browser and PWA service-worker pass could not be completed here.

Before production deployment, test on the actual phone and desktop for:

1. first-load IndexedDB migration;
2. Course → preparation → Story Study navigation;
3. section-boundary block behaviour;
4. chapter completion and next-chapter selection;
5. Words ↔ Story Study knowledge synchronisation;
6. PWA update and offline cache;
7. GitHub discovery after uploading a second story package;
8. Course Builder folder validation and downloaded ZIP structure.
