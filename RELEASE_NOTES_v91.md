# LanguageDeck v91 — Baker Street Course Core

**Release date:** 2026-07-27  
**Focus:** whole-story courses, shared knowledge, guided preparation and GitHub-ready story authoring

## What changed

### Course-first application shell

`index.html` is now the guided Course home. The former full trainer remains intact as `practice.html` and is always reachable from the Practice tab.

The first screen answers one question: **what should I do next?** It shows the current chapter and section, shared-readiness estimate, required words, new grammar and a direct Prepare and read action.

### Whole-story structure

The new hierarchy is:

```
STORY      story.json
 CHAPTER   standard Story Study unit folder
  SECTION  authored scene value in sentences.csv
   BLOCK   adaptive 3–6 sentence engine cycle
```

A story can contain an entire novel or collection. Chapters load independently, sections remain meaningful stopping points, and the existing adaptive Story Study block remains small.

### Global language knowledge

Word and grammar knowledge is stored per language in IndexedDB and shared across chapters, stories and the Words engine.

- Words learned in one Story Study chapter are recognised in later chapters.
- Words learned in the Words mode affect Course preparation and Story Study.
- Sentence state and reading position remain chapter-specific.
- Restarting a chapter keeps shared vocabulary.
- Erasing shared German knowledge is a separate, explicit action.
- Existing `ld-story-study-v3:*` progress is migrated and merged by maximum achieved level.

### Stable v91 lexeme IDs

Canonical IDs no longer depend on part of speech:

```
de.lex.lesen
de.lex.bank.financial
de.lex.bank.bench
```

The `pos` and `sense` columns carry linguistic classification. `aliases.csv` maps old IDs to canonical IDs so existing progress can follow the migration.

All included German Words and Story Study word files now contain `lexeme_id`, and all references resolve to the shared lexicon.

### Preparation station

Before each section, Course prepares only the words and grammar not yet recognised globally.

- Lexemes are prioritised by a lightweight sentence-unlock score.
- Recognition is installed at level 2; Story Study deepens it toward Use.
- Grammar is previewed before the text without requiring mastery.
- More than ten new words are divided into consecutive preparation batches.
- Preparation remains skippable.

### Baker Street Launchpad mini-arc

A complete connected A0 mini-arc is included:

1. **Der Mann im Nebel** — A0.1, 29 sentences, 7 sections
2. **Der Brief ohne Namen** — A0.2, 31 sentences, 6 sections
3. **Die Tür im Hof** — A0.3, 33 sentences, 6 sections

The recurring protagonist is amateur detective **Emil Falk**. The tone is tense, intelligent and non-graphic.

### Story Course Builder

`course-builder.html` replaces the single-unit mental model for long works.

It can:

- create a strict full-book generation prompt;
- require complete narrative and source coverage;
- generate a GitHub-rooted starter ZIP;
- validate `story.json` and chapter units;
- check continuous chapter order, files, IDs, anchors, patterns and source mapping;
- inspect cross-chapter lexeme consistency;
- count first-seen lexemes per scene and calculate preparation batches;
- verify against the global lexicon when the full repository is selected;
- download a validated ZIP rooted at `decks/<language>/stories/<story-id>/`.

The Course screen automatically discovers `decks/<language>/stories/*/story.json` on GitHub Pages. A newly uploaded story package therefore appears in the story selector without a manual manifest edit.

### Performance

The Story Study loader now sorts forms once and indexes them by first token rather than scanning the whole vocabulary blindly for every sentence. The output token binding remains unchanged, while long chapter loading is substantially faster.

## Compatibility

- Existing single-unit Story Study packages remain supported.
- Existing `manifest.json` Text units remain supported in `practice.html`.
- Existing per-unit progress is retained and migrated.
- The old Pack Builder remains available as `pack-builder.html`.

## Known limitations

- The current release targets reading, vocabulary, grammar and sentence work; it does not attempt listening, pronunciation or free speaking.
- Lexicon `rank` and CEFR `level` are structurally supported but not yet populated from a cited external frequency source.
- `LEXICON_REVIEW_NEEDED_v91.csv` contains 91 remaining sense/near-synonym groups for later human review.
- A live Chromium pass could not run in the build environment because browser navigation is blocked administratively. JavaScript syntax, file structure, loader output, token resolution, IDs and data integrity were tested separately. A real-device pass is still required before treating the release as final production.
