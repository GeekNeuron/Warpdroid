$ErrorActionPreference = "Stop"

$installDir = Join-Path $Env:LOCALAPPDATA "Warpdroid"

if (Test-Path $installDir) {
  Remove-Item -Recurse -Force $installDir
}

$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
$parts = $userPath -split ";" | Where-Object { $_ -ne $installDir -and $_ -ne "" }
[Environment]::SetEnvironmentVariable("Path", ($parts -join ";"), "User")

Write-Host "Uninstalled Warpdroid"
