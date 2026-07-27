#!/usr/bin/env python3
"""Static/data validator for LanguageDeck v91 Course Core."""
from __future__ import annotations

import csv
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ERRORS: list[str] = []
WARNINGS: list[str] = []
OK: list[str] = []


def err(msg: str) -> None:
    ERRORS.append(msg)


def warn(msg: str) -> None:
    WARNINGS.append(msg)


def ok(msg: str) -> None:
    OK.append(msg)


def read_csv(path: Path) -> list[dict[str, str]]:
    try:
        with path.open(encoding="utf-8-sig", newline="") as f:
            reader = csv.DictReader(f)
            if not reader.fieldnames:
                err(f"CSV header missing: {path.relative_to(ROOT)}")
                return []
            rows = list(reader)
            for line_no, row in enumerate(rows, 2):
                if None in row:
                    err(f"CSV width mismatch: {path.relative_to(ROOT)} line {line_no}")
            return rows
    except Exception as exc:
        err(f"Could not read CSV {path.relative_to(ROOT)}: {exc}")
        return []


def read_json(path: Path) -> dict:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        err(f"Could not parse JSON {path.relative_to(ROOT)}: {exc}")
        return {}


def resolve_alias(value: str, aliases: dict[str, str]) -> str:
    current = value
    seen: set[str] = set()
    while current in aliases:
        if current in seen:
            err(f"Alias cycle: {value}")
            return current
        seen.add(current)
        current = aliases[current]
    return current


def validate_shared_lexicon() -> tuple[set[str], dict[str, str]]:
    lex_path = ROOT / "decks/de/lexicon.csv"
    alias_path = ROOT / "decks/de/aliases.csv"
    lex = read_csv(lex_path)
    aliases_rows = read_csv(alias_path)
    ids = [r.get("lexeme_id", "") for r in lex]
    if len(ids) != len(set(ids)):
        err("Duplicate lexeme_id in decks/de/lexicon.csv")
    bad_shape = [x for x in ids if not re.fullmatch(r"de\.lex\.[a-z0-9-]+(?:\.[a-z0-9-]+)*", x)]
    if bad_shape:
        err(f"Non-v91 canonical IDs in lexicon: {bad_shape[:5]}")
    aliases: dict[str, str] = {}
    for row in aliases_rows:
        old, target = row.get("old_lexeme_id", ""), row.get("canonical_lexeme_id", "")
        if not old or not target:
            err("Blank alias row")
            continue
        if old in aliases and aliases[old] != target:
            err(f"Conflicting alias: {old}")
        aliases[old] = target
    id_set = set(ids)
    for old in aliases:
        target = resolve_alias(old, aliases)
        if target not in id_set:
            err(f"Alias target missing: {old} -> {target}")
    ok(f"Canonical lexicon: {len(lex)} unique entries")
    ok(f"Alias map: {len(aliases)} old IDs resolve to canonical IDs")
    return id_set, aliases


def validate_word_decks(ids: set[str], aliases: dict[str, str]) -> None:
    paths = sorted((ROOT / "decks/de/words").glob("*.csv"))
    paths += sorted((ROOT / "decks/de/texts").rglob("words.csv"))
    paths += sorted((ROOT / "decks/de/stories").rglob("words.csv"))
    for path in paths:
        rows = read_csv(path)
        if not rows:
            warn(f"Empty word file: {path.relative_to(ROOT)}")
            continue
        if "lexeme_id" not in rows[0]:
            err(f"lexeme_id column missing: {path.relative_to(ROOT)}")
            continue
        missing = []
        for row in rows:
            lid = row.get("lexeme_id", "")
            if not lid or resolve_alias(lid, aliases) not in ids:
                missing.append(lid or "<blank>")
        if missing:
            err(f"Unresolved lexeme IDs in {path.relative_to(ROOT)}: {missing[:8]}")
        else:
            ok(f"{path.relative_to(ROOT)}: {len(rows)} rows, all lexeme IDs resolve")


def validate_story(ids: set[str], aliases: dict[str, str]) -> None:
    base = ROOT / "decks/de/stories/baker-street-launchpad"
    story = read_json(base / "story.json")
    chapters = sorted(story.get("chapters", []), key=lambda x: int(x.get("order", 0)))
    if [int(x.get("order", 0)) for x in chapters] != list(range(1, len(chapters) + 1)):
        err("Story chapter order is not continuous")
    if "progress" in story or "completed" in story:
        err("story.json must not contain learner progress")
    seen_lexemes: set[str] = set()
    surface_ids: dict[tuple[str, str], str] = {}
    total_sentences = 0
    total_sections = 0
    load_rows: list[tuple[str, str, int, int]] = []
    for chapter in chapters:
        folder = ROOT / "decks/de" / chapter["folder"]
        required = ["unit.json", "sentences.csv", "words.csv", "anchors.csv", "patterns.csv"]
        for name in required:
            if not (folder / name).exists():
                err(f"Missing chapter file: {(folder / name).relative_to(ROOT)}")
        unit = read_json(folder / "unit.json")
        if unit.get("storyId") != story.get("id"):
            err(f"{chapter['id']}: storyId mismatch")
        if unit.get("chapterId") != chapter.get("id"):
            err(f"{chapter['id']}: chapterId mismatch")
        if int(unit.get("chapterOrder", 0)) != int(chapter.get("order", 0)):
            err(f"{chapter['id']}: chapterOrder mismatch")
        if int(unit.get("chapterCount", 0)) != len(chapters):
            err(f"{chapter['id']}: chapterCount mismatch")
        if unit.get("lexiconFile") != "../../../lexicon.csv":
            warn(f"{chapter['id']}: unexpected lexiconFile path")
        if unit.get("aliasesFile") != "../../../aliases.csv":
            warn(f"{chapter['id']}: unexpected aliasesFile path")
        sentences = read_csv(folder / "sentences.csv")
        words = read_csv(folder / "words.csv")
        anchors = read_csv(folder / "anchors.csv")
        patterns = read_csv(folder / "patterns.csv")
        sentence_ids = [r.get("id", "") for r in sentences]
        if len(sentence_ids) != len(set(sentence_ids)):
            err(f"{chapter['id']}: duplicate sentence IDs")
        seqs = [int(r.get("seq", "0") or 0) for r in sentences]
        if seqs != list(range(1, len(sentences) + 1)):
            err(f"{chapter['id']}: seq is not continuous")
        if any(not r.get("chunks") for r in sentences):
            err(f"{chapter['id']}: authored chunks missing")
        word_ids = {r.get("id", "") for r in words}
        if len(word_ids) != len(words):
            err(f"{chapter['id']}: duplicate word item IDs")
        local_patterns = {r.get("id", "") for r in patterns}
        for row in sentences:
            for pid in (row.get("pattern", "") or "").split("|"):
                if pid and pid not in local_patterns:
                    err(f"{chapter['id']}/{row.get('id')}: missing pattern definition {pid}")
        for row in words:
            lid = resolve_alias(row.get("lexeme_id", ""), aliases)
            if lid not in ids:
                err(f"{chapter['id']}/{row.get('id')}: unresolved lexeme {row.get('lexeme_id')}")
            if row.get("source_id") not in set(sentence_ids):
                err(f"{chapter['id']}/{row.get('id')}: invalid source_id {row.get('source_id')}")
            key = ((row.get("target") or "").casefold(), (row.get("article") or "").casefold())
            previous = surface_ids.get(key)
            if previous and previous != lid:
                err(f"Story ID inconsistency for {row.get('target')}: {previous} / {lid}")
            surface_ids[key] = lid
        for row in anchors:
            if row.get("sentence_id") not in set(sentence_ids):
                err(f"{chapter['id']}: anchor sentence missing {row.get('sentence_id')}")
            if row.get("item_id") not in word_ids:
                err(f"{chapter['id']}: anchor item missing {row.get('item_id')}")
        sections: list[str] = []
        for row in sentences:
            scene = row.get("scene") or "1"
            if scene not in sections:
                sections.append(scene)
        for scene in sections:
            scene_sentence_ids = {r["id"] for r in sentences if (r.get("scene") or "1") == scene}
            fresh = []
            for row in words:
                lid = resolve_alias(row.get("lexeme_id", ""), aliases)
                if row.get("source_id") in scene_sentence_ids and lid not in seen_lexemes and lid not in fresh:
                    fresh.append(lid)
            seen_lexemes.update(fresh)
            batches = max(1, (len(fresh) + 9) // 10)
            load_rows.append((chapter["id"], scene, len(fresh), batches))
        total_sentences += len(sentences)
        total_sections += len(sections)
        if len(sentences) != int(chapter.get("sentences", -1)):
            err(f"{chapter['id']}: story.json sentence count mismatch")
        if len(sections) != int(chapter.get("sections", -1)):
            err(f"{chapter['id']}: story.json section count mismatch")
        ok(f"{chapter['id']}: {len(sentences)} sentences, {len(sections)} sections, {len(words)} word rows")
    source_map = read_csv(base / "source-map.csv")
    if not source_map:
        err("source-map.csv is empty")
    unknown_chapters = {r.get("course_chapter") for r in source_map} - {c.get("id") for c in chapters}
    if unknown_chapters:
        err(f"source-map references unknown chapters: {sorted(unknown_chapters)}")
    ok(f"Mini-arc: {len(chapters)} chapters, {total_sections} sections, {total_sentences} sentences, {len(seen_lexemes)} unique lexemes")
    for chapter, scene, count, batches in load_rows:
        if count > 10:
            warn(f"{chapter} scene {scene}: {count} first-seen lexemes -> {batches} preparation batches")


def validate_manifest_and_shell() -> None:
    manifest = read_json(ROOT / "decks/de/manifest.json")
    deck_ids = {d.get("id") for d in manifest.get("decks", [])}
    for needed in ["de-baker-nebel-01", "de-baker-brief-02", "de-baker-hof-03"]:
        if needed not in deck_ids:
            err(f"Chapter missing from decks/de/manifest.json: {needed}")
    course_index = read_json(ROOT / "decks/de/courses/index.json")
    if not course_index.get("courses"):
        err("Course index is empty")
    sw = (ROOT / "sw.js").read_text(encoding="utf-8")
    assets = re.findall(r'"(\./[^\"]+)"', sw.split("];", 1)[0])
    for asset in assets:
        rel = asset[2:]
        if not rel:
            continue
        if not (ROOT / rel).exists():
            err(f"Service worker APP_SHELL asset missing: {asset}")
    ok(f"Service worker shell: {len(assets)} declared assets exist")


def main() -> int:
    ids, aliases = validate_shared_lexicon()
    validate_word_decks(ids, aliases)
    validate_story(ids, aliases)
    validate_manifest_and_shell()
    print(f"OK={len(OK)} WARN={len(WARNINGS)} ERROR={len(ERRORS)}")
    for label, rows in [("OK", OK), ("WARN", WARNINGS), ("ERROR", ERRORS)]:
        for row in rows:
            print(f"[{label}] {row}")
    return 1 if ERRORS else 0


if __name__ == "__main__":
    sys.exit(main())
