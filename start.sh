#!/bin/bash

RESET_DB=false

if [[ "$1" == "--resetDB" ]]; then
  RESET_DB=true
fi

if $RESET_DB; then
  echo "WARNUNG: Die Datenbank wird vollständig zurückgesetzt!"
  echo "Stoppe und lösche Container & Volumes..."
  docker compose down -v --remove-orphans
else
  echo "Starte Webshop ohne Zurücksetzen der Datenbank..."
  docker compose down --remove-orphans
fi

# Alte Images entfernen
echo "Entferne alte Images..."
docker rmi webshop_backend webshop_frontend 2>/dev/null || true

# Compose mit no-cache
echo "Baue Container mit --no-cache..."
docker compose build --no-cache

echo "Starte Container..."
docker compose up