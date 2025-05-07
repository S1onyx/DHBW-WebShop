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

### Manual start (no Docker)

> Useful for debugging or step-by-step control.

#### 1. Start PostgreSQL manually  
You need a local PostgreSQL running with a `webshop` database and this schema:

```sql
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL
);
```

Seed data can be found in [`backend/db/init.sql`](backend/db/init.sql)

#### 2. Configure environment

Create a `.env` file in `/backend`:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/webshop
PORT=3000
```

#### 3. Start backend

```bash
cd backend
npm install
node app.js
```

#### 4. Open `frontend/index.html` in browser  
(Or serve with any static server, e.g. `npx serve frontend`)

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
  Modify `backend/db/init.sql` – remember to rebuild DB (`docker compose down -v && ./start.sh`)

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
# Start containers
./start.sh

# Stop all services
docker compose down

# View logs
docker compose logs -f

# Reset database (destructive!)
docker compose down -v && ./start.sh
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
