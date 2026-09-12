# LanguageDeck roadmap

Current direction through 4.5.22. This file is part of the repository so product direction does not get lost between implementation rounds.

## 4.4.15 — shared knowledge / Adaptive stabilisation

Completed baseline. Adaptive Words, Story readiness and the shared lexeme store must describe one knowledge state. First-contact assistance is only for genuinely new words; a normal lapse drops one Adaptive level and never activates a hidden rescue difficulty.

## 4.5.0 — Library / reading goals

Completed first read-only Library. It measures lexical readability from shared knowledge, exposes blocking lexemes and estimates which targeted words unlock the most sentences. Library analysis must not mutate the learning queue or create a second knowledge state.

## 4.5.1 — cross-device UI parity and merge foundation

Completed historical foundation. Desktop and mobile practice use the same Command Pill and the same language / mode / exercise / deck switching path. This release established conflict-aware progress merging across practice state, shared Story knowledge, Text progress and chapter positions. Missing-deck progress is retained rather than discarded. The former user-facing file-transfer format built on this foundation was retired in 4.5.20; the merge layer remains internal to Live sync.

## 4.5.2 — first-contact learning flow

Completed stabilisation release. A clean one-letter FIRST CONTACT answer advances directly from Adaptive L1 to L2. Corrected/mistap answers hold the current level; misses still fall by exactly one real level. Shared Story/Library knowledge follows the same final Adaptive level.

## 4.5.3 — unified recall evidence and typing clarity

Completed stabilisation release. Book vocabulary recall routes through the same Adaptive Words Progressive engine instead of a parallel 0–4 word drill. A lexeme keeps one shared record but separates reading recognition from active-recall strength. Grammar/Sentence context does not raise Adaptive recall. A genuine Story “I do not know this” tap still demotes Adaptive by exactly one level.

## 4.5.4 — unified typing slots

Completed stabilisation release. Full typing reuses the same Adaptive slot renderer with zero helper letters. Typed characters fill their slots live while the remaining character slots stay visible across Words, Sentence/Grammar and Text/Book typing.

## 4.5.5 — continuous gate recall + real interleave

Completed stabilisation release. A completed Adaptive Words gate no longer dead-ends on `Done`: when normal due material is exhausted, the learner may continue inside the same gate. The original 4.5.5 implementation forced every continuation card to L5/full typing; 4.5.16 corrects that over-interpretation so continuation always respects the real Adaptive level.

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
- Cross-device progress must merge safely and never silently discard unmatched progress. As of 4.5.20, **Live sync is the only user-facing cross-device transfer path**. QR is used only for the temporary WebRTC offer/answer handshake; progress itself moves over the encrypted peer DataChannel. There is no account, persistent sync service, signalling backend, STUN or TURN relay. Internal conflict-aware merge, unmatched-state retention and old-date repair remain data-safety infrastructure, not alternative transfer modes.
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

## 4.5.15 — unified slot-only typing surface

Status: completed stabilisation hotfix.

- Every typing task that already shows Adaptive-style live character slots now uses those slots as the single visible answer surface on desktop and touch.
- The underlying HTML input/textarea remains focusable for physical-keyboard input, but `Full answer`, `Missing letters only`, sentence blank fields and Text/Book typing fields are no longer rendered as a second visible box.
- Words Typing, Adaptive masked/full recall, Sentence/Grammar progressive typing, sentence blank typing and Text/Book typing all use the same hidden-input binding helper.
- Clicking/tapping the visible slot surface returns focus to the hidden input; desktop shows focus on the slot surface itself rather than on an invisible field.


## 4.5.16 — adaptive completed-gate continuation

Status: completed stabilisation correction.

- A completed gate still never dead-ends on `Done`; practice can continue indefinitely inside the gate.
- Continuation is no longer a synthetic L5 mode. Every card is rendered from its current stored Adaptive level.
- An L5 word therefore returns naturally as full typing. If the learner is wrong or uses Reveal, the normal one-level lapse applies (for example L5 → L4), and its later targeted return is genuinely L4 rather than being forced back to full typing.
- Continuation preferentially draws from the strongest real Adaptive level available in the gate. If a legacy/completed gate has no L5 rows, it continues at the strongest level that actually exists instead of inventing L5.
- The two-other-answer interleave rule remains unchanged, so a demoted word cannot immediately ladder upward through short-term echo.


## Next — 4.6 “Prepare for this”

The Library can prioritise vocabulary from a selected story/chapter through the existing Adaptive Words engine. It must not create a second knowledge system.

## 4.5.13 — Desktop shortcuts + clean masked input

- Desktop masked/full progressive recall uses the same visible slot surface as mobile; the redundant `Missing letters only` text field is hidden while the physical keyboard still writes into the focused input.
- `Enter` = Check / Continue.
- `Ctrl/Cmd + Enter` = Reveal / Solution.
- `Ctrl/Cmd + Backspace` (or Delete) = Clear / Reset.
- Existing number-key shortcuts for choice/match/order remain unchanged.
- Action buttons expose shortcut hints through their titles/tooltips.
- Historical note: one-time Nearby transfer existed in this release line but was retired in 4.5.20 after Live sync proved functional.


## 4.5.14 — Robust nearby transfer fallback

Direct QR-signalled WebRTC remains the fastest serverless path when the browser/network exposes compatible local ICE candidates. Some desktop Brave/Windows + Android Wi-Fi combinations hide host addresses behind mDNS or block local peer UDP, so direct transfer can legitimately fail even on the same SSID. 4.5.14 surfaces candidate availability and no longer leaves the flow at a dead-end failure: the sender reuses the already-scanned receive request and automatically switches to the compact per-peer QR delta; the receiver is offered a one-click QR-only scan fallback. No STUN, TURN, backend, account or cloud relay is added.


## 4.5.17 — adaptive gate rotation + serverless local peer hardening

Completed stabilisation release. Completed-gate review remains inside the Adaptive/Progressive engine even when the visible task is full typing. A wrong L5 answer therefore persists as L4 and the later return uses the real L4 mask. Normal continuation fillers rotate across the whole eligible gate before repeating, while targeted lapse returns may interrupt after the existing two-other-answer cooldown.

The serverless local peer path is also hardened without adding STUN/TURN/backend services: the receiving desktop primes webcam/local-media permission before gathering its WebRTC offer, the peer connection uses the browser's default bundling with `iceTransportPolicy: all`, and diagnostics distinguish direct host candidates from privacy-obscured mDNS candidates. The older QR-only and file fallbacks described by this historical release were retired in 4.5.20.

The next sync step is 4.5.19 (`Live sync while connected`). The next main learning-product milestone remains 4.6 (`Prepare for this`).


## 4.5.18 — completed-gate review diversity fix

Completed-gate Adaptive review now uses whole-gate rotation as its primary queue source. The normal due/intake selector no longer gets first chance to refill the queue in this state, preventing a small active/due subset from monopolising the session. Eligible targeted lapse returns still interrupt after the existing two-other-answer cooldown, but otherwise a filler row is not repeated until the current gate rotation has been exhausted.

The rotation cycle is not reset merely because a remaining unseen row is temporarily reserved or interleave-blocked, and continuation cards are counted in `unique loaded` diagnostics so diversity can be verified from real learning reports. Adaptive demotion and the real stored L1–L5 challenge from 4.5.17 remain unchanged.

Serverless `Live sync while connected` is implemented in 4.5.19; the next main product milestone remains 4.6 (`Prepare for this`).


## 4.5.19 — Live sync while connected

Status: implemented.

Live sync is an ephemeral direct-device session. One device chooses **Start live sync**, the other chooses **Join live sync**, and the local QR offer/answer handshake creates an encrypted WebRTC DataChannel. The DataChannel stays open after pairing instead of closing after the first delta. No account, LanguageDeck backend, signalling server, STUN server or TURN relay is introduced.

After the channel opens, both devices exchange their local installation ids and per-peer receive cursors. Each side immediately sends only the Words/Grammar/Story/Text/chapter progress that the other device has not already acknowledged. Received deltas reuse the internal conflict-aware progress merge engine and advance the durable per-peer receive cursor only after checksum verification and merge. A small cursor overlap intentionally permits harmless duplicate rows so second-resolution transport timestamps cannot skip a just-written answer.

Normal learning writes mark the live session dirty rather than launching an immediate full scan. Changes are debounced for 1.8 seconds and outgoing database scans are rate-limited to at most one batch every four seconds. Rapid answers are therefore coalesced. Story/chapter/preparation state also participates, with a lightweight local-state signature watcher as a fallback for progress writes that occur outside Free Practice. Incoming merges are suppressed from the dirty notifier to avoid echo loops.

The connection publishes the selected WebRTC candidate-pair type/protocol when available, sends a lightweight heartbeat while idle, and exposes an explicit **Disconnect live sync** control. Closing the transfer/settings modal does not intentionally close an already established live channel; closing/reloading/suspending an app or losing the network can still end the browser peer connection, after which the devices must pair again.

The local WebRTC path remains best-effort: if Brave/Chromium, the OS firewall or the Wi-Fi network does not expose a usable direct host path, serverless live sync cannot be guaranteed. As of 4.5.22 there is deliberately no second user-facing transfer path; the devices must pair again when a direct session cannot be established.

Next main milestone: **4.6 — Prepare for this**.


## 4.5.20 — Live-sync-only cleanup

Status: completed cleanup/stabilisation release.

Live sync is now the **only** user-facing cross-device progress path. The settings UI contains only Start live sync, Join live sync, current connection status and Disconnect. The old one-time Nearby flow, rotating QR-only delta transfer, downloadable/importable progress file and legacy compact-code transfer have been removed rather than merely hidden. Their modal states, event listeners, URL/hash hooks, framing/request helpers and obsolete regression tests are removed with them.

The code keeps only the pieces Live sync actually needs: compact changed-record wire encoding, per-peer cursors, checksum verification, conflict-aware merge, pending unmatched state, numeric-date migration repair, QR offer/answer rendering/decoding and local WebRTC diagnostics. These are internal data-safety/transport primitives and are not alternate sharing modes. Pairing now uses the dedicated `LDS1` signal prefix so historical one-time-transfer QR payloads cannot be mistaken for a current Live-sync handshake.

The Live DataChannel remains ephemeral and serverless: no account, signalling backend, STUN or TURN. Closing the app, device sleep, network loss or browser suspension can end the session; reconnecting requires a new QR pair.

Next main milestone: **4.6 — Prepare for this**.


## 4.5.21 — Global Live sync modal portal

Status: completed UI routing fix.

Live sync is a global device utility and no longer depends on the visibility of the integrated Practice host. In 4.5.20 the Live sync and QR pairing modal elements still lived inside `practiceStudyHost`; when that host was hidden on Course, Book or My library, adding the modal's `active` class changed state correctly but could not render anything until another navigation action happened to reveal the Practice host.

4.5.21 mounts both the Live sync dialog and its QR pairing dialog directly under `document.body` through one shared portal helper. Both the My library Live sync action and the in-Practice settings button call the same global opener, so one click/tap opens the dialog immediately on desktop and mobile from any app surface. The portalled dialogs carry their own token bridge, button/modal styling and responsive QR sizing, so they no longer inherit visibility or stacking constraints from Practice.

No sync transport, merge, scheduler or learning-engine behaviour changes in this release. The next main milestone remains **4.6 — Prepare for this**.

## 4.5.22 — Adaptive vowel/consonant gap hints

Adaptive L1–L4 now adds a small orthographic hint to still-hidden character slots without changing the existing slot design. A hidden vowel keeps the exact continuous underscore used before 4.5.22. A hidden consonant uses the same monospace underscore glyph, but with a small centre break. There is no colour coding and no new symbol system.

The hint is deliberately limited to masked Adaptive/Progressive tasks. L5/full typing keeps every hidden character slot visually identical, so full active recall receives no vowel/consonant assistance. German umlaut vowels are recognised through Unicode decomposition (`ä`, `ö`, `ü` behave as vowels); `y` remains on the consonant side of this simple orthographic hint. Filled characters replace the slot exactly as before.

The same masked-clue renderer is shared by Adaptive Words, Book-routed Adaptive word recall and Progressive sentence tasks, so the hint stays visually consistent wherever L1–L4 masking is used. Full-typing surfaces continue to call the same renderer with shape hints disabled.
