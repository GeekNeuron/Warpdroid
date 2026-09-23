$ErrorActionPreference = "Stop"

$candidates = @(
  "ISCC.exe",
  "$Env:ProgramFiles(x86)\Inno Setup 6\ISCC.exe",
  "$Env:ProgramFiles\Inno Setup 6\ISCC.exe"
)

$iscc = $null
foreach ($c in $candidates) {
  $found = Get-Command $c -ErrorAction SilentlyContinue
  if ($found) {
    $iscc = $found.Source
    break
  }
  if (Test-Path $c) {
    $iscc = $c
    break
  }
}

if (-not $iscc) {
  Write-Error "Inno Setup Compiler (ISCC.exe) not found. Install Inno Setup from https://jrsoftware.org/isdl.php"
  exit 1
}

$exePath = Join-Path $PSScriptRoot "..\dist\warpdroid.exe"
if (-not (Test-Path $exePath)) {
  Write-Error "warpdroid.exe not found at $exePath. Run 'npm run build:exe' first."
  exit 1
}

& $iscc "$PSScriptRoot\warpdroid.iss"
