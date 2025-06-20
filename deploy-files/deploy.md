
# 🚀 Webshop Deployment Guide

## 1. 🔧 GitHub Action ausführen

- Automatisch bei:
  - Push auf `dev`
  - Pull Request auf `dev`
- Oder manuell via GitHub UI (`Actions` → Workflow manuell starten)

---

## 2. 📂 Neuen Ordner auf dem Server anlegen (einmalig)

```bash
mkdir webshop-deploy
cd webshop-deploy
mkdir -p uploads/products
```

---

## 3. 🧾 `docker-compose.deploy.yml` anlegen

Diese Datei beinhaltet:
- DB-Volume persistiert
- Uploads persistiert
- Keine erneute Datenbank-Seeds
- Verlinkung zu Images auf Docker Hub

*(Datei hast du bereits, alternativ liefere ich sie gerne erneut aus.)*

---

## 4. 🐳 Images holen und starten

```bash
docker compose -f docker-compose.deploy.yml pull
docker compose -f docker-compose.deploy.yml up -d
```

---

## 5. ✅ Funktionstest

- Backend: http://<server-ip>:3000
- Frontend: http://<server-ip>:1337
- Mailpit: http://<server-ip>:8025

---

## 6. 🔁 Wechsel auf `redeploy`-Variante

Wenn alles wie erwartet läuft:

```bash
mv docker-compose.deploy.yml docker-compose.redeploy.yml
```

---

## 7. 🔄 Zukünftige Updates

Bei Änderungen im `dev`-Branch:

```bash
docker compose -f docker-compose.redeploy.yml down
docker compose -f docker-compose.redeploy.yml pull
docker compose -f docker-compose.redeploy.yml up -d
```
