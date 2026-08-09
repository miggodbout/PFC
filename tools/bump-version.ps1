# =====================================================================
# PFC CONTROL - version stamper
# =====================================================================
# One string in the whole repo decides whether a phone picks up new
# files: CACHE_NAME in control/sw.js. This script writes it, so nobody
# has to remember the exact format or hand-edit the file.
#
# Run it from the repo root.
#
#   powershell -File tools/bump-version.ps1
#       Raises the dev counter by one.
#         pfc-control-0.2.0-dev.7  ->  pfc-control-0.2.0-dev.8
#       This is the everyday case. Run it once before every push that
#       changes any file inside control/.
#
#   powershell -File tools/bump-version.ps1 -Release 0.2.0
#       Drops the counter and stamps the shipped version.
#         pfc-control-0.2.0-dev.8  ->  pfc-control-0.2.0
#       Run this at the commit you tag as 0.2.0.
#
#   powershell -File tools/bump-version.ps1 -Dev 0.3.0
#       Opens the next milestone.
#         pfc-control-0.2.0  ->  pfc-control-0.3.0-dev.1
#
# The counter carries no meaning. It is a tally, not a description of
# what changed. It never resets inside a milestone, and a gap in it is
# harmless. All the cache needs is a string it has not seen before.
# =====================================================================

param(
  # Stamp a shipped version. No counter after it.
  [string]$Release,

  # Open a new milestone at -dev.1.
  [string]$Dev
)

$ErrorActionPreference = 'Stop'

$swPath = Join-Path $PSScriptRoot '..\control\sw.js'
$swPath = [System.IO.Path]::GetFullPath($swPath)

if (-not (Test-Path $swPath)) {
  throw "Cannot find control/sw.js at $swPath"
}

# Read as UTF-8. The file holds em-dashes and box-drawing characters in
# its comments, and the default codepage would mangle every one of them.
$text = [System.IO.File]::ReadAllText($swPath, [System.Text.UTF8Encoding]::new($false))

# The one line that matters.
$pattern = "var CACHE_NAME = 'pfc-control-(?<ver>[^']+)';"
$match = [regex]::Match($text, $pattern)
if (-not $match.Success) {
  throw "Cannot find the CACHE_NAME line in control/sw.js. Was its format changed?"
}

$current = $match.Groups['ver'].Value

if ($Release) {
  $next = $Release
}
elseif ($Dev) {
  $next = "$Dev-dev.1"
}
else {
  # Everyday case: raise the trailing counter.
  $devMatch = [regex]::Match($current, '^(?<base>.*-dev)\.(?<n>\d+)$')
  if (-not $devMatch.Success) {
    throw "The current version '$current' has no dev counter to raise. " +
          "Use -Dev <version> to open a new milestone, or -Release <version> to ship one."
  }
  $n = [int]$devMatch.Groups['n'].Value + 1
  $next = "$($devMatch.Groups['base']).$n"
}

if ($next -eq $current) {
  Write-Host "CACHE_NAME is already pfc-control-$current. Nothing written."
  exit 0
}

$text = [regex]::Replace($text, $pattern, "var CACHE_NAME = 'pfc-control-$next';")

# Write UTF-8 with no byte order mark. A BOM at the top of a service
# worker is served as part of the file and can break the script.
[System.IO.File]::WriteAllText($swPath, $text, [System.Text.UTF8Encoding]::new($false))

Write-Host "CACHE_NAME  pfc-control-$current  ->  pfc-control-$next"
