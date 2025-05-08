@echo off
setlocal EnableDelayedExpansion

set RESET_DB=false
set DEV_MODE=false

:: Argumente analysieren
for %%A in (%*) do (
    if "%%~A"=="--resetDB" set RESET_DB=true
    if "%%~A"=="--dev" set DEV_MODE=true
)

:: DEV-MODUS
if "!DEV_MODE!"=="true" (
    echo [DEV] Starte im DEV-Modus (lokal mit Vite & Nodemon, DB in Docker)

    if "!RESET_DB!"=="true" (
        echo [DEV] Zuruecksetzen der Datenbank...
        docker compose down -v --remove-orphans
    ) else (
        docker compose down --remove-orphans
    )

    echo [DEV] Starte nur die Datenbank im Hintergrund...
    docker compose up -d db

    echo [DEV] Installiere Abhaengigkeiten...
    cd backend
    call npm install
    cd ..\frontend
    call npm install
    cd ..

    echo [DEV] Starte Backend (Nodemon) in neuem Fenster...
    start "Backend" cmd /k "cd backend && npx nodemon app.js"

    echo [DEV] Starte Frontend (Vite) in neuem Fenster...
    start "Frontend" cmd /k "cd frontend && npx vite"

    exit /b
)

:: DOCKER-MODUS
if "!RESET_DB!"=="true" (
    echo WARNUNG: Die Datenbank wird vollständig zurückgesetzt!
    echo Stoppe und lösche Container & Volumes...
    docker compose down -v --remove-orphans
) else (
    echo Starte Webshop ohne Zurücksetzen der Datenbank...
    docker compose down --remove-orphans
)

echo Entferne alte Images...
docker rmi webshop_backend webshop_frontend 2>nul

echo Baue Container mit --no-cache...
docker compose build --no-cache

echo Starte Container...
docker compose up