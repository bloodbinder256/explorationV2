param(
  [Parameter(Mandatory=$true)]
  [string]$Version
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$htmlFiles = Get-ChildItem -Path $root -Recurse -Filter *.html

foreach ($file in $htmlFiles) {
  $text = Get-Content -LiteralPath $file.FullName -Raw
  $text = $text -replace '(\.css|\.js)\?v=\d+', ('${1}?v=' + $Version)
  $text = $text -replace '((?:href|src)=[''\"](?!https?://|data:)[^''\"]+?\.(?:css|js))(?!\?v=\d+)([''\"])', ('$1?v=' + $Version + '$2')
  Set-Content -LiteralPath $file.FullName -Value $text -Encoding UTF8
}

Write-Host "Updated cache-busting version to ?v=$Version in HTML files."
