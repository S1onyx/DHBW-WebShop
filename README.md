# DHBW WebShop

A minimal, full-stack webshop project using HTML/CSS/JavaScript (no frontend framework), a Node.js backend, a PostgreSQL database, and Docker for orchestration.  
Built for educational purposes at DHBW Stuttgart.

---

## ⚡ TL;DR – Quickstart

```bash
git clone https://github.com/your-username/DHBW-WebShop.git
cd DHBW-WebShop
./start.sh
```

- Access frontend at: [http://localhost](http://localhost)  
- API via proxy: [http://localhost/api/products](http://localhost/api/products)  
- API (direct backend): [http://localhost:3000/api/products](http://localhost:3000/api/products)

---

## 🛠️ System Requirements

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- Unix shell with Bash (Linux/macOS or WSL on Windows)

---

## 🚀 Local Development

### Start using Docker (recommended)

```bash
./start.sh
```

This will:
- Build all services
- Run backend (Node.js), database (PostgreSQL), frontend (HTML/JS), and nginx

You can also pass the following option:

```bash
./start.sh --resetDB
```

- This will **reset the database**, delete existing volumes and recreate everything from `init.sql`.
- Ideal for development resets or schema changes.
- ⚠️ **All data will be lost** when using this flag.

### Reset and reinitialize the database

> ⚠️ This deletes **all data** and recreates the database schema from `init.sql`.

```bash
./start.sh --resetDB
```

This will:
- Stop all containers
- Delete the PostgreSQL volume
- Recreate the `webshop` database using [`init.sql`](backend/db/init.sql)
- Start fresh with initial demo data

---

## 📁 Project Structure

| Folder/File                  | Description                          |
|-----------------------------|--------------------------------------|
| `frontend/`                 | Static website with HTML, CSS, JS    |
| `backend/`                  | Node.js backend using PostgreSQL     |
| `backend/db/init.sql`       | DB schema and seed products          |
| `docker/`                   | Dockerfiles and nginx config         |
| `docker-compose.yml`        | Full container orchestration         |
| `start.sh`                  | Bash script to build and run project |

---

## 📦 API Endpoints

| Method | Route              | Description                        |
|--------|--------------------|------------------------------------|
| GET    | `/api/products`    | Returns all products in JSON       |

---

## 🧩 How to Extend

- **Add new routes:**  
  Edit `backend/routes/router.js` and map to a new controller function.

- **Add new models:**  
  Add DB queries in `backend/models/`, e.g., `orderModel.js`.

- **Change schema:**  
  Modify `backend/db/init.sql` – remember to restart with `./start.sh --resetDB`

- **Add frontend logic:**  
  Add JS in `frontend/js/main.js` or new modules. No build steps needed.

---

## 💡 Noteworthy Design Choices

- **No frontend frameworks** – only plain HTML/CSS/JS for full control and simplicity.
- **Single repo** – All components (frontend, backend, DB, Docker) live together.
- **Docker-first** – Fully orchestrated with Docker Compose.
- **Proxy setup** – Nginx proxies `/api/` to the backend.

---

## 🧪 Useful Commands

```bash
# Start containers (preserve existing DB)
./start.sh

# Reset database and seed data
./start.sh --resetDB

# Stop all services
docker compose down

# View logs
docker compose logs -f
```

---

## 🧱 Tech Stack

- Node.js
- PostgreSQL
- Docker + Docker Compose
- Vanilla HTML, CSS, JavaScript
- Nginx

---

Enjoy building!
