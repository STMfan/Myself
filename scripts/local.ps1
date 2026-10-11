param([ValidateSet('install', 'dev', 'build', 'licenses', 'check')][string]$Task = 'dev')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $projectRoot
$taskTemp = Join-Path $projectRoot '.cache\tmp'
New-Item -ItemType Directory -Force $taskTemp | Out-Null
$env:TEMP = $taskTemp
$env:TMP = $taskTemp
$env:TMPDIR = $taskTemp
$env:BUN_INSTALL_CACHE_DIR = Join-Path $projectRoot '.cache\bun'
$env:npm_config_cache = Join-Path $projectRoot '.cache\npm'
switch ($Task) {
  'install' { & bun install --frozen-lockfile }
  'dev' { & bun run dev }
  'build' { & bun run build:pages }
  'licenses' { & bun run licenses }
  'check' { & bun run check:site }
}
exit $LASTEXITCODE
