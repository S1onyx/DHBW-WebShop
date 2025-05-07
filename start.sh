#!/bin/bash

echo "🔄 Starte Webshop mit Docker Compose..."

docker compose down --remove-orphans
docker compose up --build

# Optional:
# docker-compose logs -f        # Logs verfolgen
# docker-compose down           # Container stoppen