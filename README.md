# DHBW WebShop

A minimal, full-stack webshop project using HTML/CSS/JavaScript (no frontend framework), a Node.js backend, a PostgreSQL database, and Docker for orchestration.  
Built for educational purposes at DHBW Stuttgart.

---

## ⚡ TL;DR – Quickstart

### macOS/Linux

```bash
git clone https://github.com/your-username/DHBW-WebShop.git
cd DHBW-WebShop
./start.sh
```

### Windows (CMD)

```cmd
git clone https://github.com/your-username/DHBW-WebShop.git
cd DHBW-WebShop
start.bat
```

- Access frontend at: [http://localhost:1337](http://localhost:1337)
- API via proxy: [http://localhost:1337/api/products](http://localhost:1337/api/products)
- API (direct backend): [http://localhost:3000/api/products](http://localhost:3000/api/products)

---

## 🛠️ System Requirements

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- Bash shell (macOS/Linux) or CMD/PowerShell (Windows)
- (for dev mode) Node.js and npm

---

## 🚀 Local Development

### Start using Docker (recommended)

```bash
./start.sh           # macOS/Linux
start.bat            # Windows
```

This will:
- Build all services
- Run backend (Node.js), database (PostgreSQL), frontend (HTML/JS), and nginx

### Available Options

#### `--resetDB`
Reset and reinitialize the database with demo data.

```bash
./start.sh --resetDB         # macOS/Linux
start.bat --resetDB          # Windows
```

> ⚠️ This deletes **all data** and recreates the database schema from `init.sql`.

#### `--dev`
Run frontend with `vite` and backend with `nodemon` (hot reload), while keeping the DB in Docker.

```bash
./start.sh --dev             # macOS/Linux
```

If you want to start the project in dev mode on a Windows machine, please use Git Bash or a similar shell to run `./start.sh --dev`. The `.bat` file does not support the `--dev` flag (dev mode).

You can combine both:

```bash
./start.sh --dev --resetDB
```

---

## 📁 Project Structure

| Folder/File                  | Description                          |
|-----------------------------|--------------------------------------|
| `frontend/`                 | Static website with HTML, CSS, JS    |
| `backend/`                  | Node.js backend using PostgreSQL     |
| `backend/db/init.sql`       | DB schema and seed products          |
| `docker/`                   | Dockerfiles and nginx config         |
| `docker-compose.yml`        | Full container orchestration         |
| `start.sh` / `start.bat`    | Local startup scripts for all OS     |

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
  Modify `backend/db/init.sql` – restart with `--resetDB`.

- **Add frontend logic:**  
  Edit JS in `frontend/js/main.js` or add new modules. No build steps needed.

---

## 💡 Noteworthy Design Choices

- **No frontend frameworks** – only plain HTML/CSS/JS
- **Single repo** – All components live together
- **Docker-first** – Fully orchestrated via Docker Compose
- **Proxy setup** – Nginx proxies `/api/` to backend

---

## 🧪 Useful Commands

```bash
# Start normally
./start.sh | start.bat

# Reset DB
./start.sh --resetDB | start.bat --resetDB

# Start dev mode
./start.sh --dev

# Reset + Dev
./start.sh --dev --resetDB

# Stop services
docker compose down

# Logs
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