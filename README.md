# ☑️ One Million Checkboxes

A real-time collaborative checkbox grid inspired by [One Million Checkboxes](https://onemillioncheckboxes.com/). Multiple users can toggle checkboxes simultaneously, with changes synced in real-time across all connected clients using **Socket.IO** and **Redis Pub/Sub**.

## Tech Stack

- **Node.js** + **Express** — HTTP server & REST API
- **Socket.IO** — Bidirectional real-time communication
- **Redis (Valkey)** — Persistent state storage & Pub/Sub for horizontal scaling
- **Docker** — Containerized Redis & app deployment

## Features

- 🔄 Real-time sync across all connected clients via WebSockets
- 🚀 Horizontally scalable via Redis Pub/Sub (multi-instance ready)
- 🛡️ Server-side rate limiting to prevent spam/abuse
- 🐳 Dockerized for one-command deployment
- 🎨 Glassmorphism UI with smooth animations

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### Run Locally

```bash
# 1. Start Redis (Valkey)
docker compose up -d

# 2. Install dependencies
npm install

# 3. Start the server
npm start
```

Open [http://localhost:8000](http://localhost:8000) in your browser.

### Environment Variables

| Variable | Default | Description        |
| -------- | ------- | ------------------ |
| `PORT`   | `8000`  | Server listen port |

## Architecture

```
Client (Browser)
   ↕ Socket.IO (WebSocket)
Express + Socket.IO Server
   ↕ Redis Pub/Sub
Redis (Valkey) — State Store
```

Multiple server instances can be deployed behind a load balancer; Redis Pub/Sub ensures all instances broadcast checkbox changes to their connected clients.

## Docker

```bash
# Build and run the app container
docker build -t checkboxes-ws .
docker run -p 8000:8000 --env REDIS_HOST=host.docker.internal checkboxes-ws
```

## License

ISC
