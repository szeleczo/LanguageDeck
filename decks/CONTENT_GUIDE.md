# LanguageDeck — Content Generation Guide (v37)

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
- `hint` — the hook/mnemonic. Shown only on long-press (peek), so it never
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
english,target,hint,level
```

- One natural sentence per row. `hint` lists the hooks used; `level` is A1–B1.
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

## 5. Publishing (no index.json editing needed)

Since v37 the deck browser lists whatever CSV files actually exist under
`decks/<lang>/` in the GitHub repo, live via the GitHub API:

- **Add a deck**: upload the CSV to `decks/de/` (or `decks/it/`) via the
  GitHub web UI. Done — it appears in the app automatically.
- **Remove a deck**: delete the file on GitHub. It disappears from the list
  automatically (no ghost decks).
- `decks/index.json` is now OPTIONAL: it only overrides display names for
  files that exist, and serves as an offline fallback. It never resurrects
  deleted files.
- Display names are derived from file names (`german_hooks_sentences.csv` →
  "German Hooks Sentences"), type from the name (`sentence`/`pattern` →
  sentences deck).

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

- `<work>_<unit>_sentences.csv` — `english,target,hint,level`
- `<work>_<unit>_words.csv` — `english,target,article,hint,source`
  where `source` is the exact `english` key of the sentence the word came
  from (this link powers the combined sentence→word progression).

Naming: `grimm_sterntaler_…`, `maja_k01_…` — filenames containing
"sentences"/"words" are auto-typed by deck discovery.

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
