# LanguageDeck — Content Generation Guide (v85)

This is the single reference for creating new deck CSVs. Keep every deck as
simple as possible: the app only *needs* `english` and `target`. Everything
else is optional.

## 1. Word decks — schema

```
english,target,article,hint
```

- `english` — the prompt. MUST be unique within the deck (match rounds break
  on duplicates). Disambiguate with parentheses: `number (of a house, phone)`.
- `target` — the German/Italian answer, lemma only (article goes in `article`).
- `article` — `der` / `die` / `das` for German nouns, empty otherwise.
  A filled article automatically triggers the der/die/das prompt.
- `hint` — the hook/mnemonic. Shown only when the learner taps/clicks Hint, so it never
  spoils the answer. Format: `Hook: <English anchor>. <one short sentence
  explaining the sound/meaning bridge>.` Leave empty if there is no good hook —
  a weak hook is worse than none.

Word-form expansion (plurals, verb forms) belongs in NEW ROWS of the same
4-column format, not new columns:

```
"the house","Haus","das","Hook: house."
"the houses","Häuser","die","Hook: house. Plural with umlaut + -er."
"he sleeps","er schläft","","Hook: sleep. Note the vowel change a→ä."
"he slept","er schlief","","Hook: sleep. Strong verb: schlafen–schlief–geschlafen."
```

## 2. Sentence decks — schema

```
english,target,hint,explanation
```

- One natural sentence per row. `hint` is a short tap/click helper. `explanation` is a fuller English learning note shown after Reveal or a wrong answer.
- File name must contain `sentence` or `pattern` so auto-discovery classifies
  it as a sentences deck (e.g. `german_hooks_sentences.csv`).

## 3. Quality rules for sentences (learned the hard way)

1. **Natural over generated.** Every sentence must be something a German would
   actually say. NO combinatorial templates ("I want to frighten. I can
   frighten. I must frighten…") — 13,000 mechanical rows teach less than 100
   real ones.
2. **Small and curated.** 100–150 sentences per deck. If more material is
   needed, make a second themed deck, not a bigger one.
3. **6–10 words per sentence** for the reorder game sweet spot; a few shorter
   A1 rows and a few longer B1 rows are fine.
4. **Reuse hook vocabulary in context** — sentences should recycle words from
   the word decks so both modes reinforce each other.
5. **Vary grammar deliberately**: present, modal verbs, perfect, subordinate
   clauses, questions, comparatives — but always inside natural sentences.
6. **Proverbs and idioms are gold** (Ende gut, alles gut) — memorable, natural,
   and often hook-rich.
7. Unique `english` values within a deck, `QUOTE_ALL` CSV, comma-separated,
   UTF-8, no BOM needed.

## 4. Reusable generation prompt (paste into a new Claude session)

```
You are generating a sentence deck for LanguageDeck, a German learning PWA.

OUTPUT: a CSV code block with EXACTLY these columns, all fields quoted:
"english","target","hint","level"

RULES:
- 110 rows. Natural, idiomatic German sentences only — things a native
  speaker would really say. No mechanical templates, no near-duplicates.
- Length mostly 6–10 words. Levels: ~35% A1, ~45% A2, ~20% B1.
- Grammar coverage across the deck: present tense, modal verbs,
  perfect tense, separable verbs, subordinate clauses (weil/dass/ob),
  questions, comparatives, imperatives. Mix them; never label-group them.
- Vocabulary: prioritise words from the attached word deck CSV
  (English–German cognates / hooks). Each sentence's "hint" field names
  the hooks used, e.g. "Hooks: water → Wasser, cold → kalt."
- "english" values must be unique within the deck.
- Include 5–8 well-known German proverbs or fixed expressions.
- THEME: <insert theme, e.g. "daily routine", "travel", "food & cooking">

Before writing, silently plan the grammar and level distribution, then
output only the CSV.
```

For word decks, the analogous prompt asks for `"english","target","article","hint"`
and the rule: *"only include a hint when there is a genuine sound or etymology
bridge to English; otherwise leave it empty."*

## 5. Publishing and language folders

The app supports multiple target languages through one source of truth in
`DECK_CONFIG` inside `index.html`. The current production languages are:

- `de` — English → German
- `it` — English → Italian

Deck files live under `decks/<lang>/`. The built-in browser automatically filters
to the language selected in the main study chip, so `decks/de/` files are shown
only while German is active and `decks/it/` files only while Italian is active.

Since v37 the deck browser lists whatever CSV files actually exist under
`decks/<lang>/` in the GitHub repo, live via the GitHub API:

- **Add a deck**: upload the CSV to `decks/de/` or `decks/it/`. Done — it
  appears in the matching language only.
- **Remove a deck**: delete the file on GitHub. It disappears from the list
  automatically (no ghost decks).
- **Hide a work-in-progress deck**: start the file or folder with `_`, or move
  it under a folder named `archive`, `source`, `draft`, `archives`, `sources`,
  or `drafts`. These are ignored by auto-discovery.
- `decks/index.json` is OPTIONAL: it only overrides display names/types for
  files that exist, and serves as an offline fallback. It never resurrects
  deleted files.
- Display names are derived from file names (`german_hooks_sentences.csv` →
  "German Hooks Sentences"), type from the name (`sentence`/`pattern` →
  sentences deck).

To add a new target language later: add a language entry to `DECK_CONFIG`, add a
matching `decks/<lang>/` folder, then upload CSVs using the same simple schemas.

## 6. The deck filter (every German CSV must pass)

Structural checks:
- Header contains `english` and `target`; every row has the full column count.
- No empty english/target pairs.
- `english` values unique within the deck (case-insensitive) — duplicates
  break match rounds. Disambiguate polysemy with parentheses.
- QUOTE_ALL, comma-separated, UTF-8.

Usefulness checks:
- Word decks: `english,target,article,hint` (flashcard-style decks may add
  `type` and `alternatives` when they carry gameplay meaning).
- Sentence decks: `english,target,hint,level`; targets are REAL sentences
  (≥3 words), natural, not combinatorial templates ("This is the X.",
  "I would like to VERB." are banned patterns).
- Hints are learner-facing (hooks, grammar, examples) — provenance notes
  ("From …", "Generated …") are dead weight and must not be added.

Decks that fail the filter are fixed or removed — they are never stored
in `decks/de/` as-is.

## 7. Literary text → deck pair (book mode pipeline)

A literary unit (fairy tale, book chapter, page) becomes a DECK PAIR:

FOLDER SCHEME (v65+): each unit is a FOLDER inside the language directory,
holding exactly two files:

```
decks/de/<unit>/sentences.csv   — english,target,hint,level
decks/de/<unit>/words.csv       — english,target,article,hint,source
```

e.g. `decks/de/public-domain-story-01/`. `source` is the exact
`english` key of the sentence the word came from (this link powers the
combined sentence→word progression). Deck discovery names them
"<Unit> — Sentences" / "<Unit> — Words"; combined mode pairs them by the
shared folder base automatically. Flat `<work>_<unit>_sentences.csv`
naming still works but the folder form is preferred.

Method rules:
- COPYRIGHT FIRST: only public-domain works (in the EU: author died 70+
  years ago). For protected works the pipeline may not be used to
  reproduce the text.
- Retell, don't transcribe: simplify the original prose to the target
  level (A2–B1) in FAITHFUL, natural sentences of mostly 6–12 words that
  follow the story beat by beat. Old orthography is modernized.
- 25–45 sentences per unit; one story beat per sentence; unique english
  keys.
- Word deck: 25–45 KEY words actually used in the sentences (not every
  word); each row's `source` must exactly match a sentence's english key.
- Hints: grammar notes on sentences (separable verbs, Präteritum forms,
  case after prepositions), hooks on words only when genuine.

### Paste-ready prompt

```
You are generating a LanguageDeck "book mode" deck pair from a German
literary text. INPUT: the source text below (public domain only — refuse
protected works). OUTPUT: two CSV code blocks, all fields quoted.

CSV 1 — sentences: "english","target","hint","level"
- Retell the text faithfully, beat by beat, in N natural German
  sentences (N = 25–45 depending on text length), simplified to A2–B1.
- Mostly 6–12 words per sentence; modernize old orthography.
- hint: a short grammar or vocabulary note (verb forms, word order,
  case); empty if nothing genuinely helps.
- level: A2 or B1 per sentence. Unique "english" values.

CSV 2 — words: "english","target","article","hint","source"
- Extract 25–45 KEY vocabulary items that appear in the sentences.
- article: der/die/das for nouns, empty otherwise. Lemma in target.
- hint: only genuine sound/etymology hooks or crucial grammar
  (separable, dative verbs); otherwise empty.
- source: the EXACT "english" value of one sentence containing the word.

Before writing, silently check: unique keys, every source matches a
sentence, QUOTE_ALL, UTF-8.

SOURCE TEXT:
<paste the public-domain text or chapter here>
```

## 8. Rich grammar explanations (Hungarian teaching decks)

Deep grammar decks may carry a multi-part Hungarian explanation. The
authoring source can keep the parts in separate columns, but the app reads
ONE `explanation` column, so they are merged into a single formatted field
at build time.

Source columns (authoring form):
`mondatvaz`, `szorend_miert`, `kozepmezo_logikaja`, `szavak_es_vonzatok`,
`gyors_igeelemzes`.

Merge into the app deck's `explanation` column, preserving line breaks, in
this order and shape (blank line between sections):

```
Mondatváza:
`<mondatvaz>`

Szórend – miért így:
<szorend_miert>

A középmező logikája:
<kozepmezo_logikaja>

Szavak és vonzatok:
<szavak_es_vonzatok>

Gyors igeelemzés:
<gyors_igeelemzes>
```

Rules:
- Write the deck as `english,target,hint,explanation,level`, QUOTE_ALL, UTF-8.
- Explanations MUST keep their newlines — the app renders them with
  `white-space: pre-wrap`; a single-line collapse (as a plain hint cleaner
  would do) destroys the Mondatváza/Mittelfeld structure.
- Sentence frames go in backticks so they read as a unit.
- Unique `english` keys (disambiguate identical glosses, e.g. weil vs denn
  variants) — the app keys sentences by english.


## 9. v85 language-pack structure

New packs are discovered from `decks/languages.json`. Each language contains `language.json`, `manifest.json`, a shared `lexicon.csv`, a canonical `patterns.csv`, and the folders `words/`, `grammar/`, `sentences/`, and `texts/`. File names are no longer the authority for mode classification; the manifest is. Legacy root CSVs remain supported.

Global lexical identity uses a sense-aware `lexeme_id`. A unit-local `w001` must never be used as a shared progress key. Homonyms use distinct suffixes, for example `de.noun.bank.financial` and `de.noun.bank.bench`.

## 10. Text-unit schema

A Text unit requires `sentences.csv` and should include `unit.json` and `words.csv`. It may include `anchors.csv`.

```
"id","seq","scene","english","target","hint","explanation","chunks","pattern","level"
```

```
"id","lexeme_id","english","target","article","hint","source_id","forms","kind"
```

`forms` lists every surface form used in the unit. `chunks` is authored structural segmentation, never automatic comma splitting. Ambiguous anchors use `sentence_id,surface,occurrence,item_id`. See `READING_MODE_IMPLEMENTATION_v3.md` in the package root for the full engine contract.

## 11. Language Pack Builder

Open `pack-builder.html` to produce a package plan, staged AI master prompt, starter ZIP, merged CSV batches and a validation report. Large vocabulary packs must be generated in batches and frequency order must come from a supplied reliable frequency list.

## 12. v87 Story Study units

A Story Study unit is selected by data, not by a hard-coded deck name. Its
`unit.json` declares:

```json
{
  "schemaVersion": 2,
  "engine": "story-study",
  "defaultCoverage": "complete",
  "defaultGoal": "use",
  "translationMode": "always"
}
```

The learning loop is adaptive: pre-teach → read 3–6 connected sentences →
Words practice → Sentences practice → clean reread → continue. Build up,
Study, and Read are engine-selected rhythms; coverage and learning goal remain
separate learner choices.

For `defaultCoverage: complete`, every word-like token in `target` must resolve
to one `words.csv` row as a `word`, `phrase`, `function`, or `name`. A list of
only key vocabulary is invalid. Articles, auxiliaries, pronouns, conjunctions,
inflected forms, separable verbs, and multi-word expressions must all resolve.
Every sentence should have authored `chunks` for beginner-friendly sentence
reconstruction.

A portable import ZIP contains these files at any common root:

```text
unit.json
sentences.csv
words.csv
anchors.csv
patterns.csv
lexicon.csv
```

`patterns.csv` contains every pattern used by the portable unit. `lexicon.csv`
contains every introduced `lexeme_id`. Open `pack-builder.html`, validate the
completed folder, then use **Download importable Story ZIP**. In the app choose
**Import deck → Story Study ZIP**.
