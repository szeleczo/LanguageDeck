# Validation Report — v91.1 Unified Course Shell

## Result

- Data/static validator: 15 OK, 3 content-load warnings, 0 errors.
- Inline JavaScript syntax: passed for `index.html`, `practice.html`, `story-study.html`, `course-builder.html`, and `pack-builder.html`.
- Unified shell integrity checks: passed.
- Service-worker shell: every declared asset exists.
- Canonical lexicon, aliases, Words decks and all three Baker Street chapters: passed existing v91 validation.

## UI checks

Headless Chromium successfully rendered, at a 390 × 844 mobile viewport:

- Course Settings sheet in dark mode;
- Course Practice hub;
- full Practice page with shared Course / Book / Practice navigation.

The environment blocks browser navigation to localhost and file URLs, so a complete live-fetch navigation test could not be performed here. The real PWA update and cross-page state should still be checked once on the target phone.

## Expected content warnings

Three early scenes contain more than ten first-seen lexemes. The Course preparation engine already splits these into two short batches; they are not validation errors.
