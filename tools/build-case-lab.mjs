import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const output = fileURLToPath(new URL("../decks/de/grammar/case-lab.json", import.meta.url));
const row = (key, prompt, target, hint, explanation, alternatives = "") => ({
  key, prompt, target, ...(alternatives ? { alternatives } : {}), hint, explanation
});
const phase = (id, title, subtitle, rows, mode = "grammar") => ({ id, title, subtitle, mode, rows });
const unit = (id, order, level, title, summary, rule, memoryHook, examples, paradigms, phases) => ({
  id, track: "cases", order, level, title, summary, rule, memoryHook, examples, paradigms, phases
});

const transferCore = [
  ["give-man-key", "A férfinak adom a kulcsot.", "Ich gebe dem Mann den Schlüssel.", "dem Mann", "den Schlüssel"],
  ["show-woman-photo", "Megmutatja a nőnek a fényképet. · nő", "Sie zeigt der Frau das Foto.", "der Frau", "das Foto"],
  ["bring-child-apple", "Egy almát viszünk a gyermeknek.", "Wir bringen dem Kind einen Apfel.", "dem Kind", "einen Apfel"],
  ["send-friend-message", "Üzenetet küld a barátnőjének. · férfi", "Er schickt seiner Freundin eine Nachricht.", "seiner Freundin", "eine Nachricht"],
  ["lend-brother-bike", "Kölcsönadod a testvérednek a kerékpárt. · fiútestvér", "Du leihst deinem Bruder das Fahrrad.", "deinem Bruder", "das Fahrrad"],
  ["gift-children-books", "Könyveket ajándékoztok a gyerekeknek.", "Ihr schenkt den Kindern Bücher.", "den Kindern", "Bücher"],
  ["explain-student-rule", "Elmagyarázom a diáknak a szabályt. · fiú", "Ich erkläre dem Schüler die Regel.", "dem Schüler", "die Regel"],
  ["tell-mother-story", "Elmeséli az édesanyjának a történetet. · nő", "Sie erzählt ihrer Mutter die Geschichte.", "ihrer Mutter", "die Geschichte"],
  ["waiter-guest-coffee", "A pincér kávét visz a vendégnek.", "Der Kellner bringt dem Gast einen Kaffee.", "dem Gast", "einen Kaffee"],
  ["teacher-tasks", "A tanárnő odaadja a feladatokat a diákoknak.", "Die Lehrerin gibt den Schülern die Aufgaben.", "den Schülern", "die Aufgaben"]
];
const mentalRoles = transferCore.flatMap(([key, hu, de, dat, akk]) => [
  row(`${key}-dat`, `${hu} · Kinek?`, dat, "A címzett Dativ.", `${de} A dolog a címzetthez jut: ${dat} Dativ.`),
  row(`${key}-akk`, `${hu} · Mit?`, akk, "A mozgatott vagy átadott dolog Akkusativ.", `${de} A közvetlenül átadott dolog: ${akk} Akkusativ.`)
]);
const mentalSentences = transferCore.map(([key, hu, de, dat, akk]) =>
  row(key, hu, de, "Előbb a címzettet, majd a dolgot keresd.", `Kinek? ${dat} → Dativ. Mit? ${akk} → Akkusativ.`)
);

const pronouns = [
  ["ich", "engem", "nekem", "mich", "mir", "Er sieht mich.", "Lát engem. · férfi", "Er hilft mir.", "Segít nekem. · férfi"],
  ["du", "téged", "neked", "dich", "dir", "Sie sieht dich.", "Lát téged. · nő", "Sie hilft dir.", "Segít neked. · nő"],
  ["er", "őt · férfi", "neki · férfi", "ihn", "ihm", "Ich sehe ihn.", "Látom őt. · férfi", "Ich helfe ihm.", "Segítek neki. · férfi"],
  ["sie-sg", "őt · nő", "neki · nő", "sie", "ihr", "Wir sehen sie.", "Látjuk őt. · nő", "Wir helfen ihr.", "Segítünk neki. · nő"],
  ["es", "azt · semlegesnem", "annak · semlegesnem", "es", "ihm", "Ich sehe es.", "Látom azt. · semlegesnemű dolog", "Ich helfe ihm.", "Segítek neki. · semlegesnemű főnévvel jelölt élőlény"],
  ["wir", "minket", "nekünk", "uns", "uns", "Er sieht uns.", "Lát minket. · férfi", "Er hilft uns.", "Segít nekünk. · férfi"],
  ["ihr", "benneteket", "nektek", "euch", "euch", "Sie sieht euch.", "Lát benneteket. · nő", "Sie hilft euch.", "Segít nektek. · nő"],
  ["sie-pl", "őket", "nekik", "sie", "ihnen", "Ich sehe sie.", "Látom őket.", "Ich helfe ihnen.", "Segítek nekik."],
  ["formal", "Önt/Önöket", "Önnek/Önöknek", "Sie", "Ihnen", "Ich sehe Sie.", "Látom Önt/Önöket.", "Ich helfe Ihnen.", "Segítek Önnek/Önöknek."]
];
const pronounForms = pronouns.flatMap(([id, akkHu, datHu, akk, dat]) => [
  row(`${id}-akk`, `${akkHu} · Akkusativ`, akk, "Kit/mit ér közvetlenül a cselekvés?", `${id} Akkusativ alakja: ${akk}.`),
  row(`${id}-dat`, `${datHu} · Dativ`, dat, "Kinek/minek szól vagy jut valami?", `${id} Dativ alakja: ${dat}.`)
]);
const pronounSentences = pronouns.flatMap(([id,,,,, akkDe, akkHu, datDe, datHu]) => [
  row(`${id}-sentence-akk`, akkHu, akkDe, "sehen + Akkusativ", `A sehen közvetlen tárgya Akkusativ.`),
  row(`${id}-sentence-dat`, datHu, datDe, "helfen + Dativ", `A helfen Dativot vonz.`)
]);

const definiteNouns = [
  ["mann", "Mann", "der Mann", "den Mann", "dem Mann", "Látom a férfit.", "Ich sehe den Mann.", "Segítek a férfinak.", "Ich helfe dem Mann."],
  ["arzt", "Arzt", "der Arzt", "den Arzt", "dem Arzt", "Megkérdezem az orvost.", "Ich frage den Arzt.", "Válaszolok az orvosnak.", "Ich antworte dem Arzt."],
  ["lehrer", "Lehrer", "der Lehrer", "den Lehrer", "dem Lehrer", "Meglátogatom a tanárt.", "Ich besuche den Lehrer.", "Köszönetet mondok a tanárnak.", "Ich danke dem Lehrer."],
  ["frau", "Frau", "die Frau", "die Frau", "der Frau", "Látom a nőt.", "Ich sehe die Frau.", "Segítek a nőnek.", "Ich helfe der Frau."],
  ["mutter", "Mutter", "die Mutter", "die Mutter", "der Mutter", "Felhívom az édesanyát.", "Ich rufe die Mutter an.", "Köszönetet mondok az édesanyának.", "Ich danke der Mutter."],
  ["kollegin", "Kollegin", "die Kollegin", "die Kollegin", "der Kollegin", "Meglátogatom a kolléganőt.", "Ich besuche die Kollegin.", "Válaszolok a kolléganőnek.", "Ich antworte der Kollegin."],
  ["kind", "Kind", "das Kind", "das Kind", "dem Kind", "Látom a gyermeket.", "Ich sehe das Kind.", "Segítek a gyermeknek.", "Ich helfe dem Kind."],
  ["auto", "Auto", "das Auto", "das Auto", "dem Auto", "Megveszem az autót.", "Ich kaufe das Auto.", "Odamegyek az autóhoz.", "Ich gehe zum Auto.", "Ich gehe zu dem Auto."],
  ["buch", "Buch", "das Buch", "das Buch", "dem Buch", "Keresem a könyvet.", "Ich suche das Buch.", "A könyv mellett ülök.", "Ich sitze neben dem Buch."],
  ["kinder", "Kinder", "die Kinder", "die Kinder", "den Kindern", "Látom a gyerekeket.", "Ich sehe die Kinder.", "Segítek a gyerekeknek.", "Ich helfe den Kindern."],
  ["freunde", "Freunde", "die Freunde", "die Freunde", "den Freunden", "Meglátogatom a barátokat.", "Ich besuche die Freunde.", "Köszönetet mondok a barátoknak.", "Ich danke den Freunden."],
  ["gaeste", "Gäste", "die Gäste", "die Gäste", "den Gästen", "Üdvözlöm a vendégeket.", "Ich begrüße die Gäste.", "Kávét kínálok a vendégeknek.", "Ich biete den Gästen Kaffee an."]
];
const articleForms = definiteNouns.map(([id, label, nom, akk, dat]) =>
  row(`${id}-forms`, `${label} · Nominativ → Akkusativ → Dativ`, `${nom} – ${akk} – ${dat}`, "Figyeld a névelőt és többes Dativban a főnév végét.", `${nom}; közvetlen tárgyként ${akk}; Dativban ${dat}.`)
);
const articleSentences = definiteNouns.flatMap(([id,,,,, akkHu, akkDe, datHu, datDe, datAlt]) => [
  row(`${id}-akk`, akkHu, akkDe, "Közvetlen tárgy vagy Akkusativ-ige.", `${akkDe} Az érintett mondatrész Akkusativ. `),
  row(`${id}-dat`, datHu, datDe, "Címzett, Dativ-ige vagy Dativ-elöljáró.", `${datDe} Az érintett mondatrész Dativ.`, datAlt || "")
]);

const determiners = [
  ["ein-mann", "ein Mann", "einen Mann", "einem Mann", "Látok egy férfit.", "Ich sehe einen Mann.", "Segítek egy férfinak.", "Ich helfe einem Mann."],
  ["kein-mann", "kein Mann", "keinen Mann", "keinem Mann", "Nem látok férfit.", "Ich sehe keinen Mann.", "Egyetlen férfinak sem segítek.", "Ich helfe keinem Mann."],
  ["mein-bruder", "mein Bruder", "meinen Bruder", "meinem Bruder", "Felhívom a fiútestvéremet.", "Ich rufe meinen Bruder an.", "Üzenetet írok a fiútestvéremnek.", "Ich schreibe meinem Bruder eine Nachricht."],
  ["dein-vater", "dein Vater", "deinen Vater", "deinem Vater", "Ismerem az édesapádat.", "Ich kenne deinen Vater.", "Köszönetet mondok az édesapádnak.", "Ich danke deinem Vater."],
  ["eine-frau", "eine Frau", "eine Frau", "einer Frau", "Látok egy nőt.", "Ich sehe eine Frau.", "Segítek egy nőnek.", "Ich helfe einer Frau."],
  ["meine-freundin", "meine Freundin", "meine Freundin", "meiner Freundin", "Meglátogatom a barátnőmet.", "Ich besuche meine Freundin.", "Üzenetet írok a barátnőmnek.", "Ich schreibe meiner Freundin eine Nachricht."],
  ["ein-kind", "ein Kind", "ein Kind", "einem Kind", "Látok egy gyermeket.", "Ich sehe ein Kind.", "Segítek egy gyermeknek.", "Ich helfe einem Kind."],
  ["mein-auto", "mein Auto", "mein Auto", "meinem Auto", "Eladom az autómat.", "Ich verkaufe mein Auto.", "Az autóm mellett állok.", "Ich stehe neben meinem Auto."],
  ["dieser-mann", "dieser Mann", "diesen Mann", "diesem Mann", "Ezt a férfit keresem.", "Ich suche diesen Mann.", "Ennek a férfinak hiszek.", "Ich glaube diesem Mann."],
  ["diese-frau", "diese Frau", "diese Frau", "dieser Frau", "Ezt a nőt kérdezem meg.", "Ich frage diese Frau.", "Ennek a nőnek válaszolok.", "Ich antworte dieser Frau."],
  ["dieses-kind", "dieses Kind", "dieses Kind", "diesem Kind", "Ezt a gyermeket hallom.", "Ich höre dieses Kind.", "Ennek a gyermeknek segítek.", "Ich helfe diesem Kind."],
  ["meine-freunde", "meine Freunde", "meine Freunde", "meinen Freunden", "Meghívom a barátaimat.", "Ich lade meine Freunde ein.", "A barátaimnak mesélek a kirándulásról.", "Ich erzähle meinen Freunden von der Reise."]
];
const determinerForms = determiners.map(([id, nom, akk, dat]) =>
  row(`${id}-forms`, `Nominativ → Akkusativ → Dativ`, `${nom} – ${akk} – ${dat}`, "A névelőszó végződése jelzi az esetet.", `A három alak: ${nom}, ${akk}, ${dat}.`)
);
const determinerSentences = determiners.flatMap(([id,,,, akkHu, akkDe, datHu, datDe]) => [
  row(`${id}-akk`, akkHu, akkDe, "Akkusativ", `${akkDe} A tárgy Akkusativ.`),
  row(`${id}-dat`, datHu, datDe, "Dativ", `${datDe} A mondat Dativot kér.`)
]);

const akkVerbs = [
  ["sehen", "jemanden/etwas sehen", "Látom a szomszédot.", "Ich sehe den Nachbarn."],
  ["hoeren", "jemanden/etwas hören", "Hallom a zenét.", "Ich höre die Musik."],
  ["kennen", "jemanden/etwas kennen", "Ismerjük ezt a várost.", "Wir kennen diese Stadt."],
  ["lieben", "jemanden/etwas lieben", "Szereti a családját. · nő", "Sie liebt ihre Familie."],
  ["fragen", "jemanden fragen", "Megkérdezem a tanárt.", "Ich frage den Lehrer."],
  ["besuchen", "jemanden/etwas besuchen", "Meglátogatjátok a nagymamátokat.", "Ihr besucht eure Großmutter."],
  ["treffen", "jemanden treffen", "Ma találkozom egy kollégával.", "Ich treffe heute einen Kollegen."],
  ["kaufen", "etwas kaufen", "Vesz egy új telefont. · férfi", "Er kauft ein neues Handy."],
  ["brauchen", "jemanden/etwas brauchen", "Szükségem van a kulcsra.", "Ich brauche den Schlüssel."],
  ["suchen", "jemanden/etwas suchen", "A pályaudvart keressük.", "Wir suchen den Bahnhof."],
  ["nehmen", "etwas nehmen", "A korábbi vonatot választjátok.", "Ihr nehmt den früheren Zug."],
  ["lesen", "etwas lesen", "Olvassa az üzenetet. · nő", "Sie liest die Nachricht."],
  ["verstehen", "jemanden/etwas verstehen", "Nem értem ezt a kérdést.", "Ich verstehe diese Frage nicht."],
  ["vergessen", "jemanden/etwas vergessen", "Elfelejtette a találkozót. · férfi", "Er hat den Termin vergessen."],
  ["anrufen", "jemanden anrufen", "Este felhívlak.", "Ich rufe dich am Abend an."],
  ["bitten", "jemanden um etwas bitten", "Segítséget kérek tőle. · nő", "Ich bitte sie um Hilfe."]
];
const akkChunks = akkVerbs.map(([id, chunk]) => row(`${id}-chunk`, `${id.replace("hoeren", "hören")} · vonzat`, chunk, "A személy vagy dolog Akkusativ.", `Ezt az igét a tárggyal együtt tárold: ${chunk}.`));
const akkVerbSentences = akkVerbs.map(([id,, hu, de]) => row(`${id}-sentence`, hu, de, `${id.replace("hoeren", "hören")} + Akkusativ`, `A ${id.replace("hoeren", "hören")} közvetlen tárgya Akkusativ.`));

const datVerbs = [
  ["helfen", "jemandem helfen", "Segítek a szomszédomnak.", "Ich helfe meinem Nachbarn."],
  ["danken", "jemandem danken", "Köszönetet mondunk a tanárnőnek.", "Wir danken der Lehrerin."],
  ["antworten", "jemandem antworten", "Válaszol neki. · nő válaszol férfinak", "Sie antwortet ihm."],
  ["folgen", "jemandem folgen", "A kutya követi a gazdáját. · férfi gazda", "Der Hund folgt seinem Besitzer."],
  ["zuhoeren", "jemandem zuhören", "Figyelmesen hallgatlak.", "Ich höre dir aufmerksam zu."],
  ["gefallen", "jemandem gefallen", "Tetszik nekem ez a kabát.", "Diese Jacke gefällt mir."],
  ["fehlen", "jemandem fehlen", "Hiányoznak neki a barátai. · nő", "Ihre Freunde fehlen ihr."],
  ["vertrauen", "jemandem vertrauen", "Bízom az orvosban.", "Ich vertraue dem Arzt."],
  ["begegnen", "jemandem begegnen", "Találkoztunk egy régi ismerőssel.", "Wir sind einem alten Bekannten begegnet."],
  ["gratulieren", "jemandem gratulieren", "Gratulálok neked a születésnapodhoz.", "Ich gratuliere dir zum Geburtstag."],
  ["glauben", "jemandem glauben", "Nem hiszünk ennek az embernek.", "Wir glauben diesem Mann nicht."],
  ["gehoeren", "jemandem gehören", "Ez a kerékpár a gyermekhez tartozik.", "Dieses Fahrrad gehört dem Kind."],
  ["schmecken", "jemandem schmecken", "Ízlik nektek a leves?", "Schmeckt euch die Suppe?"],
  ["passen", "jemandem passen", "Jól áll neki a ruha. · nő", "Das Kleid passt ihr gut."],
  ["widersprechen", "jemandem widersprechen", "Nem akarok ellentmondani Önnek.", "Ich möchte Ihnen nicht widersprechen."],
  ["verzeihen", "jemandem verzeihen", "Megbocsátok a barátomnak.", "Ich verzeihe meinem Freund."]
];
const datChunks = datVerbs.map(([id, chunk]) => row(`${id}-chunk`, `${id.replace("zuhoeren", "zuhören").replace("gehoeren", "gehören")} · vonzat`, chunk, "A személy Dativ.", `Ezt az igét a vonzatával együtt tárold: ${chunk}.`));
const datVerbSentences = datVerbs.map(([id,, hu, de]) => row(`${id}-sentence`, hu, de, `${id.replace("zuhoeren", "zuhören").replace("gehoeren", "gehören")} + Dativ`, `A ${id.replace("zuhoeren", "zuhören").replace("gehoeren", "gehören")} Dativot vonz.`));

const transferVariety = [
  ["give-book", "Odaadom neki a könyvet. · férfi", "Ich gebe ihm das Buch.", "ihm", "das Buch"],
  ["show-map", "Megmutatod nekem a térképet.", "Du zeigst mir die Karte.", "mir", "die Karte"],
  ["send-mail", "E-mailt küldünk a főnöknek.", "Wir schicken dem Chef eine E-Mail.", "dem Chef", "eine E-Mail"],
  ["bring-tea", "Teát visztek a vendégnek.", "Ihr bringt dem Gast einen Tee.", "dem Gast", "einen Tee"],
  ["gift-flowers", "Virágot ajándékoz a barátnőjének. · férfi", "Er schenkt seiner Freundin Blumen.", "seiner Freundin", "Blumen"],
  ["lend-pen", "Kölcsönad nekem egy tollat. · nő", "Sie leiht mir einen Stift.", "mir", "einen Stift"],
  ["explain-way", "Elmagyarázzák nekünk az utat.", "Sie erklären uns den Weg.", "uns", "den Weg"],
  ["tell-news", "Elmesélem nektek a hírt.", "Ich erzähle euch die Nachricht.", "euch", "die Nachricht"],
  ["recommend-film", "Ezt a filmet ajánlom neked.", "Ich empfehle dir diesen Film.", "dir", "diesen Film"],
  ["offer-seat", "Felajánlja az idős hölgynek a helyét. · férfi", "Er bietet der älteren Dame seinen Platz an.", "der älteren Dame", "seinen Platz"],
  ["write-friend", "Levelet írok a barátomnak.", "Ich schreibe meinem Freund einen Brief.", "meinem Freund", "einen Brief"],
  ["read-child", "Felolvas a gyermeknek egy történetet. · nő", "Sie liest dem Kind eine Geschichte vor.", "dem Kind", "eine Geschichte"],
  ["buy-son", "A fiának vesz egy kabátot. · nő", "Sie kauft ihrem Sohn eine Jacke.", "ihrem Sohn", "eine Jacke"],
  ["cook-family", "Vacsorát főzünk a családnak.", "Wir kochen der Familie das Abendessen.", "der Familie", "das Abendessen"],
  ["reserve-guests", "Szobát foglalok a vendégeimnek.", "Ich reserviere meinen Gästen ein Zimmer.", "meinen Gästen", "ein Zimmer"],
  ["promise-daughter", "Kirándulást ígér a lányának. · férfi", "Er verspricht seiner Tochter einen Ausflug.", "seiner Tochter", "einen Ausflug"],
  ["hand-customer", "A pénztáros odaadja a vevőnek a nyugtát.", "Die Kassiererin gibt dem Kunden den Kassenzettel.", "dem Kunden", "den Kassenzettel"],
  ["serve-children", "A gyerekeknek levest szolgálnak fel.", "Sie servieren den Kindern eine Suppe.", "den Kindern", "eine Suppe"],
  ["teach-students", "A tanár új nyelvtani szabályt tanít a diákoknak.", "Der Lehrer bringt den Schülern eine neue Grammatikregel bei.", "den Schülern", "eine neue Grammatikregel"],
  ["owe-colleague", "Tíz euróval tartozom a kollégámnak.", "Ich schulde meinem Kollegen zehn Euro.", "meinem Kollegen", "zehn Euro"]
];
const transferRoles = transferVariety.map(([id, hu, de, dat, akk]) => row(`${id}-roles`, `${hu} · Dativ | Akkusativ`, `${dat} | ${akk}`, "Kinek? | Mit?", `${de} Címzett: ${dat}; dolog: ${akk}.`));
const transferSentences = transferVariety.map(([id, hu, de, dat, akk]) => row(`${id}-sentence`, hu, de, "Dativ címzett + Akkusativ dolog", `${dat} Dativ; ${akk} Akkusativ.`));

const orderRows = [
  row("noun-noun-give", "A férfinak adom a könyvet.", "Ich gebe dem Mann das Buch.", "Két főnév: rendszerint Dativ az Akkusativ előtt.", "dem Mann → Dativ; das Buch → Akkusativ."),
  row("noun-noun-show", "A nőnek mutatja a fényképet. · férfi", "Er zeigt der Frau das Foto.", "Dativ + Akkusativ", "Két főnévi tárgynál a címzett rendszerint előbb áll."),
  row("noun-noun-send", "A gyerekeknek küldjük a csomagot.", "Wir schicken den Kindern das Paket.", "Dativ + Akkusativ", "den Kindern a címzett, das Paket a dolog."),
  row("dat-pronoun", "Neki adom a könyvet. · férfi", "Ich gebe ihm das Buch.", "A névmás a főnévi tárgy előtt áll.", "ihm Dativ névmás; das Buch főnévi Akkusativ."),
  row("akk-pronoun", "Odaadom azt a férfinak.", "Ich gebe es dem Mann.", "A névmás a főnévi tárgy előtt áll.", "es Akkusativ névmás; dem Mann főnévi Dativ."),
  row("two-pronouns", "Odaadom neki. · semlegesnemű dolog férfinak", "Ich gebe es ihm.", "Két névmás: Akkusativ többnyire Dativ előtt.", "es → Akkusativ; ihm → Dativ."),
  row("two-pronouns-female", "Elküldöm neki. · semlegesnemű dolog nőnek", "Ich schicke es ihr.", "Akkusativ névmás + Dativ névmás", "es áll előbb, utána ihr."),
  row("two-pronouns-us", "Megmutatja nekünk. · semlegesnemű dolog; nő", "Sie zeigt es uns.", "es + uns", "es Akkusativ, uns Dativ."),
  row("question-wem", "Kinek adod a kulcsot?", "Wem gibst du den Schlüssel?", "Wem? → Dativ", "A címzettre a wem kérdez rá."),
  row("question-was", "Mit adsz a férfinak?", "Was gibst du dem Mann?", "Was? → Akkusativ dolog", "A dologra was, a címzettre dem Mann utal."),
  row("front-dat", "A gyermeknek adom a labdát.", "Dem Kind gebe ich den Ball.", "A Dativ mondatrész kerülhet az első helyre.", "Az ige ettől még a második mondatrész: gebe."),
  row("front-akk", "A labdát a gyermeknek adom.", "Den Ball gebe ich dem Kind.", "Az Akkusativ mondatrész is kiemelhető.", "Den Ball Akkusativ, dem Kind Dativ."),
  row("time-first", "Ma adom oda neki a könyvet. · férfi", "Heute gebe ich ihm das Buch.", "Időhatározó után az ige, majd az alany jön.", "Heute az első elem, gebe a második; ihm Dativ."),
  row("modal", "Oda tudod adni nekem a tollat?", "Kannst du mir den Stift geben?", "A ragozott módbeli segédige elöl, az infinitív a végén.", "mir Dativ; den Stift Akkusativ."),
  row("perfect", "Odaadtam neki a könyvet. · nő", "Ich habe ihr das Buch gegeben.", "Perfekt keret: habe … gegeben", "ihr Dativ, das Buch Akkusativ."),
  row("subordinate", "Tudom, hogy odaadja neki a kulcsot. · férfi adja nőnek", "Ich weiß, dass er ihr den Schlüssel gibt.", "dass után a ragozott ige a végére kerül.", "ihr Dativ, den Schlüssel Akkusativ."),
  row("imperative", "Add oda neki a kulcsot! · férfi", "Gib ihm den Schlüssel!", "Felszólítás: Gib!", "ihm Dativ; den Schlüssel Akkusativ."),
  row("formal", "Odaadná nekem a számlát?", "Würden Sie mir die Rechnung geben?", "Udvarias kérés", "mir Dativ, die Rechnung Akkusativ."),
  row("neg-object", "Nem adok neki pénzt. · férfi", "Ich gebe ihm kein Geld.", "kein tagadja a főnevet.", "ihm Dativ; kein Geld Akkusativ."),
  row("neg-action", "Nem adom oda neki a pénzt. · nő", "Ich gebe ihr das Geld nicht.", "nicht a cselekvést tagadja.", "ihr Dativ; das Geld Akkusativ."),
  row("plural-dat", "A barátaimnak mutatom meg a lakást.", "Ich zeige meinen Freunden die Wohnung.", "Többes Dativ: meinen Freunden", "meinen Freunden Dativ; die Wohnung Akkusativ."),
  row("reflexive", "Veszek magamnak egy kávét.", "Ich kaufe mir einen Kaffee.", "mir = magamnak, Dativ", "mir Dativ; einen Kaffee Akkusativ."),
  row("reflexive-you", "Veszel magadnak egy jegyet.", "Du kaufst dir eine Fahrkarte.", "dir = magadnak", "dir Dativ; eine Fahrkarte Akkusativ."),
  row("reflexive-us", "Foglalunk magunknak egy asztalt.", "Wir reservieren uns einen Tisch.", "uns = magunknak", "uns Dativ; einen Tisch Akkusativ."),
  row("name-recipient", "Odaadom Annának a könyvet.", "Ich gebe Anna das Buch.", "A tulajdonnév névelő nélkül is lehet Dativ.", "Anna a címzett, das Buch a dolog."),
  row("name-pronoun", "Odaadom neki a könyvet. · Anna", "Ich gebe ihr das Buch.", "Anna → sie → ihr", "A nőnemű Dativ névmás ihr."),
  row("relative", "Ez az a férfi, akinek a könyvet adom.", "Das ist der Mann, dem ich das Buch gebe.", "vonatkozó Dativ: dem", "A dem a Mann-ra utal, és a mellékmondatban Dativ."),
  row("relative-akk", "Ez az a férfi, akit látok.", "Das ist der Mann, den ich sehe.", "vonatkozó Akkusativ: den", "A den a Mann-ra utal, és a sehen tárgya.")
];

const akkPrepData = {
  für: [
    ["Számodra hoztam ezt.", "Ich habe das für dich gebracht."], ["Ez a gyermeknek szól.", "Das ist für das Kind."], ["Ajándékot veszünk a tanárnak.", "Wir kaufen ein Geschenk für den Lehrer."], ["A családjáért dolgozik. · nő", "Sie arbeitet für ihre Familie."], ["Köszönöm a segítséget.", "Danke für die Hilfe."], ["Ez fontos nekem.", "Das ist wichtig für mich."]
  ],
  um: [
    ["Az asztal körül ülünk.", "Wir sitzen um den Tisch."], ["A ház körül fut.", "Er läuft um das Haus."], ["Tíz órakor kezdődik.", "Es beginnt um zehn Uhr."], ["Egy állásról van szó.", "Es geht um eine Stelle."], ["Segítséget kér. · nő", "Sie bittet um Hilfe."], ["A sarkon megyünk.", "Wir gehen um die Ecke."]
  ],
  durch: [
    ["Átmegyünk a parkon.", "Wir gehen durch den Park."], ["Áthajtanak a városon.", "Sie fahren durch die Stadt."], ["Az ablakon keresztül néz ki. · nő", "Sie schaut durch das Fenster."], ["Az erdőn át vezet az út.", "Der Weg führt durch den Wald."], ["A bejáraton át megyek be.", "Ich gehe durch den Eingang hinein."], ["A hibáinkon keresztül tanulunk.", "Wir lernen durch unsere Fehler."]
  ],
  ohne: [
    ["Nélküled megyek.", "Ich gehe ohne dich."], ["Cukor nélkül issza a kávét. · férfi", "Er trinkt den Kaffee ohne Zucker."], ["Kulcs nélkül nem tudunk bemenni.", "Wir können ohne den Schlüssel nicht hinein."], ["A gyerekek nélkül utaztok.", "Ihr reist ohne die Kinder."], ["Nem hoz döntést segítség nélkül. · nő", "Sie trifft keine Entscheidung ohne Hilfe."], ["Kabát nélkül van kint. · férfi", "Er ist ohne Mantel draußen."]
  ],
  gegen: [
    ["A terv ellen szavazok.", "Ich stimme gegen den Plan."], ["A falnak támasztja a kerékpárt. · nő", "Sie lehnt das Fahrrad gegen die Wand."], ["A csapatunk ellen játszanak.", "Sie spielen gegen unsere Mannschaft."], ["Gyógyszert szed a fájdalomra. · férfi", "Er nimmt ein Mittel gegen die Schmerzen."], ["Öt óra körül érkezünk.", "Wir kommen gegen fünf Uhr."], ["Nem tehetünk semmit az időjárás ellen.", "Wir können nichts gegen das Wetter tun."]
  ]
};
const akkPrepRows = Object.entries(akkPrepData).flatMap(([prep, items]) => items.map(([hu, de], index) => row(`${prep}-${index+1}`, hu, de, `${prep} + Akkusativ`, `A ${prep} mindig Akkusativot kér.`)));

const datPrepData = {
  mit: [["Velem jössz?", "Kommst du mit mir?"], ["Vonattal utazunk.", "Wir fahren mit dem Zug."], ["A nővérével beszél. · férfi", "Er spricht mit seiner Schwester."], ["A gyerekekkel játszanak.", "Sie spielen mit den Kindern."], ["Késsel vágja fel a kenyeret. · nő", "Sie schneidet das Brot mit einem Messer."]],
  nach: [["Munka után hazamegyek.", "Nach der Arbeit gehe ich nach Hause."], ["Vacsora után sétálunk.", "Nach dem Abendessen gehen wir spazieren."], ["Érdeklődik a menetrend felől. · nő", "Sie fragt nach dem Fahrplan."], ["Berlinbe utaznak.", "Sie fahren nach Berlin."], ["Véleményem szerint ez helyes.", "Meiner Meinung nach ist das richtig."]],
  aus: [["Magyarországról jövök.", "Ich komme aus Ungarn."], ["Kiveszi a könyvet a táskából. · férfi", "Er nimmt das Buch aus der Tasche."], ["Fából készült az asztal.", "Der Tisch ist aus Holz."], ["Kimegyünk a házból.", "Wir gehen aus dem Haus."], ["Szeretetből teszi. · nő", "Sie tut es aus Liebe."]],
  zu: [["Az orvoshoz megyek.", "Ich gehe zum Arzt."], ["A barátnőjéhez megy. · nő", "Sie geht zu ihrer Freundin."], ["Odamegyünk a gyerekekhez.", "Wir gehen zu den Kindern."], ["Gyere hozzám!", "Komm zu mir!"], ["Túl későn érkeztek az órára.", "Ihr kommt zu spät zum Unterricht."]],
  von: [["Tőle kaptam a levelet. · férfi", "Ich habe den Brief von ihm bekommen."], ["A pályaudvarról jövünk.", "Wir kommen vom Bahnhof."], ["A tanárnőtől tanul sokat. · férfi", "Er lernt viel von der Lehrerin."], ["A barátairól beszél. · nő", "Sie spricht von ihren Freunden."], ["Ezt a könyvet a gyermektől kaptam.", "Ich habe dieses Buch vom Kind bekommen."]],
  bei: [["Nálam maradsz.", "Du bleibst bei mir."], ["A szüleinél lakik. · nő", "Sie wohnt bei ihren Eltern."], ["Munka közben zenét hallgatok.", "Bei der Arbeit höre ich Musik."], ["Az orvosnál várunk.", "Wir warten beim Arzt."], ["Esőben otthon maradnak.", "Bei Regen bleiben sie zu Hause."]],
  seit: [["Egy hete itt vagyok.", "Ich bin seit einer Woche hier."], ["Hétfő óta dolgozik. · férfi", "Er arbeitet seit Montag."], ["Gyermekkora óta ismeri őt. · nő ismer férfit", "Sie kennt ihn seit ihrer Kindheit."], ["Két hónapja tanulunk németül.", "Wir lernen seit zwei Monaten Deutsch."], ["Reggel óta esik.", "Seit dem Morgen regnet es."]]
};
const datPrepRows = Object.entries(datPrepData).flatMap(([prep, items]) => items.map(([hu, de], index) => row(`${prep}-${index+1}`, hu, de, `${prep} + Dativ`, `A ${prep} Dativot kér. A rögzült összevonásokat is figyeld.`)));

const twoWay = [
  ["in-kitchen", "Küche", "in die Küche", "in der Küche", "Bemegyek a konyhába.", "Ich gehe in die Küche.", "A konyhában vagyok.", "Ich bin in der Küche."],
  ["auf-table", "Tisch", "auf den Tisch", "auf dem Tisch", "Az asztalra teszem a könyvet.", "Ich lege das Buch auf den Tisch.", "A könyv az asztalon fekszik.", "Das Buch liegt auf dem Tisch."],
  ["an-wall", "Wand", "an die Wand", "an der Wand", "A falra akasztja a képet. · nő", "Sie hängt das Bild an die Wand.", "A kép a falon lóg.", "Das Bild hängt an der Wand."],
  ["unter-bed", "Bett", "unter das Bett", "unter dem Bett", "Az ágy alá teszi a dobozt. · férfi", "Er stellt die Kiste unter das Bett.", "A doboz az ágy alatt áll.", "Die Kiste steht unter dem Bett."],
  ["ueber-sofa", "Sofa", "über das Sofa", "über dem Sofa", "A kanapé fölé akasztjuk a lámpát.", "Wir hängen die Lampe über das Sofa.", "A lámpa a kanapé fölött lóg.", "Die Lampe hängt über dem Sofa."],
  ["vor-house", "Haus", "vor das Haus", "vor dem Haus", "A ház elé állítjátok az autót.", "Ihr stellt das Auto vor das Haus.", "Az autó a ház előtt áll.", "Das Auto steht vor dem Haus."],
  ["hinter-door", "Tür", "hinter die Tür", "hinter der Tür", "Az ajtó mögé teszem a táskát.", "Ich stelle die Tasche hinter die Tür.", "A táska az ajtó mögött van.", "Die Tasche steht hinter der Tür."],
  ["neben-chair", "Stuhl", "neben den Stuhl", "neben dem Stuhl", "A szék mellé teszi az asztalt. · nő", "Sie stellt den Tisch neben den Stuhl.", "Az asztal a szék mellett áll.", "Der Tisch steht neben dem Stuhl."],
  ["between-chairs", "Stühle", "zwischen die Stühle", "zwischen den Stühlen", "A székek közé teszi a táskát. · férfi", "Er stellt die Tasche zwischen die Stühle.", "A táska a székek között van.", "Die Tasche steht zwischen den Stühlen."]
];
const twoWayForms = twoWay.flatMap(([id, noun, goal, place]) => [
  row(`${id}-goal`, `${noun} · célhely / hová kerül?`, goal, "Célhely → Akkusativ", `A tárgy vagy személy új célhelyre kerül: ${goal}.`),
  row(`${id}-place`, `${noun} · hely / hol van?`, place, "Hely → Dativ", `A mondat meglévő helyet ír le: ${place}.`)
]);
const twoWaySentences = twoWay.flatMap(([id,,,, goalHu, goalDe, placeHu, placeDe]) => [
  row(`${id}-goal-sentence`, goalHu, goalDe, "Hová kerül? → Akkusativ", "Nem a mozgás puszta ténye számít, hanem az új célhely."),
  row(`${id}-place-sentence`, placeHu, placeDe, "Hol van/történik? → Dativ", "A mondat helyet ír le, ezért Dativ.")
]);

const questionNegationRows = [
  row("wen-see", "Kit látsz?", "Wen siehst du?", "wen → Akkusativ", "A személy közvetlen tárgyára wen kérdez."),
  row("wem-help", "Kinek segítesz?", "Wem hilfst du?", "wem → Dativ", "A helfen Dativjára wem kérdez."),
  row("what-buy", "Mit vesz? · nő", "Was kauft sie?", "was → tárgy", "A megvett dolog Akkusativ."),
  row("whom-answer", "Kinek válaszol? · férfi", "Wem antwortet er?", "antworten + Dativ", "A címzett Dativ."),
  row("who-sees", "Ki látja a férfit?", "Wer sieht den Mann?", "wer → Nominativ", "Wer az alanyra, den Mann az Akkusativ tárgyra kérdez."),
  row("who-help", "Ki segít a nőnek?", "Wer hilft der Frau?", "wer + Dativ-vonzat", "Wer Nominativ; der Frau Dativ."),
  row("give-who-what", "Kinek mit adsz?", "Wem gibst du was?", "wem | was", "Wem Dativ, was Akkusativ."),
  row("show-what-who", "Mit mutat neki? · nő mutat férfinak", "Was zeigt sie ihm?", "was + ihm", "Was Akkusativ; ihm Dativ."),
  row("no-man", "Nem látok férfit.", "Ich sehe keinen Mann.", "kein + hímnemű Akkusativ", "kein Mann → keinen Mann."),
  row("no-woman", "Nem látok nőt.", "Ich sehe keine Frau.", "nőnemű Akkusativ: keine", "A nőnemű alak Akkusativban nem változik."),
  row("no-child", "Nem látok gyermeket.", "Ich sehe kein Kind.", "semleges Akkusativ: kein", "A semleges alak Akkusativban nem változik."),
  row("help-no-man", "Egyetlen férfinak sem segítek.", "Ich helfe keinem Mann.", "kein + hímnemű Dativ", "keinem Mann Dativ."),
  row("help-no-woman", "Egyetlen nőnek sem segítek.", "Ich helfe keiner Frau.", "nőnemű Dativ: keiner", "keiner Frau Dativ."),
  row("help-no-child", "Egyetlen gyermeknek sem segítek.", "Ich helfe keinem Kind.", "semleges Dativ: keinem", "keinem Kind Dativ."),
  row("not-see-him", "Nem látom őt. · férfi", "Ich sehe ihn nicht.", "ihn + nicht", "ihn Akkusativ; nicht a látást tagadja."),
  row("not-help-him", "Nem segítek neki. · férfi", "Ich helfe ihm nicht.", "ihm + nicht", "ihm Dativ; nicht a cselekvést tagadja."),
  row("not-give-book", "Nem adom oda neki a könyvet. · nő", "Ich gebe ihr das Buch nicht.", "ihr + das Buch + nicht", "ihr Dativ, das Buch Akkusativ."),
  row("give-no-book", "Nem adok neki könyvet. · nő", "Ich gebe ihr kein Buch.", "kein Buch", "ihr Dativ; kein Buch Akkusativ."),
  row("which-man", "Melyik férfit ismered?", "Welchen Mann kennst du?", "welcher → welchen", "Hímnemű Akkusativ: welchen Mann."),
  row("which-man-dat", "Melyik férfinak hiszel?", "Welchem Mann glaubst du?", "welcher → welchem", "Hímnemű Dativ: welchem Mann."),
  row("whose-child", "Melyik gyermeknek segítetek?", "Welchem Kind helft ihr?", "welchem Kind", "Semleges Dativ: welchem Kind."),
  row("which-friends", "Melyik barátokat hívjátok meg?", "Welche Freunde ladet ihr ein?", "többes Akkusativ: welche", "A többes Akkusativ alak welche."),
  row("which-friends-dat", "Melyik barátoknak írtok?", "Welchen Freunden schreibt ihr?", "többes Dativ: welchen + -n", "welchen Freunden Dativ."),
  row("formal-question", "Kinek adja oda a dokumentumot? · Ön", "Wem geben Sie das Dokument?", "Sie alany, wem Dativ", "Wem kérdez a címzettre; das Dokument Akkusativ.")
];

const tensePairs = [
  ["help", "Segítek neki. · férfi", "Ich helfe ihm.", "Segítettem neki. · férfi", "Ich habe ihm geholfen.", "helfen + Dativ minden igeidőben"],
  ["see", "Látom őt. · nő", "Ich sehe sie.", "Láttam őt. · nő", "Ich habe sie gesehen.", "sehen + Akkusativ"],
  ["give", "Odaadom neki a könyvet. · férfi", "Ich gebe ihm das Buch.", "Odaadtam neki a könyvet. · férfi", "Ich habe ihm das Buch gegeben.", "Dativ + Akkusativ Perfektben is"],
  ["thank", "Köszönetet mondunk neki. · nő", "Wir danken ihr.", "Köszönetet mondtunk neki. · nő", "Wir haben ihr gedankt.", "danken + Dativ"],
  ["visit", "Meglátogatjuk a tanárt.", "Wir besuchen den Lehrer.", "Meglátogattuk a tanárt.", "Wir haben den Lehrer besucht.", "besuchen + Akkusativ"],
  ["send", "Üzenetet küld neki. · nő küld férfinak", "Sie schickt ihm eine Nachricht.", "Üzenetet küldött neki. · nő küldött férfinak", "Sie hat ihm eine Nachricht geschickt.", "ihm Dativ, eine Nachricht Akkusativ"],
  ["explain", "Elmagyarázom nektek a szabályt.", "Ich erkläre euch die Regel.", "Elmagyaráztam nektek a szabályt.", "Ich habe euch die Regel erklärt.", "euch Dativ"],
  ["can-help", "Segíthetek Önnek?", "Kann ich Ihnen helfen?", "Tudna nekem segíteni?", "Könnten Sie mir helfen?", "A módbeli segédige nem változtatja meg a Dativot."],
  ["must-see", "Látnom kell az orvost.", "Ich muss den Arzt sehen.", "Látnom kellett az orvost.", "Ich musste den Arzt sehen.", "sehen + Akkusativ a módbeli szerkezetben is"],
  ["would-give", "Odaadja nekem a kulcsot. · nő", "Sie gibt mir den Schlüssel.", "Odaadná nekem a kulcsot. · nő", "Sie würde mir den Schlüssel geben.", "mir Dativ, den Schlüssel Akkusativ"],
  ["imperative-help", "Segítesz a gyermeknek.", "Du hilfst dem Kind.", "Segíts a gyermeknek!", "Hilf dem Kind!", "helfen felszólításban is Dativ"],
  ["imperative-give", "Odaadod neki a jegyet. · nő", "Du gibst ihr die Fahrkarte.", "Add oda neki a jegyet! · nő", "Gib ihr die Fahrkarte!", "ihr Dativ, die Fahrkarte Akkusativ"],
  ["future-send", "Elküldjük nekik a csomagot.", "Wir schicken ihnen das Paket.", "El fogjuk küldeni nekik a csomagot.", "Wir werden ihnen das Paket schicken.", "Futur I-ben is ihnen Dativ"],
  ["subordinate-tell", "Elmeséli nekem a történetet. · férfi", "Er erzählt mir die Geschichte.", "Tudom, hogy elmeséli nekem a történetet. · férfi", "Ich weiß, dass er mir die Geschichte erzählt.", "Mellékmondatban az ige kerül a végére, az eset nem változik."]
];
const tenseRows = tensePairs.flatMap(([id, hu1, de1, hu2, de2, explanation]) => [
  row(`${id}-base`, hu1, de1, "Alapszerkezet", explanation),
  row(`${id}-changed`, hu2, de2, "Az igeidő vagy mód változik; az esetvonzat marad.", explanation)
]);

const diagnosticRows = [
  row("d1", "A férfit látom, nem a nőt.", "Ich sehe den Mann, nicht die Frau.", "sehen + Akkusativ", "den Mann és die Frau Akkusativ."),
  row("d2", "A férfinak segítek, nem a nőnek.", "Ich helfe dem Mann, nicht der Frau.", "helfen + Dativ", "dem Mann és der Frau Dativ."),
  row("d3", "Odaadja neki. · a könyvet férfinak", "Sie gibt es ihm.", "két névmás: es + ihm", "es Akkusativ, ihm Dativ."),
  row("d4", "Megmutatod nekik a lakást.", "Du zeigst ihnen die Wohnung.", "címzett + dolog", "ihnen Dativ, die Wohnung Akkusativ."),
  row("d5", "A tanár nélkül tanulunk.", "Wir lernen ohne den Lehrer.", "ohne + Akkusativ", "den Lehrer hímnemű Akkusativ."),
  row("d6", "A tanárral tanulunk.", "Wir lernen mit dem Lehrer.", "mit + Dativ", "dem Lehrer hímnemű Dativ."),
  row("d7", "A szobába teszi a széket. · férfi", "Er stellt den Stuhl in das Zimmer.", "célhely: in + Akkusativ", "den Stuhl tárgy; in das Zimmer célhely.", "Er stellt den Stuhl ins Zimmer."),
  row("d8", "A szék a szobában áll.", "Der Stuhl steht in dem Zimmer.", "hely: in + Dativ", "in dem Zimmer helyet jelöl.", "Der Stuhl steht im Zimmer."),
  row("d9", "Kinek adtátok oda a kulcsot?", "Wem habt ihr den Schlüssel gegeben?", "wem + Perfekt", "wem Dativ, den Schlüssel Akkusativ."),
  row("d10", "Kit kérdeztetek meg?", "Wen habt ihr gefragt?", "wen + fragen", "fragen + Akkusativ."),
  row("d11", "Ennek a gyermeknek írok egy levelet.", "Ich schreibe diesem Kind einen Brief.", "diesem Kind + einen Brief", "diesem Kind Dativ, einen Brief Akkusativ."),
  row("d12", "Ezt a gyermeket ismerem.", "Ich kenne dieses Kind.", "dieses Kind Akkusativ", "Semleges Nominativ és Akkusativ azonos alakú."),
  row("d13", "A barátaimnak veszek jegyeket.", "Ich kaufe meinen Freunden Fahrkarten.", "meinen Freunden", "Többes Dativban -n: Freunden."),
  row("d14", "A barátaimat meghívom.", "Ich lade meine Freunde ein.", "meine Freunde Akkusativ", "Többes Akkusativban nincs -n toldalék."),
  row("d15", "Ez a zene tetszik nekünk.", "Diese Musik gefällt uns.", "gefallen + Dativ", "A zene az alany; uns a Dativban álló tapasztaló."),
  row("d16", "Szükségünk van erre a zenére.", "Wir brauchen diese Musik.", "brauchen + Akkusativ", "diese Musik Akkusativ."),
  row("d17", "A könyvet a nőnek adom.", "Das Buch gebe ich der Frau.", "kiemelt Akkusativ az első helyen", "das Buch Akkusativ, der Frau Dativ."),
  row("d18", "A nőnek adom a könyvet.", "Der Frau gebe ich das Buch.", "kiemelt Dativ az első helyen", "der Frau Dativ, das Buch Akkusativ."),
  row("d19", "Bízol bennem?", "Vertraust du mir?", "vertrauen + Dativ", "ich → mir."),
  row("d20", "Szeretsz engem?", "Liebst du mich?", "lieben + Akkusativ", "ich → mich."),
  row("d21", "Azt mondja, hogy segít nekik. · nő", "Sie sagt, dass sie ihnen hilft.", "dass + helfen + Dativ", "ihnen Dativ; hilft a mellékmondat végén."),
  row("d22", "Azt mondja, hogy látja őket. · nő", "Sie sagt, dass sie sie sieht.", "dass + sehen + Akkusativ", "Az első sie az alany, a második sie Akkusativ; sieht a végén áll.")
];

const units = [
  unit("case-mental-map", 5, "A1", "A cselekvés célpontja és címzettje", "Mit mozgat a cselekvés, és kihez jut el?", "Az Akkusativ gyakran a cselekvés közvetlen célpontja vagy az átadott dolog. A Dativ gyakran a címzett vagy érintett személy. Ez erős kezdő kapaszkodó, de az ige és az elöljáró rögzített vonzata mindig elsőbbséget élvez.", { title: "Mentális kép", lines: ["ÉN → DOLGOT → CÍMZETT", "dolog: Akkusativ", "címzett: Dativ"] }, [{de:"Ich gebe dem Mann den Schlüssel.",hu:"A férfinak adom a kulcsot."},{de:"Sie zeigt mir das Foto.",hu:"Megmutatja nekem a fényképet."}], [{title:"Döntési sorrend",columns:["Kérdés","Szerep","Eset"],rows:[["Mit?","átadott vagy közvetlenül érintett dolog","Akkusativ"],["Kinek?","címzett vagy érintett személy","Dativ"]]}], [phase("roles","Kinek és mit?","Először csak a két mondatrészt azonosítsd.",mentalRoles),phase("sentences","Teljes átadási mondatok","Tíz különböző ige és élethelyzet.",mentalSentences)]),
  unit("case-pronoun-contrast", 6, "A1", "mich vagy mir? – minden személy", "Akkusativ és Dativ névmások teljes rendszere.", "A névmás alakja a mondatbeli szereptől függ. mich = engem, mir = nekem; dich = téged, dir = neked; ihn = őt, ihm = neki. Az uns és euch alak mindkét esetben azonos, ezért ott az ige és a jelentés dönt.", {title:"Gyors kontraszt",lines:["mich = engem | mir = nekem","dich = téged | dir = neked","ihn = őt | ihm = neki"]}, [{de:"Sie sieht mich.",hu:"Lát engem."},{de:"Sie hilft mir.",hu:"Segít nekem."}], [{title:"Személyes névmások",columns:["Alany","Akkusativ","Dativ"],rows:[["ich","mich","mir"],["du","dich","dir"],["er","ihn","ihm"],["sie","sie","ihr"],["es","es","ihm"],["wir","uns","uns"],["ihr","euch","euch"],["sie","sie","ihnen"],["Sie","Sie","Ihnen"]]}], [phase("forms","Alakpárok","Minden személy külön.",pronounForms),phase("sentences","Kontrasztmondatok","sehen vagy helfen jelzi az esetet.",pronounSentences)]),
  unit("case-definite-articles", 7, "A1", "der–den–dem minden nemben", "Tizenkét főnév hím-, nő-, semlegesnemben és többes számban.", "A hímnem mutatja leglátványosabban a váltást: der → den → dem. Nőnemben die → die → der, semlegesnemben das → das → dem. Többes Dativban den áll, és a főnév rendszerint -n végződést kap.", {title:"Ritmus",lines:["der – den – dem","die – die – der","das – das – dem","die – die – den + n"]}, [{de:"Ich sehe den Arzt.",hu:"Látom az orvost."},{de:"Ich helfe dem Arzt.",hu:"Segítek az orvosnak."}], [{title:"Határozott névelő",columns:["Nem/szám","Nominativ","Akkusativ","Dativ"],rows:[["hímnem","der","den","dem"],["nőnem","die","die","der"],["semleges","das","das","dem"],["többes","die","die","den + többnyire -n"]]}], [phase("forms","Tizenkét alaksor","Ugyanaz a főnév három esetben.",articleForms),phase("sentences","Akkusativ vagy Dativ","Minden főnév két eltérő mondatban.",articleSentences)]),
  unit("case-determiners", 8, "A1–A2", "ein, kein, mein, dieser", "Névelőszók és birtokos alakok több nemben.", "Az ein-típusú és dieser-típusú szavak végződése mutatja az esetet. Hímnemű Akkusativban -en, hím- és semleges Dativban -em, nőnemű Dativban -er, többes Dativban -en jelenik meg.", {title:"Végződések",lines:["hím Akk: -en","hím/semleges Dat: -em","nőnem Dat: -er","többes Dat: -en"]}, [{de:"Ich sehe meinen Bruder.",hu:"Látom a fiútestvéremet."},{de:"Ich helfe meinem Bruder.",hu:"Segítek a fiútestvéremnek."}], [{title:"Példasor",columns:["Nominativ","Akkusativ","Dativ"],rows:[["mein Bruder","meinen Bruder","meinem Bruder"],["eine Frau","eine Frau","einer Frau"],["dieses Kind","dieses Kind","diesem Kind"]]}], [phase("forms","Névelőszói alaksorok","Tizenkét különböző névelő és főnév.",determinerForms),phase("sentences","Alakok mondatban","A forma mellett az igevonzat is dönt.",determinerSentences)]),
  unit("case-akk-verbs", 9, "A1–A2", "Akkusativot kérő igék", "Tizenhat gyakori igét a vonzatával együtt tanulsz.", "Ne csak az ige magyar jelentését tárold. Tanuld együtt a mintát: jemanden sehen, jemanden fragen, etwas brauchen. Ezekben a személy vagy dolog Akkusativban áll.", {title:"Tárolási minta",lines:["sehen → jemanden sehen","fragen → jemanden fragen","brauchen → etwas brauchen"]}, [{de:"Ich frage den Lehrer.",hu:"Megkérdezem a tanárt."},{de:"Wir suchen den Bahnhof.",hu:"A pályaudvart keressük."}], [{title:"Igevonzat",columns:["Ige","Minta"],rows:akkVerbs.slice(0,8).map(([id,chunk])=>[id.replace("hoeren","hören"),chunk])}], [phase("chunks","Ige és vonzat","Először egyetlen egységként.",akkChunks),phase("sentences","Akkusativ-igék mondatokban","Személyek, dolgok, nemek és igeidők változnak.",akkVerbSentences)]),
  unit("case-dat-verbs", 10, "A1–B1", "Dativot kérő igék", "Tizenhat gyakori Dativ-ige különböző környezetben.", "A magyar kérdés jó kapaszkodó lehet, de a biztos tudás az igevonzat: jemandem helfen, jemandem danken, jemandem vertrauen. A gefallen típusnál az, ami tetszik, az alany; akinek tetszik, Dativ.", {title:"Tárolási minta",lines:["helfen → jemandem helfen","danken → jemandem danken","gefallen → jemandem gefallen"]}, [{de:"Diese Jacke gefällt mir.",hu:"Tetszik nekem ez a kabát."},{de:"Ich vertraue dem Arzt.",hu:"Bízom az orvosban."}], [{title:"Igevonzat",columns:["Ige","Minta"],rows:datVerbs.slice(0,8).map(([id,chunk])=>[id.replace("zuhoeren","zuhören"),chunk])}], [phase("chunks","Ige és Dativ-vonzat","Az igét a jemandem alakkal együtt tárold.",datChunks),phase("sentences","Dativ-igék mondatokban","Névmások és főnevek minden nemben.",datVerbSentences)]),
  unit("case-transfer-verbs", 11, "A1–B1", "Valakinek valamit", "Húsz átadási, közlési és felajánlási szerkezet.", "Két tárgynál előbb azonosítsd a címzettet, majd a dolgot. A címzett rendszerint Dativ, a közvetlenül átadott, megmutatott vagy közölt dolog Akkusativ.", {title:"Váz",lines:["jemandem etwas geben","jemandem etwas zeigen","jemandem etwas erklären"]}, [{de:"Ich empfehle dir diesen Film.",hu:"Ezt a filmet ajánlom neked."},{de:"Sie liest dem Kind eine Geschichte vor.",hu:"Felolvas a gyermeknek egy történetet."}], [{title:"Szerepek",columns:["Elem","Kérdés","Eset"],rows:[["címzett","kinek?","Dativ"],["dolog/tartalom","mit?","Akkusativ"]]}], [phase("roles","Címzett és dolog","Húsz mondat részeinek azonosítása.",transferRoles),phase("sentences","Teljes mondatok","Húsz ige és élethelyzet.",transferSentences)]),
  unit("case-object-order", 12, "A2–B1", "Tárgyak és névmások szórendje", "Főnevek, névmások, kérdések, kiemelés és mellékmondatok.", "Két főnévi tárgynál a Dativ rendszerint megelőzi az Akkusativot. Ha az egyik névmás, a névmás többnyire előrébb kerül. Két névmásnál az Akkusativ rendszerint a Dativ előtt áll: Ich gebe es ihm.", {title:"Három alapminta",lines:["dem Mann das Buch","ihm das Buch | es dem Mann","es ihm"]}, [{de:"Ich gebe dem Mann das Buch.",hu:"A férfinak adom a könyvet."},{de:"Ich gebe es ihm.",hu:"Odaadom neki."}], [{title:"Semleges alapszórend",columns:["Tárgyak","Minta"],rows:[["két főnév","Dativ + Akkusativ"],["névmás + főnév","névmás előbb"],["két névmás","Akkusativ + Dativ"]]}], [phase("patterns","Szórendi minták","Huszonnyolc eltérő mondatszerkezet.",orderRows)]),
  unit("case-akk-prepositions", 13, "A1–A2", "für, um, durch, ohne, gegen", "Öt mindig Akkusativot kérő elöljáró, harminc mondatban.", "A für, um, durch, ohne és gegen mindig Akkusativot kér. A FUDOG csak emlékeztető; a biztos tudást a teljes kifejezések adják: für mich, ohne dich, durch den Park.", {title:"FUDOG",lines:["für · um · durch · ohne · gegen","mindig Akkusativ"]}, [{de:"Wir gehen durch den Park.",hu:"Átmegyünk a parkon."},{de:"Ich gehe ohne dich.",hu:"Nélküled megyek."}], [{title:"Rögzített eset",columns:["Elöljáró","Eset"],rows:[["für","Akkusativ"],["um","Akkusativ"],["durch","Akkusativ"],["ohne","Akkusativ"],["gegen","Akkusativ"]]}], [phase("sentences","Harminc Akkusativ-kifejezés","Minden elöljáró hat különböző helyzetben.",akkPrepRows)]),
  unit("case-dat-prepositions", 14, "A1–A2", "mit, nach, aus, zu, von, bei, seit", "Hét mindig Dativot kérő elöljáró, harmincöt mondatban.", "A mit, nach, aus, zu, von, bei és seit Dativot kér. Tanuld a gyakori összevonásokat is: zu dem → zum, zu der → zur, von dem → vom, bei dem → beim.", {title:"Riasztó",lines:["mit mich ✗","mit mir ✓","mit + mindig Dativ"]}, [{de:"Kommst du mit mir?",hu:"Velem jössz?"},{de:"Ich gehe zum Arzt.",hu:"Az orvoshoz megyek."}], [{title:"Gyakori összevonások",columns:["Teljes alak","Összevonás"],rows:[["zu dem","zum"],["zu der","zur"],["von dem","vom"],["bei dem","beim"]]}], [phase("sentences","Harmincöt Dativ-kifejezés","Minden elöljáró öt különböző helyzetben.",datPrepRows)]),
  unit("case-two-way", 15, "A1–B1", "Hely vagy célhely?", "Kilenc kétirányú elöljáró, párosított mondatokkal.", "A kétirányú elöljáróknál ne egyszerűen mozgást keress. Ha valami új célhelyre kerül, Akkusativ áll. Ha a mondat azt mondja meg, hol van vagy hol történik valami, Dativ áll. Ich fahre in der Stadt ezért Dativ: a városon belüli helyet jelöli.", {title:"Pontos kapaszkodó",lines:["hová kerül? → Akkusativ","hol van/történik? → Dativ","nem pusztán: mozog vagy áll"]}, [{de:"Ich lege das Buch auf den Tisch.",hu:"Az asztalra teszem a könyvet."},{de:"Das Buch liegt auf dem Tisch.",hu:"A könyv az asztalon fekszik."}], [{title:"Kilenc kétirányú elöljáró",columns:["an","auf","hinter","in","neben","über","unter","vor","zwischen"],rows:[["Akk/Dat","Akk/Dat","Akk/Dat","Akk/Dat","Akk/Dat","Akk/Dat","Akk/Dat","Akk/Dat","Akk/Dat"]]}], [phase("forms","Célhely és hely kifejezései","Ugyanaz a főnév két esetben.",twoWayForms),phase("sentences","Párosított mondatok","stellen–stehen, legen–liegen és hängen.",twoWaySentences)]),
  unit("case-questions-negation", 16, "A1–B1", "wer, wen, wem és tagadás", "Kérdőszavak, kein/nicht és welcher-alakok.", "A wer az alanyra, a wen az Akkusativ személyre, a wem a Dativ személyre kérdez. A kein egy főnevet tagad és ragozódik; a nicht a cselekvést vagy más mondatrészt tagadja.", {title:"Kérdéshármas",lines:["wer? → Nominativ","wen? → Akkusativ","wem? → Dativ"]}, [{de:"Wen siehst du?",hu:"Kit látsz?"},{de:"Wem hilfst du?",hu:"Kinek segítesz?"}], [{title:"Kérdőszavak",columns:["Nominativ","Akkusativ","Dativ"],rows:[["wer?","wen?","wem?"]]}], [phase("sentences","Kérdés és tagadás","Huszonnégy eltérő feladat.",questionNegationRows)]),
  unit("case-time-mood", 17, "A2–B1", "Az eset igeidőkben és módokban", "Präsens, Perfekt, Präteritum, modalitás, feltételes mód és felszólítás.", "Az ige alakja és a szórend változhat, de a vonzat megmarad. helfen Perfektben is Dativot, sehen módbeli segédigével is Akkusativot, geben pedig továbbra is Dativ címzettet és Akkusativ dolgot kér.", {title:"Állandó mag",lines:["igeidő változik","szórend változhat","esetvonzat megmarad"]}, [{de:"Ich habe ihm geholfen.",hu:"Segítettem neki."},{de:"Könnten Sie mir helfen?",hu:"Tudna nekem segíteni?"}], [{title:"Átalakítás",columns:["Változhat","Megmarad"],rows:[["igeidő, mód, szórend","az ige esetvonzata"]]}], [phase("sentences","Alapmondat és átalakítás","Tizennégy szerkezet két-két változatban.",tenseRows)]),
  unit("case-diagnostic", 18, "A2–B1", "Akk vagy Dat? – vegyes diagnózis", "A teljes rendszer keverve, de minden válasz után konkrét döntési útvonallal.", "Itt már nem egyetlen kategória jelzi a választ. Előbb keresd az igét vagy elöljárót, utána a mondatrészt, végül válaszd ki a nemnek és számnak megfelelő alakot.", {title:"Döntési sorrend",lines:["1. ige vagy elöljáró","2. szerep: alany, tárgy, címzett, hely/célhely","3. nem, szám és névelőalak"]}, [{de:"Vertraust du mir?",hu:"Bízol bennem?"},{de:"Liebst du mich?",hu:"Szeretsz engem?"}], [{title:"Három ellenőrzés",columns:["1","2","3"],rows:[["vonzat","mondatszerep","helyes alak"]]}], [phase("sentences","Vegyes diagnózis","Huszonkét gondosan kevert feladat.",diagnosticRows)])
];

const goalCount = units.flatMap(u => u.phases.flatMap(p => p.rows)).length;
if (goalCount !== 445) throw new Error(`Expected 445 case-lab goals, got ${goalCount}.`);
for (const u of units) {
  const seen = new Set();
  for (const p of u.phases) for (const item of p.rows) {
    const key = `${p.id}:${item.key}`;
    if (seen.has(key)) throw new Error(`Duplicate goal ${u.id}:${key}`);
    seen.add(key);
    if (!item.prompt || !item.target || !item.explanation) throw new Error(`Incomplete goal ${u.id}:${key}`);
  }
}

writeFileSync(output, JSON.stringify({ schemaVersion: 1, id: "de-case-lab-v1", title: "Akkusativ–Dativ labor", goalCount, units }, null, 2) + "\n");
console.log(`Wrote ${goalCount} case-lab goals to ${output}`);
