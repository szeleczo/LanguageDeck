param(
  [string]$ProjectPath = "."
)
# LanguageDeck v20 installer — copies the reorder-mode build into a target
# GitHub Pages repo working copy. Run, then commit + push via the GitHub web UI
# or git, and verify on the live URL with Ctrl+F for "Reorder words".
$ErrorActionPreference = "Stop"
$src = $PSScriptRoot
Write-Host "Installing LanguageDeck v20 (reorder mode) into $ProjectPath" -ForegroundColor Cyan

$files = @(
  "index.html",
  "sw.js",
  "README.md",
  "decks/index.json",
  "decks/de/german_sentence_builder.csv"
)
foreach ($f in $files) {
  $from = Join-Path (Split-Path $src -Parent) $f
  $to   = Join-Path $ProjectPath $f
  $toDir = Split-Path $to -Parent
  if (-not (Test-Path $toDir)) { New-Item -ItemType Directory -Force -Path $toDir | Out-Null }
  Copy-Item $from $to -Force
  Write-Host "  copied $f" -ForegroundColor Green
}
Write-Host "Done. Commit + push, then hard-refresh the PWA (the SW version bump clears the old cache)." -ForegroundColor Cyan
