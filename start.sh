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

# === Cleanup bei Ctrl+C ===
cleanup() {
  echo ""
  echo "⏹️  Stoppe und lösche Container..."
  docker compose down --remove-orphans
  exit 0
}
trap cleanup SIGINT SIGTERM

# === DEV-MODUS ===
if $DEV_MODE; then
  export NODE_ENV=development
  echo "🌱 Starte im DEV-Modus (lokal mit nodemon, DB in Docker)"

  if $RESET_DB; then
    echo "[DEV] Zurücksetzen der Datenbank..."
    docker compose down -v --remove-orphans
  else
    docker compose down --remove-orphans
  fi

  echo "[DEV] Starte Infrastruktur über Docker (nur DB & Mail)..."
  docker compose up -d db mailpit

  echo "[DEV] Installiere lokale Abhängigkeiten..."
  (cd backend && npm install)
  (cd frontend && npm install)

  echo "[DEV] Starte lokale Server mit NODE_ENV=development..."
  npx concurrently --kill-others-on-fail --names "backend,frontend" \
    "cd backend && NODE_ENV=development npx nodemon app.js" \
    "cd frontend && NODE_ENV=development npx nodemon app.js"

  cleanup
fi

# === STANDARD-MODUS (Docker) ===
if $RESET_DB; then
  echo "WARNUNG: Die Datenbank wird vollständig zurückgesetzt!"
  echo "Stoppe und lösche Container & Volumes..."
  docker compose down -v --remove-orphans
else
  echo "Stoppe alte Container (ohne Volumes zu löschen)..."
  docker compose down --remove-orphans
fi

echo "Entferne alte Images..."
docker rmi webshop_backend webshop_frontend 2>/dev/null || true

echo "🛠️  Baue Container mit --no-cache..."
docker compose build --no-cache

echo "🚀 Starte Webshop (Container im Vordergrund)..."
docker compose up &
COMPOSE_PID=$!

# Warte auf Beenden oder Ctrl+C
wait $COMPOSE_PID

# Fallback, falls `wait` sauber endet
cleanup