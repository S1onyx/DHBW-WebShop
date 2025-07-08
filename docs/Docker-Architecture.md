# 🐳 Docker Setup – DHBW WebShop

This project uses **Docker Compose** to orchestrate the full-stack webshop — including backend, frontend, database, and mail service.

---

## 📦 Services Overview

```mermaid
flowchart TD
  subgraph "🛒 DHBW WebShop Stack"
    direction LR

    User["🧑‍💻 User<br>Browser / Client"]

    FRONTEND["🌐 Statisches Frontend<br>HTML / CSS / JS<br>Port: 1337"]

    BACKEND["⚙️ Node.js Backend<br>REST API Server<br>Endpunkte – siehe Bruno-Doku"]

    DB["🗄️ PostgreSQL 16<br>Relationale Datenbank<br>Port: 5432"]

    MAILPIT["📬 Mailpit<br>SMTP: 1025<br>Web UI: 8025"]
  end

  User -->|localhost:1337| FRONTEND
  User -->|localhost:8025| MAILPIT

  FRONTEND -->|"API: localhost:3000/api/*"| BACKEND
  BACKEND -->|"DB-Zugriff über postgres://postgres:postgres@localhost:5432/webshop"| DB
  BACKEND -->|"E-Mail-Versand: localhost:1025"| MAILPIT

  classDef db fill:#fdf6e3,stroke:#657b83,stroke-width:2px,color:#586e75;
  classDef backend fill:#e0f7fa,stroke:#00796b,stroke-width:2px,color:#004d40;
  classDef frontend fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#bf360c;
  classDef mail fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px,color:#4a148c;
  classDef user fill:#e8f5e9,stroke:#43a047,stroke-width:2px,color:#1b5e20;

  class DB db;
  class BACKEND backend;
  class FRONTEND frontend;
  class MAILPIT mail;
  class User user;
```

| Service    | Description                        | Role                                  | Port(s)           |
|------------|------------------------------------|---------------------------------------|-------------------|
| `db`       | PostgreSQL 16                      | Relational database                   | `5432`            |
| `backend`  | Node.js server                     | REST API                              | `3000`    |
| `frontend` | Static HTML/JS/CSS (Vite/Nginx)    | Frontend client interface             | `1337`            |
| `mailpit`  | Mailpit                            | SMTP + Mail UI                        | `1025`, `8025`    |

---

## ⚙️ Running the Stack

To start all services in **production mode**:

```bash
./start.sh
```

For **development mode**:

```bash
./start.sh --dev
```

To reset the db please add the flag:

```bash
--resetDB
```

---

## 🧹 Cleanup

please use ctrl + c to stop the services

```bash
docker compose down            # Stop containers
docker compose down -v         # Remove volumes
docker rmi webshop_backend webshop_frontend  # Optional: remove old images
```

---

## 📁 Notes

- Backend uploads mapped to `./backend/uploads`
- Database initialized from `./backend/db/`
- Mail service via Mailpit: [localhost:8025](http://localhost:8025)
