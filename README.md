# ☑️ Real-Time Collaborative Checkboxes

> A multiplayer checkbox grid where every click is shared live — inspired by [One Million Checkboxes](https://onemillioncheckboxes.com/).

Open it in two browser tabs and watch the magic happen. ✨

---

## 🎬 How It Works

```
You check a box ──► Socket.IO ──► Server ──► Redis Pub/Sub ──► Every other user sees it instantly
```

Every connected client shares the same grid. Check a box in one window, and it flips in every other window in real time — no refresh needed.

---

## 🧰 Tech Stack

| Layer        | Technology                | Why                                        |
| ------------ | ------------------------- | ------------------------------------------ |
| **Server**   | Node.js + Express         | Lightweight HTTP server & REST API         |
| **Realtime** | Socket.IO                 | Bidirectional WebSocket communication      |
| **State**    | Redis (Valkey)            | Persistent checkbox state + Pub/Sub events |
| **Deploy**   | Docker + Docker Compose   | One-command infrastructure setup           |
| **Frontend** | Vanilla HTML / CSS / JS   | Zero-dependency, fast-loading UI           |

---

## ✨ Features

- 🔄 **Real-time sync** — Checkbox changes broadcast instantly to all connected clients via WebSockets
- 📡 **Redis Pub/Sub** — Horizontally scalable; spin up multiple server instances behind a load balancer
- 🛡️ **Rate limiting** — Server-side per-socket throttle (5.5s cooldown) prevents spam and abuse
- 💾 **Persistent state** — Checkbox grid is stored in Redis; survives server restarts
- 🎨 **Glassmorphism UI** — Modern dark theme with gradient accents, hover animations, and blur effects
- 🐳 **Dockerized** — Full stack runs with a single `docker compose up`
- 🔔 **Toast notifications** — Graceful error feedback when rate-limited

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                     Clients (Browsers)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ Client A │  │ Client B │  │ Client C │  ...       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘           │
│       │ Socket.IO    │             │                  │
└───────┼──────────────┼─────────────┼──────────────────┘
        │              │             │
        ▼              ▼             ▼
┌──────────────────────────────────────────────────────┐
│              Express + Socket.IO Server              │
│                                                      │
│  • Serves static frontend (public/)                  │
│  • Handles WebSocket connections                     │
│  • Enforces rate limiting per socket                 │
│  • GET /checkboxes — returns current grid state      │
│  • GET /health — health check endpoint               │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│                  Redis (Valkey)                       │
│                                                      │
│  • checkbox-state:v3 — JSON array of booleans        │
│  • rate-limiting:{socketId} — last action timestamp  │
│  • Pub/Sub channel: internal-server:checkbox:change   │
└──────────────────────────────────────────────────────┘
```

> **Why Redis Pub/Sub?** If you deploy 3 server instances behind a load balancer, Client A might be on Server 1 and Client B on Server 2. Redis Pub/Sub ensures Server 2 hears about changes from Server 1 and pushes them to Client B.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **Docker** & **Docker Compose**

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/checkboxes-ws.git
cd checkboxes-ws
```

### 2. Start Redis

```bash
docker compose up -d
```

### 3. Install dependencies & run

```bash
npm install
npm start
```

### 4. Open in your browser

```
http://localhost:8000
```

Open it in **two or more tabs** to see real-time sync in action!

---

## ⚙️ Configuration

| Variable | Default | Description                  |
| -------- | ------- | ---------------------------- |
| `PORT`   | `8000`  | Port the server listens on   |

```bash
# Example: run on port 3000
PORT=3000 npm start
```

---

## 🐳 Docker Deployment

### Run the full stack

```bash
# Build the app image
docker build -t checkboxes-ws .

# Run with Redis
docker compose up -d                    # Start Redis
docker run -p 8000:8000 \
  --network checkboxes-ws_default \
  -e REDIS_HOST=valkey \
  checkboxes-ws                          # Start app
```

### Production Notes

- The Dockerfile uses `node:20-alpine` for a minimal image (~50MB)
- Only production dependencies are installed via `npm ci --only=production`
- Redis connection defaults to `localhost:6379` — override in `redis-connection.js` for custom hosts

---

## 📁 Project Structure

```
checkboxes-ws/
├── index.js              # Express server + Socket.IO event handlers
├── redis-connection.js   # Redis client factory (publisher, subscriber, general)
├── public/
│   └── index.html        # Frontend — checkbox grid + Socket.IO client
├── Dockerfile            # Production container image
├── docker-compose.yml    # Valkey (Redis) service
├── package.json          # Dependencies & scripts
└── .gitignore
```

---

## 🔑 Key Implementation Details

### Rate Limiting
Each socket gets a **5.5-second cooldown** between checkbox toggles, enforced server-side via Redis. Rapid clickers get a toast error and a temporary UI lock.

### State Management
The checkbox grid is stored as a JSON array of booleans in Redis under `checkbox-state:v3`. On page load, the client fetches the current state via `GET /checkboxes`.

### Real-Time Events

| Event                         | Direction        | Payload                    |
| ----------------------------- | ---------------- | -------------------------- |
| `client:checkbox:change`      | Client → Server  | `{ index, checked }`       |
| `server:checkbox:change`      | Server → Client  | `{ index, checked }`       |
| `server:error`                | Server → Client  | `{ error: "Please Wait" }` |

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

ISC

---

<p align="center">
  Built with ❤️ using Node.js, Socket.IO, and Redis
</p>
