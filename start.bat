@echo off
setlocal EnableDelayedExpansion

:: Initialzustand
set RESET_DB=false

:: Argument prüfen
if "%1"=="--resetDB" (
    set RESET_DB=true
)

if "!RESET_DB!"=="true" (
    echo WARNUNG: Die Datenbank wird vollständig zurückgesetzt!
    echo Stoppe und lösche Container & Volumes...
    docker compose down -v --remove-orphans
) else (
    echo Starte Webshop ohne Zurücksetzen der Datenbank...
    docker compose down --remove-orphans
)

:: Alte Images entfernen
echo Entferne alte Images...
docker rmi webshop_backend webshop_frontend 2>nul

:: Compose Build mit no-cache
echo Baue Container mit --no-cache...
docker compose build --no-cache

:: Container starten
echo Starte Container...
docker compose up