# LanguageDeck roadmap

Current direction through 4.5.9. This file is part of the repository so product direction does not get lost between implementation rounds.

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

Completed stabilisation release. A completed Adaptive Words gate no longer dead-ends on `Done`: when normal due material is exhausted, the learner may continue inside the same gate in true L5/full-typing recall. Re-entering a completed gate also resumes this full-recall stream.

A lexical miss is no longer spliced back into a short queue. It is deferred until at least two other word answers have occurred, so a difficult word cannot ladder L1→L4 through immediate short-term echo at the end of a gate. Completed-gate L5 cards can provide the interleaving material.

## 4.5.6 — first camera-transfer prototype + desktop/mobile Study parity

Completed prototype, superseded on the transport side by 4.5.9. Progress transfer is an occasional snapshot handoff, not a persistent sync relationship. The payload is the existing conflict-aware Progress Pack: practiced word/Adaptive state, sentence and grammar-package practice state, shared lexical/pattern knowledge, Text/Reading progress and Story/chapter/session position. No deck/book content and no account are required.

The 4.5.6 prototype proved the camera/QR interaction, but its complete-Progress-Pack QR payload did not scale. 4.5.9 replaces that transport with a compact per-peer delta while keeping the same conflict-aware Progress Pack merge. File export/import remains the durable full-state fallback.

Desktop Free Practice now uses the same Study chrome as mobile rather than the old landscape/desktop branch. Command Pill dimensions and controls are shared, and the gate navigator lives in the integrated Study Shell so previous/next gate navigation is available on desktop as well as mobile. Responsive layout may resize/centre this chrome, but may not remove these controls.

## 4.5.7 — Word recall input tolerance

- Vocabulary typing and Adaptive L5/full recall are case-insensitive.
- Missing/extra spaces and presentation punctuation do not create false mistakes.
- Required articles and actual letters/diacritics remain significant.
- Sentence production keeps stricter spacing rules.

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
- Cross-device progress transfer must merge safely and never silently discard unmatched progress. Camera transfer must remain serverless and occasional. QR carries compact changed-state deltas; the full Progress Pack remains the durable backup/initial-transfer fallback. It is never a persistent sync service.
- Prefer simpler observable learning rules over hidden rescue/session state.
- A failed recall must be separated from its targeted retry by other material when alternatives exist; no immediate level laddering through short-term echo.
- New features should not regress offline use, existing reading position, Adaptive scheduling or deck compatibility.


## 4.5.8 — Desktop input parity

Status: completed.

- Desktop and mobile keep the same Study Shell / Command Pill / gate navigator.
- Word and sentence typing use Enter for Check and Enter again for Continue after feedback.
- Sentence Order exposes 1–9/0 shortcuts for the currently available word bank, Enter to check/continue, and Backspace/Delete to remove the last placed word.
- The language-defined keyboard is no longer touch-only: desktop keeps the physical keyboard and gets a compact supplemental strip for target-language characters such as ä/ö/ü/ß or Italian accented vowels.

## 4.5.9 — Serverless delta QR progress transfer

Status: completed.

The QR feature is an occasional hand-off, not a persistent sync connection. There is no account, backend, signalling service, WebRTC session, or requirement that the devices share a network.

Flow:

1. The receiving device chooses **Receive progress** and shows one small request QR containing only its local device id and previous receive watermarks.
2. The sending device chooses **Send progress**, scans that request with its camera, and calculates only the Words/Adaptive, Grammar/Sentence, shared Story/Book knowledge and chapter/session state changed since the receiver last accepted progress from this sender.
3. The sender displays the compact delta as a repeating QR sequence.
4. The receiver scans the sequence, verifies its checksum, previews the Progress Pack summary and explicitly merges it with the existing conflict-aware Progress Pack engine.

The first QR exchange between two devices may contain more frames because there is no prior watermark. Later transfers are deltas. Full `.ldprogress` export/import remains the durable backup and first-sync fallback.

Camera policy: getUserMedia is requested before decoder capability checks, so a missing browser `BarcodeDetector` cannot suppress the webcam permission prompt. Native BarcodeDetector is preferred; otherwise LanguageDeck uses a pinned jsQR decoder. The GitHub installer vendors the pinned decoder into the repository. A directly opened full archive can fetch the same pinned decoder once and cache it locally. QR image data and learning progress are decoded on-device and are never uploaded.

## Next — 4.6 “Prepare for this”

The Library can prioritise vocabulary from a selected story/chapter through the existing Adaptive Words engine. It must not create a second knowledge system.
