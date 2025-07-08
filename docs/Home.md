# Project Setup & Configuration

This wiki explains how to get started, configure, and run the DHBW WebShop.

---

Command to get all lines and files of code that are in the project
```bash
cloc . \
  --exclude-dir=node_modules,dist,build,coverage,.git,logs,public,__tests__,test \
  --exclude-ext=json,lock,yml,yaml \
```

---

## 🔧 Requirements

- Docker & Docker Compose
- Unix-based shell (Linux/macOS or WSL)
- Git (optional for cloning)
- Node.js + npm (required only for development mode)

---

## 🚀 How to Start the Project

### macOS/Linux

```bash
git clone https://github.com/your-username/DHBW-WebShop.git
cd DHBW-WebShop
./start.sh
```

### Windows

```cmd
git clone https://github.com/your-username/DHBW-WebShop.git
cd DHBW-WebShop
start.bat
```

This will:

- Build all Docker containers
- Start PostgreSQL
- Start the Node.js backend
- Serve the frontend via nginx

---

## 🔁 Dev Mode (Live Development)

You can run the backend with `nodemon` and the frontend with `vite` (live reload):

### macOS/Linux

```bash
./start.sh --dev
```

### Windows

```cmd
start.bat
```

Optional: Reset the DB too:

```bash
./start.sh --dev --resetDB
```

In order to start the project in dev mode, use git bash! start.bat doesn't support the --dev flag.

---

## Common issues

If the live server function is not working, try `npx vite --force` in /frontend or /backend, depending where the problem occurs.

---

## ⚙️ Environment Variables

Backend reads environment variables from `.env`:

```env
DATABASE_URL=postgres://postgres:postgres@db:5432/webshop
PORT=3000
JWT_ACCESS_SECRET=mySuperSecretAccessKey
JWT_ACCESS_EXPIRATION=60
```

In Docker, they are defined directly in `docker-compose.yml`.

---

## 🐳 Docker Architecture

| Service   | Description                  | Port |
|-----------|------------------------------|------|
| `db`      | PostgreSQL database          | 5432 |
| `backend` | Node.js API server           | 3000 |
| `frontend`| Static HTML/CSS/JS site      | 1337 |
| `nginx`   | Reverse proxy and frontend   | 80 → 1337 locally |

---

## 📁 File Overview

- `frontend/` – HTML/CSS/JS
- `backend/` – API and database logic
- `docker/` – Dockerfiles and nginx config
- `start.sh` / `start.bat` – Startup scripts for Linux/macOS and Windows

---

## 🔄 Reset Project

To remove all containers and volumes:

```bash
docker compose down -v
```

Then re-run the script as shown above.
