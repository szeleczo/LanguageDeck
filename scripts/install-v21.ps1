param([string]$ProjectPath = ".")
# LanguageDeck v21 — quick-switch sheet, trimmed menu, new logo/icons.
# Run, commit + push, then hard-refresh the PWA (SW bump clears the old cache).
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
Write-Host "Installing LanguageDeck v21 into $ProjectPath" -ForegroundColor Cyan
$files = @(
  "index.html","sw.js","README.md","icon.svg",
  "icon-192.png","icon-512.png","icon-maskable-512.png",
  "decks/index.json","decks/de/german_sentence_builder.csv"
)
foreach ($f in $files) {
  $from = Join-Path $root $f
  $to   = Join-Path $ProjectPath $f
  $toDir = Split-Path $to -Parent
  if (-not (Test-Path $toDir)) { New-Item -ItemType Directory -Force -Path $toDir | Out-Null }
  Copy-Item $from $to -Force
  Write-Host "  copied $f" -ForegroundColor Green
}
Write-Host "Done. Commit + push, then hard-refresh on the device." -ForegroundColor Cyan
