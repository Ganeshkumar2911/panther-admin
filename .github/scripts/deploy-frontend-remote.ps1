param(
    [Parameter(Mandatory = $true)]
    [string]$Root,

    [Parameter(Mandatory = $true)]
    [string]$Incoming,

    [Parameter(Mandatory = $true)]
    [string]$Backups,

    [Parameter(Mandatory = $true)]
    [string]$Package,

    [Parameter(Mandatory = $true)]
    [string]$ReleaseName
)

$ErrorActionPreference = 'Stop'

Write-Host '[frontend-deploy] ========================================='
Write-Host '[frontend-deploy] Starting frontend deployment'
Write-Host "[frontend-deploy] Release: $ReleaseName"
Write-Host "[frontend-deploy] Root: $Root"
Write-Host '[frontend-deploy] ========================================='

if (-not (Test-Path -LiteralPath $Package)) {
    throw "Frontend package not found: $Package"
}

Add-Type -AssemblyName System.IO.Compression.FileSystem

$stage = Join-Path $Incoming $ReleaseName

Write-Host "[frontend-deploy] Stage: $stage"

Remove-Item -LiteralPath $stage -Recurse -Force -ErrorAction SilentlyContinue

New-Item -ItemType Directory -Force -Path $stage | Out-Null

Write-Host '[frontend-deploy] Extracting frontend release...'

[System.IO.Compression.ZipFile]::ExtractToDirectory($Package, $stage)

$newIndex = Join-Path $stage 'index.html'

if (-not (Test-Path -LiteralPath $newIndex)) {
    throw 'index.html was not found in frontend release.'
}

Write-Host '[frontend-deploy] index.html found.'

$newFiles = Get-ChildItem -LiteralPath $stage -Recurse -File

if (-not $newFiles) {
    throw 'Frontend release contains no files.'
}

Write-Host "[frontend-deploy] Files in release: $($newFiles.Count)"

$currentIndex = Join-Path $Root 'index.html'

if (Test-Path -LiteralPath $currentIndex) {
    $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
    $backupFile = Join-Path $Backups "index-$timestamp.html"

    Write-Host "[frontend-deploy] Backing up current index: $backupFile"

    Copy-Item -LiteralPath $currentIndex -Destination $backupFile -Force
}

Write-Host '[frontend-deploy] Copying frontend assets...'

robocopy $stage $Root /E /R:2 /W:1 /XF index.html /NFL /NDL /NP

if ($LASTEXITCODE -ge 8) {
    throw "Frontend asset copy failed with robocopy exit code $LASTEXITCODE"
}

Write-Host '[frontend-deploy] Assets copied successfully.'
Write-Host '[frontend-deploy] Publishing index.html...'

Copy-Item -LiteralPath $newIndex -Destination $currentIndex -Force

if (-not (Test-Path -LiteralPath $currentIndex)) {
    throw 'Published index.html does not exist.'
}

Write-Host '[frontend-deploy] index.html published successfully.'

Remove-Item -LiteralPath $stage -Recurse -Force -ErrorAction SilentlyContinue

Remove-Item -LiteralPath $Package -Force -ErrorAction SilentlyContinue

Get-ChildItem -LiteralPath $Backups -Filter 'index-*.html' -File | Sort-Object LastWriteTime -Descending | Select-Object -Skip 3 | Remove-Item -Force

Write-Host '[frontend-deploy] ========================================='
Write-Host '[frontend-deploy] Frontend deployment succeeded'
Write-Host "[frontend-deploy] Release: $ReleaseName"
Write-Host '[frontend-deploy] ========================================='
