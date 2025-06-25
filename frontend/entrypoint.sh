#!/bin/sh
# entrypoint.sh

# ROOT_URL aus Umgebungsvariable einfügen oder fallback verwenden
echo "window.ROOT_URL = '${ROOT_URL:-localhost}';" > /app/public/env.js

# Danach: eigentlichen Server starten
exec "$@"