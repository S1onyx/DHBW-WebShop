# DHBW-WebShop

A modern, full-stack webshop for AI-generated pixel art. Built as part of a university project at DHBW Stuttgart using HTML/CSS/JS, Node.js, PostgreSQL, and Docker.

---

## 🔧 Lokaler Start mit Docker

```bash
./start.sh
```

Der Webshop ist danach erreichbar unter:

| Dienst       | URL                                       | Beschreibung                        |
|--------------|-------------------------------------------|-------------------------------------|
| **Frontend** | [http://localhost](http://localhost)      | Statische Website mit Produktliste |
| **API**      | [http://localhost/api/products](http://localhost/api/products) | REST-API über nginx-Proxy |
| **API (dev)**| [http://localhost:3000/api/products](http://localhost:3000/api/products) | Direkter Zugriff aufs Backend |

---

## 📁 Projektstruktur (Auszug)

- `frontend/` – Statisches HTML/CSS/JS-Frontend
- `backend/` – Node.js Backend mit PostgreSQL-Anbindung
- `backend/db/init.sql` – Erstinitialisierung der Datenbank (Tabelle + Seed-Daten)
- `docker/` – Dockerfiles + nginx-Konfiguration
- `docker-compose.yml` – Multi-Container-Orchestrierung
- `start.sh` – Start-Skript für lokalen Betrieb

---

## 🗂️ API-Endpunkte

| Methode | Route                    | Beschreibung                       |
|---------|--------------------------|------------------------------------|
| GET     | `/api/products`          | Gibt alle Produkte als JSON zurück |

---

## 📝 Hinweise

- Backend ist auf Port `3000` auch direkt erreichbar
- API-Aufrufe aus dem Frontend nutzen `/api/products`, was per nginx an das Backend weitergeleitet wird
