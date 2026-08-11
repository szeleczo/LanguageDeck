# LanguageDeck 3.1.7 — Reading & Recall Integrity

Ez a patch a 3.1.6 Maintenance & Integrity kiadásra épül.

## Javítások

- Az olvasás közben megérintett szó magyarázata közvetlenül az alsó műveletsáv fölött jelenik meg. A koppintás nem rendereli újra és nem görgeti el a teljes szöveget.
- Mindig csak az utoljára megérintett szó magyarázata látszik; másik szó választásakor a sáv tartalma cserélődik.
- A „nem tudom” koppintás tartós, elsőbbségi tanulási jelzés. Feloldja a szó korábbi kizárását vagy félretételét, és a szót a fejezet memorizálási tervébe emeli akkor is, ha nem volt kézzel kijelölt cél.
- A jelzés csak tiszta, segítség nélküli teljes felidézés után oldódik fel.
- A vezetett memorizálás nem a korábbi `streak` értékből következtet a kész állapotra. Minden elemhez külön teljes-felidézési bizonyíték szükséges.
- A még nem bizonyított elemek a legkevesebb fázison belüli próbálkozás szerint rotálnak, így egy lemaradó elem nem szorítja ki a kevésbé ellenőrzött társait.
- Az utolsó cél sikeres felidézése után a fázis rövid visszajelzést követően automatikusan visszatér a Chapter Study oldalra.
- A vessző, pont és a mondatvégi írásjelek nem kötelezőek a teljes válasz elfogadásához. A vessző nem kap külön billentyűzetsort.
- Az elvárt írásjelek a teljes válasz előnézetében halvány, rögzített karakterként jelennek meg. Az aposztróf és a kötőjel továbbra is beírható, mert szóalak része lehet.

## Ellenőrzés

```bash
node tests/verify-maintenance-integrity.mjs
```

A teszt ellenőrzi a fejezet-cache izolációját, a lexikon- és aliasintegritást, a fázisonkénti teljes-felidézési bizonyítékot, az igazságos rotációt, a kötelező tanulási jelzést, az opcionális írásjeleket és a service-worker verziót.
