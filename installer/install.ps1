$ErrorActionPreference = "Stop"

$installDir = Join-Path $Env:LOCALAPPDATA "Warpdroid"
$exeSource = Join-Path $PSScriptRoot "..\dist\warpdroid.exe"

if (-not (Test-Path $exeSource)) {
  Write-Error "warpdroid.exe not found at $exeSource. Run 'npm run build:exe' first."
  exit 1
}

New-Item -ItemType Directory -Force -Path $installDir | Out-Null
Copy-Item -Force $exeSource (Join-Path $installDir "warpdroid.exe")

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$installDir*") {
  [Environment]::SetEnvironmentVariable("Path", "$userPath;$installDir", "User")
}

Write-Host "Installed to $installDir"
Write-Host "Open a new terminal and run: warpdroid --help"
