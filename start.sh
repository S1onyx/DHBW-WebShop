#!/bin/bash

RESET_DB=false

if [[ "$1" == "--resetDB" ]]; then
  RESET_DB=true
fi

if $RESET_DB; then
  echo "⚠️  WARNUNG: Die Datenbank wird vollständig zurückgesetzt!"
  echo "📦 Stoppe und lösche Container & Volumes..."
  docker compose down -v --remove-orphans
else
  echo "🔄 Starte Webshop ohne Zurücksetzen der Datenbank..."
  docker compose down --remove-orphans
fi

echo "🚀 Baue und starte Docker-Container..."
docker compose up --build