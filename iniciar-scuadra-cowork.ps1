# Arranca Scuadra escritorio en modo Cowork (interfaz nativa de agentes,
# sesiones sobre carpetas locales). No requiere Scuadra web.
# Uso: clic derecho > "Ejecutar con PowerShell", o: .\iniciar-scuadra-cowork.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$bunDir = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Oven-sh.Bun_Microsoft.Winget.Source_8wekyb3d8bbwe\bun-windows-x64"
if (Test-Path $bunDir) { $env:Path = "$bunDir;$env:Path" }

$env:OPENWORK_DEV_MODE = "1"

pnpm --filter "@openwork/desktop" dev 2>&1 | Tee-Object -FilePath "$env:TEMP\scuadra-cowork.log"
