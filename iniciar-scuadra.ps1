# Arranca Scuadra escritorio cargando Scuadra web (http://localhost:4200).
# Requisito: tener Scuadra web corriendo (frontend en C:\scuadra\app\scuadra-frontend).
# Uso: clic derecho > "Ejecutar con PowerShell", o desde una terminal: .\iniciar-scuadra.ps1

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

# Bun (instalado por winget) no siempre está en el PATH de la sesión
$bunDir = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\Oven-sh.Bun_Microsoft.Winget.Source_8wekyb3d8bbwe\bun-windows-x64"
if (Test-Path $bunDir) { $env:Path = "$bunDir;$env:Path" }

$env:OPENWORK_DEV_MODE = "1"
$env:SCUADRA_MODE = "1"
$env:OPENWORK_ELECTRON_START_URL = "http://localhost:4200"

pnpm --filter "@openwork/desktop" dev
