# LanguageDeck 3.1.6 — Maintenance & Integrity

## Javítások

- A fejezet-gyorsítótár immár a stabil `unitId`-t használja; hibás vagy hiányos csomagnál a mappaútvonal a védett tartalék kulcs. Azonos `ch01` ID-k ezért nem tudnak többé másik történet tartalmára felülíródni.
- Minden olvasási útvonal — Course, Book, Data Check és előrehaladás-számítás — ugyanazt a gyorsítótárkulcsot használja.
- A korábbi tudásrekordok alias alapú migrációt kapnak. Összevonáskor a magasabb szint, a gyűjtött állapot és a korábbi esedékesség marad meg.
- A 13 generált lexéma-sorszám tisztázva: a valódi duplikátumok egyetlen tudásállapotba kerültek, a többjelentésű szavak külön, beszédes sense-ID-t kaptak. A korábbi ID-k aliasok maradtak.
- Javítva egy örökölt `de.lex.essen.verb` hivatkozás is.
- A Settings ikon 44×44 px, a kis szürke feliratok kontrasztosabbak, a fő kártya- és gombtokenek következetesebbek.
- A ténylegesen nem hivatkozott `loadCombinedMode` eltávolítva.
- A service worker új cache-verziót kapott, így frissítéskor a 3.1.6 tartalom töltődik le.

## Automatikus ellenőrzés

Futtatás a csomag gyökerében:

```bash
node tests/verify-maintenance-integrity.mjs
```

Az ellenőrzés lefedi a fejezet-cache regresszióját, az aliasok céljait és ciklusait, a globális lexémahivatkozásokat, a generált duplikátum-sorszámokat és a service worker fájllistáját.

Az `de.private.*` névterű Extended Story bejegyzések szándékosan fejezet-helyi szókincsek; a globális lexikon-integritási szabály nem sorolja őket hibának.
