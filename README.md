# LanguageDeck — szótanuló PWA

Ez a dokumentum végigvezet azon, hogyan tedd fel az appot a GitHub Pages-re és hogyan rakd a telefonodra. **Olyan részletesen írom le, mintha egymás mellett ülnénk** — lépésenként, mit kell kattintani.

Ha valami nem jön össze, nézd meg a végén a **„Mi lehet a baj"** részt.

---

## Mit kapsz ebben a mappában

```
languagedeck-pwa/
├── index.html               ← maga az app
├── manifest.webmanifest     ← ettől lesz „telepíthető"
├── sw.js                    ← ettől megy offline is
├── icon-192.png
├── icon-512.png
├── icon-maskable-512.png
├── README.md                ← ez a fájl
└── decks/
    ├── german_3000.csv
    ├── italian_3000.csv
    └── index.json
```

**Ez a 10 fájl a teljes alkalmazás.** Nincs „build", nincs telepítendő csomag.

---

## 1. lépés — Tedd fel GitHubra

Két lehetséges út van. A legegyszerűbb (és amit ajánlok): **csinálj egy új repót csak ennek**. Az alábbi útmutató ezt az utat írja le.

> Ha mindenképp a meglévő `username.github.io` oldaladhoz akarod tenni, ugorj a **„Másik út: meglévő oldalra rátenni"** részhez lent. De olvasd el előbb ezt — világosabb lesz.

### 1.1. Új repó létrehozása

1. Menj a [github.com](https://github.com)-ra, jelentkezz be.
2. Jobb fent kattints a **+** ikonra → **New repository**.
3. Töltsd ki:
   - **Repository name:** `languagedeck` (vagy bármi, csak jegyezd meg)
   - **Public** legyen kiválasztva (a GitHub Pages csak így működik az ingyenes csomagban — fontos!)
   - **NE pipáld be** az „Add a README file"-t (mert mi sajátot teszünk fel)
4. Lent kattints **Create repository**.

### 1.2. Fájlok feltöltése — figyelj erre, ez a kritikus rész

Most jött a sokak által elrontott rész. Az újonnan létrejött üres repó oldalán:

1. Kattints a **„uploading an existing file"** linkre (a középső szürke dobozban).
2. Most pedig a számítógépeden **NYISD KI** a `languagedeck-pwa` mappát.
3. **A mappán BELÜLI fájlokat húzd át** a böngészőbe — NE magát a `languagedeck-pwa` mappát.

   Vagyis ezt a 8 dolgot húzd át egyszerre:
   - `index.html`
   - `manifest.webmanifest`
   - `sw.js`
   - `icon-192.png`
   - `icon-512.png`
   - `icon-maskable-512.png`
   - `README.md`
   - és a `decks` mappát (ezt egyben, mappaként húzd át)

   **Rossz** lenne: ha az egész `languagedeck-pwa` mappát húznád át, mert akkor a repóban `languagedeck-pwa/index.html` lenne, és nem fog működni a PWA.

   **Jó** ha a feltöltési listában megjelenik: `index.html`, `sw.js`, `manifest.webmanifest`, `icon-*.png`, `README.md`, és a `decks/` mappa is feltöltődik a benne lévő CSV-kkel és `index.json`-nal.

4. Lent a **„Commit changes"** részen hagyhatod az alapértelmezett szöveget. Kattints **Commit changes**.

### 1.3. Ellenőrzés a feltöltés után

A repó főoldalán most ezeket KELL látnod (közvetlenül, nem további mappa alatt):

```
decks/
icon-192.png
icon-512.png
icon-maskable-512.png
index.html
manifest.webmanifest
README.md
sw.js
```

Ha azt látod, hogy van egy `languagedeck-pwa/` mappa és AZ alatt vannak a fájlok — akkor rosszul töltötted fel. Ebben az esetben a legegyszerűbb: a repó **Settings** legalján **Delete this repository** → kezdd újra az 1.1-től, jobban figyelve a 1.2 lépésnél.

### 1.4. GitHub Pages bekapcsolása

Most még nem érhető el az app — be kell kapcsolnod a Pages-t.

1. A repó felső sávjában kattints **Settings**-re (jobb oldali fül).
2. A bal oldali menüben görgess le, kattints **Pages**-re.
3. **„Build and deployment"** szakasz, **„Source"**: válaszd a **Deploy from a branch**-et.
4. **„Branch"** alatt: **`main`** és **`/ (root)`** legyen kiválasztva. Kattints **Save**.

### 1.5. Várj 1–2 percet

A Pages oldalt frissítve néhány másodperc múlva megjelenik egy zöld doboz:

> **Your site is live at https://`<felhasználónév>`.github.io/languagedeck/**

Ezt a linket nyisd meg a számítógépeden böngészőben — be kell, hogy töltődjön az app angolul. Ha igen, mehetünk a 2. lépésre.

> Ha 404-et kapsz: várj még 1 percet és frissíts. A Pages első aktiválása néha lassabb.

---

## 2. lépés — Rakjuk a telefonodra (OnePlus 10 Pro)

1. **Chrome böngésző** a telefonon (NEM Samsung Internet, NEM más). Lehetőleg friss verzió.
2. Az URL-be írd be: `https://<felhasználónév>.github.io/languagedeck/`
3. Töltődjön be az app, lásd hogy a „LanguageDeck" cím megjelenik felül.
4. **Két verzió közül egyik fog megtörténni:**

   **A)** Egy felugró sáv a képernyő alján: *„Hozzáadás a kezdőképernyőhöz"* — koppints rá → **Telepítés**.

   **B)** Vagy ha nem ajánlja fel automatikusan: koppints a Chrome jobb felső három pont menüjére → **„App telepítése"** vagy **„Hozzáadás a kezdőképernyőhöz"**.

5. Az app ikonja megjelenik a kezdőképernyődön „LanguageDeck" névvel.
6. Megnyitva már teljes képernyőn fut, mintha igazi alkalmazás lenne — és **offline is megy** (kipróbálhatod: kapcsold ki a wifit és a mobilnetet, és nyisd meg).

---

## 3. lépés — Indulj el (első használat)

Az adatbázis még üres. Töltsd be a 3000 szavas listát:

1. Az appban: **Settings** gomb (jobbra fent vagy a lebegő fogaskerék mobilon).
2. Görgess le az **Import** szakaszhoz.
3. Kattints **Browse built-in decks**-re.
4. A listából koppints a *german_3000* (vagy *italian_3000*) melletti **Import** gombra.
5. „Imported 3000 words…" üzenet → kész, taníthatsz.

A többi (zsilipek, ismétlés profilok, mondatkiegészítés) ugyanúgy működik, mint a régi Pythonos verzióban — csak most a böngésző tárolja az adatokat.

---

## Másik út: meglévő `username.github.io` oldalra rátenni

Ha már van egy `username.github.io` repód és oda akarod tenni almappaként:

1. Nyisd meg azt a repót GitHubon a böngészőben.
2. **Add file → Upload files**.
3. **A `languagedeck-pwa` mappa BELSŐ tartalmát** húzd be a feltöltőfelületre (úgy mint az 1.2-ben).
4. **Mielőtt commitolnál**: észre fogod venni, hogy minden fájl a repó gyökerébe kerülne. Ezt át kell helyezni egy almappába. Két lehetőséged van:
   - **Egyszerűbb módszer:** a feltöltés ELŐTT a számítógépeden hozz létre egy `languagedeck` mappát, abba másold be a `languagedeck-pwa` tartalmát, és AZT a `languagedeck` mappát húzd át. A GitHub feltöltő megőrzi a mappastruktúrát.
   - **Webes módszer:** miután feltöltötted a fájlokat a gyökérbe, mindegyiket egyenként át kell mozgatni. Ezt csak akkor tudod, ha jártas vagy a GitHub szerkesztésében — nem ajánlom.
5. Commit.
6. Ekkor a struktúra a repón: `username.github.io/languagedeck/index.html` stb.
7. **GitHub Pages-t nem kell külön bekapcsolni**, már működik. Pár másodperc múlva nyisd meg: `https://username.github.io/languagedeck/`

> Őszintén: az új repós megoldás (1. lépés) sokkal egyszerűbb. A meglévő oldaladat akkor sem érinti, ha külön repót csinálsz.

---

## Saját szókészletek hozzáadása

### A) Egyszer, csak ezen az eszközön

Settings → Import → válaszd ki a CSV fájlt → **Import file**. Bekerül az IndexedDB-be (ez az eszközhöz kötött, másik telefonon külön kell csinálni).

### B) A „Browse built-in decks" listához

1. Tedd a CSV fájlt a `decks/` mappába a GitHub repódba (Add file → Upload files a `decks/` mappán belül).
2. Szerkeszd meg a `decks/index.json` fájlt és add hozzá az új deck-et:

```json
[
  { "name": "german_3000",  "file": "german_3000.csv",  "deck": "de", "type": "words" },
  { "name": "italian_3000", "file": "italian_3000.csv", "deck": "it", "type": "words" },
  { "name": "saját_lista",  "file": "sajat.csv",        "deck": "de", "type": "words" }
]
```

   - `name`: ami megjelenik az appban
   - `file`: a CSV neve
   - `deck`: `"de"` vagy `"it"`
   - `type`: `"words"` vagy `"sentences"`

3. Commit. Pár másodperc múlva újratöltve az appban megjelenik.

### CSV-formátum

Szavakhoz:
```csv
english,target,article
the house,Haus,das
to go,gehen,
```

Mondatokhoz:
```csv
english,target
I am at home.,Ich bin zu Hause.
```

---

## Mi lehet a baj? (hibaelhárítás)

**404 a megnyitáskor.**
A Pages még nem aktivált. Várj 1–2 percet és frissíts. Ha 5 perc után is 404, ellenőrizd a Settings → Pages oldalon, hogy a szöveg „Your site is live at…"-szel kezdődik-e.

**Az URL megnyílik, de csak a `README.md`-t mutatja, nem az appot.**
A fájlok valószínűleg egy `languagedeck-pwa/` almappában landoltak. A repó főoldalán kattints `index.html`-re — ha NEM látod ezt a fájlt a főoldalon, akkor rosszul töltötted fel. Lásd 1.3 javítás.

**Az app betöltődik, de nincs „Telepítés" felajánlás.**
- Asztali Chrome: a böngészőcímsor jobb szélén gyakran van egy + jel vagy egy számítógép ikon — kattints rá.
- Mobilon: Chrome menü (3 pont) → „App telepítése" / „Hozzáadás a kezdőképernyőhöz".
- Néha kell egy oldal-frissítés (pull to refresh).
- Ha már egyszer „elutasítottad" a telepítést ezen a böngészőn, a Chrome egy ideig nem ajánlja fel újra — kézzel a menüből megy.

**„Browse built-in decks" üres üzenetet ír.**
A `decks/index.json` valószínűleg nincs feltöltve, vagy rossz helyen van. Ellenőrizd, hogy a GitHubon a repó főoldalán van egy `decks/` mappa, abban van `index.json`, `german_3000.csv` és `italian_3000.csv`.

**Frissítettem az index.html-t és nem látszik a változás.**
A service worker cache-el. Két megoldás:
1. A `sw.js`-ben a `languagedeck-v1`-et írd át `languagedeck-v2`-re és commitold.
2. Vagy a telefon Chrome-jában: Settings → Site settings → All sites → keresd ki az oldaladat → Clear & reset.

**Helyben tesztelni a számítógépen.**
Sima dupla-katt az `index.html`-en NEM jó (a service worker és a deck-letöltés nem megy `file://`-ről).
Megoldás: nyiss egy terminált a `languagedeck-pwa` mappában és:
```
python3 -m http.server 8000
```
Aztán böngészőben: `http://localhost:8000`

**Adatok elvesztek.**
Az adataid IndexedDB-ben vannak, az pedig a böngésző adataihoz tartozik. Ha kitörlöd a Chrome adatait vagy az appot — eltűnnek. A CSV-id viszont megvannak GitHubon, tehát újraimportálhatóak.

---

## Mit nem hoztam át a régi Python projektből

- **XLSX (Excel) import** — csak CSV. Ha xlsx-ed van: Excelben Mentés másként → CSV (UTF-8).
- **A régi `words.db` SQLite tartalma** — az ismétlési előzmények nem konvertálódtak át. Ha számítanak, az új appban újra végig kell menni rajtuk. A szókészletek viszont megvannak (CSV-k).

Minden más megmaradt: párosítós + gépelős mód, mondatkiegészítés, zsilipek 85%-os feloldási küszöbbel, német névelős kérdezés (der/die/das), spaced repetition (easy/normal/hard profilok), statisztikák, „leggyakrabban hibázott" lista, több deck per nyelv.

---

## German / Oliver-style deck update v2

This package keeps the original Italian deck and import flow intact, but expands the German CSV importer so it can handle richer learning cards.

### What still works

Old CSV files still work:

```csv
english,target
I,ich
```

German noun CSVs still work:

```csv
english,target,article
the house,Haus,das
```

Italian decks still ignore the German article prompt, so `italian_3000.csv` remains a plain English → Italian deck.

### New optional German CSV columns

For richer German decks you can now use:

```csv
english,target,article,plural,type,register,tags,note,alternatives,article_prompt
```

Useful values:

- `article`: `der`, `die`, or `das` for German nouns.
- `plural`: optional plural form.
- `type`: `noun`, `verb`, `phrase`, `expression`, `chunk`, `sentence`, `idiom`.
- `register`: `neutral`, `natural`, `colloquial`, `formal`, `professional`, `emotional`, `direct`.
- `tags`: topic tags separated by semicolons.
- `note`: a short learning hint.
- `alternatives`: accepted typing alternatives separated by `|`.
- `article_prompt`: set to `false` for phrases where an article is only metadata.

Example:

```csv
english,target,article,plural,type,register,tags,note,alternatives,article_prompt
decision,Entscheidung,die,Entscheidungen,noun,neutral,thinking,,,
to make a decision,eine Entscheidung treffen,die,,phrase,neutral,thinking,Article is metadata only,,false
```

### Built-in starter decks added

- `oliver_core_chunks` — German nouns, chunks and thinking/communication phrases.
- `oliver_sentence_patterns` — full sentence patterns for natural, adult communication.
- `oliver_bim_architecture` — BIM, Revit, architecture and coordination vocabulary.

The schema file is also included here:

```text
decks/de/german_csv_schema_v2.yaml
```



## German thematic decks v3

This build includes the full first-pass thematic German deck set:

1. `german_a1_survival.csv` — everyday survival German.
2. `german_core_verbs.csv` — high-utility verbs and verb chunks.
3. `german_native_chunks.csv` — natural spoken German expressions.
4. `oliver_core_chunks.csv` — tailored thinking/communication/boundary phrases.
5. `german_relationship_boundaries.csv` — emotions, trust, safety, boundaries.
6. `german_sentence_patterns.csv` — reusable sentence frames.
7. `german_bim_architecture_work.csv` — BIM/Revit/architecture/work vocabulary.
8. `german_grammar_chunks.csv` — grammar learned as chunks, not rules only.
9. `german_nouns_articles_core.csv` — core nouns with der/die/das and plural.
10. `german_register_pairs.csv` — natural/formal/direct alternatives.

Italian decks and old two-column CSV import remain supported.

## v20 — Reorder words (Satzbau) mode

New **sentence sub-mode: "Reorder words"** (Settings → Practice → Sentence mode).
Instead of filling in 1–4 blanks, the whole sentence is scrambled into a word
bank; tap the words to build the sentence in order, tap a placed word to send it
back. On **Check**, each placed chip is coloured green/red by position. Wrong
sentences re-enter the queue (SRS + gates unchanged).

Reuses the existing `sentence_pairs` pipeline, so any sentences deck works with
it. Ships with **`german_sentence_builder`** (119 graded A1–B1 sentences chosen
to drill German word order: V2, verb-final after weil/dass/ob, the perfect
bracket, separable verbs, modal+infinitive, um…zu).

SW cache bumped to `languagedeck-v20-german-v3-reorder`.

## v21 — Quick-switch sheet, trimmed menu, new identity

**Quick-switch sheet.** The context chip is now a button: tap it for a bottom
sheet that switches **What** (Words / Sentences), **How** (Match · Type, or
Word bank · Reorder · Type), and **Deck** (active set + language) in one tap.
It drives the existing selects via native change events, so SRS, gates, and
deck-reload logic are untouched. The chip reads back the current state
(`Words · Match · german_3000 ▾`).

**Trimmed Settings.** Deck/mode/language left Settings for the sheet. Settings
now opens on Appearance and keeps only Appearance, Practice, Gates (advanced),
and Import — fewer, prioritized options.

**New identity.** New mark: a black diamond on its corner with a side-facing
profile silhouette. Applied to the appbar wordmark and regenerated PWA icons
(192, 512, maskable-512). `icon.svg` holds the source mark.

SW cache bumped to `languagedeck-v21-german-v3-quickswitch`.
