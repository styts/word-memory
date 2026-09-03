# Word Memory Backend (Express + TypeScript + Prisma + PostgreSQL)

A lightweight, production-ready backend service for receiving, persisting, and logging game play results using Express, TypeScript, Prisma ORM, PostgreSQL, and `tslog`.

---

## 🌟 Features

- **Express & TypeScript**: Strongly-typed HTTP API server with ES modules.
- **Prisma ORM & PostgreSQL**: Relational database persistence for game play results (`PlayResult` model).
- **`tslog` Integration**: Formatted console logging for API events and database operations.
- **Docker & Docker Compose**: Automated multi-container setup with environment variable security.
- **BigInt Safe**: Custom JSON serialization for database timestamps.
- **CORS Enabled**: Configured for cross-origin requests from GitHub Pages.

---

## 🛠️ Project Structure

```
backend/
├── prisma/
│   └── schema.prisma    # PostgreSQL schema (PlayResult model)
├── src/
│   ├── db.ts            # Prisma client singleton
│   └── index.ts         # Express server & API endpoints
├── Dockerfile           # Node 22 Alpine build script
├── docker-compose.yml   # Multi-container setup (Backend + Postgres)
├── .env.example         # Template environment variables
├── .gitignore           # Ignores node_modules, dist, and .env
├── package.json
└── README.md
```

---

## 🐳 Deployment via Docker on Server (`ssh ast`)

### 1. Create your secret `.env` file

On your server inside the `backend` directory, create a `.env` file with secure credentials:

```bash
cat << 'EOF' > .env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_random_password
POSTGRES_DB=wordmemory
DATABASE_URL=postgresql://postgres:your_secure_random_password@db:5432/wordmemory?schema=public
PORT=3001
EOF
```

### 2. Start Containers with Docker Compose

```bash
docker compose up -d --build
```

This will automatically:
- Launch PostgreSQL database container (`word_memory_db`) with volume persistence.
- Build and launch the Express backend container (`word_memory_backend`).
- Bind backend to `127.0.0.1:3001`.

### 3. Sync Database Schema

Run once on startup to sync the Prisma schema:

```bash
docker exec word_memory_backend npx prisma db push
```

### 4. View Server Logs

```bash
docker compose logs -f backend
```

---

## 🔒 HTTPS / Reverse Proxy Setup (NixOS / Nginx)

Since GitHub Pages serves the frontend over **HTTPS**, the API must be proxied behind HTTPS on your server (`ast`).

Add this location rule to `/etc/nixos/configuration.nix` inside `virtualHosts."htz.styts.com"`:

```nix
locations."/word-memory-api/" = { proxyPass = "http://127.0.0.1:3001/"; };
```

Apply the changes:
```bash
sudo nixos-rebuild switch
```

---

## 🚀 Local Development Setup (Without Docker)

### 1. Install Dependencies

```bash
cd backend
pnpm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 3. Push Database Schema & Start Server

```bash
pnpm prisma:generate
npx prisma db push
pnpm dev
```

The server will start at `http://localhost:3001`.

---

## 📡 API Endpoints

### 1. `POST /api/results` (or `POST /results`)

Receives a game play result, saves core metrics + flexible JSON metadata (like `correctWords`, `wrongWords`, `language`, etc.) to PostgreSQL, and logs it with `tslog`.

#### Request Body Example (Supports custom fields)
```json
{
  "id": "1788443621558-3adn",
  "score": 8,
  "targetCount": 10,
  "percent": 80,
  "timestamp": 1788443621558,
  "correctWords": ["Apfel", "Haus", "Sonne"],
  "wrongWords": ["Auto", "Baum"],
  "language": "de"
}
```

#### Response Example (201 Created)
```json
{
  "success": true,
  "message": "Play result logged successfully",
  "receivedAt": "2026-09-03T15:50:00.000Z",
  "dbSaved": true,
  "data": {
    "id": "1788443621558-3adn",
    "score": 8,
    "targetCount": 10,
    "percent": 80,
    "timestamp": 1788443621558,
    "metadata": {
      "correctWords": ["Apfel", "Haus", "Sonne"],
      "wrongWords": ["Auto", "Baum"],
      "language": "de"
    },
    "createdAt": "2026-09-03T15:50:00.000Z"
  }
}
```

---

### 2. `GET /api/results`

Retrieves the latest 100 play results from PostgreSQL sorted by newest first.

#### Response Example (200 OK)
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "1788443621558-3adn",
      "score": 8,
      "targetCount": 10,
      "percent": 80,
      "timestamp": 1788443621558,
      "createdAt": "2026-09-03T15:50:00.000Z"
    }
  ]
}
```

---

### 3. `GET /health`

Health check endpoint.

```json
{
  "status": "ok",
  "timestamp": "2026-09-03T15:50:00.000Z"
}
```
