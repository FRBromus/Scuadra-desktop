@echo off
rem Arranca Scuadra escritorio en modo Cowork (agentes + carpetas locales).
rem Doble clic para usarlo. Log en %TEMP%\scuadra-cowork.log
cd /d C:\scuadra\scuadra-desktop
set "PATH=%LOCALAPPDATA%\Microsoft\WinGet\Packages\Oven-sh.Bun_Microsoft.Winget.Source_8wekyb3d8bbwe\bun-windows-x64;%PATH%"
set OPENWORK_DEV_MODE=1
pnpm --filter @openwork/desktop dev > "%TEMP%\scuadra-cowork.log" 2>&1
