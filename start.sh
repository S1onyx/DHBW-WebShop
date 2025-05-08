#!/bin/bash

RESET_DB=false
DEV_MODE=false

# Argumente analysieren
for arg in "$@"; do
  case $arg in
    --resetDB)
      RESET_DB=true
      ;;
    --dev)
      DEV_MODE=true
      ;;
    *)
      echo "Unbekannter Parameter: $arg"
      exit 1
      ;;
  esac
done

if $DEV_MODE; then
  echo "Starte im DEV-Modus (lokal mit Vite und Nodemon, DB in Docker)"

  if $RESET_DB; then
    echo "[DEV] Zurücksetzen der Datenbank..."
    docker compose down -v --remove-orphans
  else
    docker compose down --remove-orphans
  fi

  echo "[DEV] Starte Datenbank über Docker..."
  docker compose up -d db

  echo "[DEV] Starte lokale Entwicklung..."
  (cd backend && npm install)
  (cd frontend && npm install)

  npx concurrently \
    "cd backend && npx nodemon app.js" \
    "cd frontend && npx vite"

  exit 0
fi

# Standard-Flow (kein DEV-Modus)
if $RESET_DB; then
  echo "WARNUNG: Die Datenbank wird vollständig zurückgesetzt!"
  echo "Stoppe und lösche Container & Volumes..."
  docker compose down -v --remove-orphans
else
  echo "Starte Webshop ohne Zurücksetzen der Datenbank..."
  docker compose down --remove-orphans
fi

echo "Entferne alte Images..."
docker rmi webshop_backend webshop_frontend 2>/dev/null || true

echo "Baue Container mit --no-cache..."
docker compose build --no-cache

echo "Starte Container..."
docker compose up