# LanguageDeck roadmap

Current direction after 4.5.5. This file is part of the repository so product direction does not get lost between implementation rounds.

## 4.4.15 — shared knowledge / Adaptive stabilisation

Completed baseline. Adaptive Words, Story readiness and the shared lexeme store must describe one knowledge state. First-contact assistance is only for genuinely new words; a normal lapse drops one Adaptive level and never activates a hidden rescue difficulty.

## 4.5.0 — Library / reading goals

Completed first read-only Library. It measures lexical readability from shared knowledge, exposes blocking lexemes and estimates which targeted words unlock the most sentences. Library analysis must not mutate the learning queue or create a second knowledge state.

## 4.5.1 — cross-device UI parity and Progress Pack

Completed. Desktop and mobile practice use the same Command Pill and the same language / mode / exercise / deck switching path. Progress transfer is local-first and versioned: Progress Pack moves practice state, shared Story knowledge, Text progress and chapter positions with conflict-aware merging. Missing-deck progress is retained rather than discarded.

## 4.5.2 — first-contact learning flow

Completed stabilisation release. A clean one-letter FIRST CONTACT answer advances directly from Adaptive L1 to L2. Corrected/mistap answers hold the current level; misses still fall by exactly one real level. Shared Story/Library knowledge follows the same final Adaptive level.

## 4.5.3 — unified recall evidence and typing clarity

Completed stabilisation release. Book vocabulary recall routes through the same Adaptive Words Progressive engine instead of a parallel 0–4 word drill. A lexeme keeps one shared record but separates reading recognition from active-recall strength. Grammar/Sentence context does not raise Adaptive recall. A genuine Story “I do not know this” tap still demotes Adaptive by exactly one level.

## 4.5.4 — unified typing slots

Completed stabilisation release. Full typing reuses the same Adaptive slot renderer with zero helper letters. Typed characters fill their slots live while the remaining character slots stay visible across Words, Sentence/Grammar and Text/Book typing.

## 4.5.5 — continuous gate recall + real interleave

Current stabilisation release. A completed Adaptive Words gate no longer dead-ends on `Done`: when normal due material is exhausted, the learner may continue inside the same gate in true L5/full-typing recall. Re-entering a completed gate also resumes this full-recall stream.

A lexical miss is no longer spliced back into a short queue. It is deferred until at least two other word answers have occurred, so a difficult word cannot ladder L1→L4 through immediate short-term echo at the end of a gate. Completed-gate L5 cards can provide the interleaving material.

## 4.5.6 — QR nearby Progress Pack transfer

Next sync UX experiment. QR should be used to pair two devices, not to squeeze the whole learning database into a single QR code. The existing versioned Progress Pack remains the payload and conflict-aware merge layer.

Preferred interaction: desktop shows a pairing QR → phone scans it with the rear camera → phone shows the response QR → desktop scans it with the webcam → the Progress Pack transfers directly peer-to-peer. The same flow works in reverse. No account or permanent cloud copy is required; the existing file export/import remains as fallback.

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
- A failed recall must be separated from its targeted retry by other material when alternatives exist; no immediate level laddering through short-term echo.
- New features should not regress offline use, existing reading position, Adaptive scheduling or deck compatibility.
