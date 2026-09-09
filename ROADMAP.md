# LanguageDeck roadmap

Current direction through 4.5.14. This file is part of the repository so product direction does not get lost between implementation rounds.

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

The 4.5.6 prototype proved the camera/QR interaction, but its complete-Progress-Pack QR payload did not scale. 4.5.9 introduced a compact per-peer delta. 4.5.10 keeps that delta format but moves it over a temporary direct local peer connection by default, using QR only for the offer/answer handshake. File export/import remains the durable full-state fallback, and rotating delta QR remains a network-independent fallback.

Desktop Free Practice now uses the same Study chrome as mobile rather than the old landscape/desktop branch. Command Pill dimensions and controls are shared, and the gate navigator lives in the integrated Study Shell so previous/next gate navigation is available on desktop as well as mobile. Responsive layout may resize/centre this chrome, but may not remove these controls.

## 4.5.7 — Word recall input tolerance

- Vocabulary typing and Adaptive L5/full recall are case-insensitive.
- Missing/extra spaces and presentation punctuation do not create false mistakes.
- Required articles and actual letters/diacritics remain significant.
- Sentence production keeps stricter spacing rules.

## 4.5.12 — QR modal responsive hotfix

Status: completed stabilisation hotfix. The camera-transfer modal explicitly overrides the generic 380px modal width cap on desktop, uses border-box sizing, prevents horizontal overflow and keeps the full QR plus controls inside the viewport. Mobile keeps the same component with viewport-safe margins rather than a separate transfer UI.

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

## 4.5.9 — Compact per-peer progress delta

Status: completed, transport superseded by 4.5.10.

4.5.9 established the important data layer: device identity, per-peer receive watermarks, a compact Words/Adaptive + Grammar/Sentence + Story/Book delta, checksums, and conflict-aware merge. The rotating QR transport remains available as a fully offline fallback, but it is not the preferred path for a large first hand-off.

## 4.5.10 — Nearby direct progress hand-off

Status: completed.

The default transfer is still occasional, not continuous sync. There is no account, backend, signalling server, STUN server or TURN relay. QR is used only to exchange a temporary WebRTC offer/answer; the compact progress delta itself travels over an encrypted DataChannel and the peer connection is closed immediately after the hand-off.

Flow:

1. The receiving device chooses **Receive progress** and shows a direct-connection request QR. The request contains its local receive watermarks but no learning data.
2. The sending device chooses **Send progress**, scans that QR, creates a one-time answer QR and prepares only the progress changed since the receiver last accepted data from this sender.
3. The receiver scans the answer QR. On the same Wi-Fi/local network the two browsers establish a direct DataChannel and the delta transfers in seconds rather than hundreds of camera frames.
4. The receiver verifies the checksum, previews the Progress Pack summary and explicitly merges it with the existing conflict-aware merge engine. The connection then closes.

If local peer connectivity is blocked by the router/browser/firewall, **QR-only fallback** still sends the same compact delta as rotating QR frames. Full `.ldprogress` export/import remains the durable full-state backup and first-sync fallback.

4.5.10 also repairs the 4.5.9 date-wire regression: practice schedule timestamps decoded from compact transport are stored as ISO timestamps again, and any numeric date fields already imported into Words/Sentence rows are repaired once on startup. Queue due-ordering is hardened to compare timestamps rather than calling string-only methods.

Camera policy remains local-first: `getUserMedia()` is requested before decoder capability checks. Native BarcodeDetector is preferred; otherwise LanguageDeck uses the pinned jsQR fallback. Camera frames and learning progress are not uploaded.

## 4.5.11 — QR visibility + clean import recovery

Status: completed stabilisation hotfix.

- Transfer QR codes render as explicit black/white SVG modules in a fixed visible square rather than relying on a canvas that could appear blank in desktop browsers. The renderer self-checks that the QR contains visible dark modules.
- Progress Pack and QR/direct-transfer merges no longer try to patch-refresh a live Study queue after the database has changed. After a successful merge, LanguageDeck stores the data, closes the transfer, and performs a clean app reload so gate/queue/current-card state is rebuilt from one consistent database snapshot.
- A fresh one-time 4.5.11 repair pass rechecks practice rows for numeric date fields left by the failed 4.5.9 transport, even if the earlier 4.5.10 repair marker had already run. New merges normalise incoming practice dates before writing.

## Next — 4.6 “Prepare for this”

The Library can prioritise vocabulary from a selected story/chapter through the existing Adaptive Words engine. It must not create a second knowledge system.

## 4.5.13 — Desktop shortcuts + clean masked input

- Desktop masked/full progressive recall uses the same visible slot surface as mobile; the redundant `Missing letters only` text field is hidden while the physical keyboard still writes into the focused input.
- `Enter` = Check / Continue.
- `Ctrl/Cmd + Enter` = Reveal / Solution.
- `Ctrl/Cmd + Backspace` (or Delete) = Clear / Reset.
- Existing number-key shortcuts for choice/match/order remain unchanged.
- Action buttons expose shortcut hints through their titles/tooltips.
- Nearby transfer remains an occasional one-shot hand-off in 4.5.x; an optional live-sync-while-connected mode is a future UX choice, not required for 4.6.


## 4.5.14 — Robust nearby transfer fallback

Direct QR-signalled WebRTC remains the fastest serverless path when the browser/network exposes compatible local ICE candidates. Some desktop Brave/Windows + Android Wi-Fi combinations hide host addresses behind mDNS or block local peer UDP, so direct transfer can legitimately fail even on the same SSID. 4.5.14 surfaces candidate availability and no longer leaves the flow at a dead-end failure: the sender reuses the already-scanned receive request and automatically switches to the compact per-peer QR delta; the receiver is offered a one-click QR-only scan fallback. No STUN, TURN, backend, account or cloud relay is added.
