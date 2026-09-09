# LanguageDeck roadmap

Current direction after 4.5.4. This file is part of the repository so product direction does not get lost between implementation rounds.

## 4.4.15 — shared knowledge / Adaptive stabilisation

Completed baseline. Adaptive Words, Story readiness and the shared lexeme store must describe one knowledge state. First-contact assistance is only for genuinely new words; a normal lapse drops one Adaptive level and never activates a hidden rescue difficulty.

## 4.5.0 — Library / reading goals

Completed first read-only Library. It measures lexical readability from shared knowledge, exposes blocking lexemes and estimates which targeted words unlock the most sentences. Library analysis must not mutate the learning queue or create a second knowledge state.

## 4.5.1 — cross-device UI parity and Progress Pack

Completed. Desktop and mobile practice use the same Command Pill and the same language / mode / exercise / deck switching path. Progress transfer is local-first and versioned: Progress Pack moves practice state, shared Story knowledge, Text progress and chapter positions with conflict-aware merging. Missing-deck progress is retained rather than discarded.


## 4.5.2 — first-contact learning flow

Completed stabilisation release. A clean one-letter FIRST CONTACT answer is treated as real successful evidence: the word advances directly from Adaptive L1 to L2. This removes the redundant second L1 pass while keeping the first-contact card friendly. Corrected/mistap answers still hold the current level, and misses still fall by exactly one real level. Shared Story/Library knowledge follows the same final Adaptive level.


## 4.5.4 — unified typing slots

Current stabilisation release.

- Full typing now reuses the same Adaptive clue renderer instead of a separate underscore/placeholder surface.
- Full typing is represented as an all-masked pattern with zero helper letters.
- Typed characters fill their slots live while the remaining character slots stay visible.
- The same slot behavior applies across Words, Progressive full recall, Sentence/Grammar typing blanks, and Text/Book typing.

## 4.5.3 — unified recall evidence and typing clarity

Completed stabilisation release. Book vocabulary recall now routes through the same Adaptive Words Progressive engine instead of a parallel 0–4 word drill. A lexeme keeps one shared record but separates reading recognition from active-recall strength: recognition can support Story/Library readiness but cannot raise Adaptive recall, while Grammar/Sentence context remains contextual evidence only. A genuine Story “I do not know this” tap still demotes Adaptive by exactly one level. Every typing task, in every mode and level, shows the expected answer length with underscores without revealing letters.

## 4.6 — Prepare for this text

Turn a Library reading goal into a temporary priority signal for the existing Adaptive Words engine. The selected chapter/story may raise the relevance of already existing lexemes, but it must not create a separate scheduler, duplicate lexeme state or book-specific knowledge database.

Expected flow: choose a story/chapter → see current readiness → choose Prepare for this → practise the highest-value missing lexemes in the normal learning engine → return to the text when the readiness target is reached.

## 4.7 — UI language foundation

Separate `uiLang`, `targetLang` and `sourceLang`. Introduce a real `t()` translation layer, Hungarian/English UI switching, target-language-aware labels, correct `html lang`, language-specific keyboard configuration and manifest-driven offline behaviour. Grammar explanations follow `uiLang`, not the card source language.

Do not add Italian/Spanish content as a workaround for missing language architecture; make language expansion a content task after the foundation is stable.

## 4.8 — Grammar redesign

Rebuild the grammar curriculum around fewer, stronger units and genuinely targeted production/contrast practice (for example Akkusativ/Dativ), using the shared knowledge architecture and the completed UI-language layer.

## Product constraints

- One global lexeme record across Words, Story, Library and future preparation goals, with separate recognition and active-recall evidence rather than duplicate mode-owned knowledge.
- Library is a consumer of knowledge; 4.6 may influence priority, not ownership of knowledge.
- Desktop and mobile share components and behaviour. Responsive layout may change geometry, not available core controls.
- Cross-device progress transfer must merge safely and never silently discard unmatched progress.
- Prefer simpler observable learning rules over hidden rescue/session state.
- New features should not regress offline use, existing reading position, Adaptive scheduling or deck compatibility.
