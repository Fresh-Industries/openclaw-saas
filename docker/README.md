# OpenClaw Docker Setup

## Quick Start

### 1. Build the API image

```bash
cd docker
docker build -t openclaw-saas-api -f Dockerfile.api ../apps/api
```

### 2. Start Infrastructure

```bash
docker compose up -d postgres redis
```

### 3. Run API

```bash
cd apps/api
cp .env.example .env
# Edit .env with your keys
pnpm db:push
pnpm dev
```

---

## User Container Architecture

Each user gets their own OpenClaw container:

```
┌─────────────────────────────────────────────────┐
│              OpenClaw SaaS API                  │
│                                                 │
│  User signs up → Create Container Request       │
│         ↓                                      │
│  API spawns: docker run coollabsio/openclaw     │
│         ↓                                      │
│  Mount user config → /data/user_{ID}.json      │
│         ↓                                      │
│  User chats with their agent                   │
└─────────────────────────────────────────────────┘
```

## Building User Containers

### Option A: Pull Official Image (Recommended)

```bash
docker pull coollabsio/openclaw:latest
```

### Option B: Build Custom Image

```bash
cd docker
docker build -t openclaw-user:latest -f Dockerfile .
```

## Required Environment Variables for User Containers

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Claude API key | Yes* |
| `OPENAI_API_KEY` | OpenAI API key | Yes* |
| `MINIMAX_API_KEY` | MiniMax API key | Yes* |
| `AUTH_PASSWORD` | Web UI password | No |
| `OPENCLAW_GATEWAY_TOKEN` | API token | No (auto-generated) |

*At least one AI provider required

## Example: Spawn User Container

```bash
docker run -d \
  --name openclaw-user-{USER_ID} \
  -p 18789:18789 \
  -e AUTH_PASSWORD=secret \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  -e OPENCLAW_GATEWAY_TOKEN=user-token \
  -v openclaw-data:/data \
  -v ./configs/user-{USER_ID}.json:/data/openclaw.json:ro \
  coollabsio/openclaw:latest
```

## Port Usage

| Port | Service | Description |
|------|---------|-------------|
| 18789 | Gateway | Internal API (user containers) |
| 8080 | Web UI | Browser interface |
| 9222 | CDP | Chrome DevTools Protocol |

## Multi-Tenant Setup

For production with multiple users:

```bash
# Create Docker network
docker network create openclaw-network

# Start each user container on the network
docker run -d \
  --network openclaw-network \
  --name openclaw-user-{ID} \
  -e AUTH_PASSWORD={PASSWORD} \
  -e ANTHROPIC_API_KEY={KEY} \
  -v openclaw-data-{ID}:/data \
  coollabsio/openclaw:latest
```

## Troubleshooting

### "openclaw:latest doesn't exist"

```bash
# Pull the official image
docker pull coollabsio/openclaw:latest

# Or build locally
cd docker
docker build -t openclaw:latest -f Dockerfile .
```

### Container won't start

```bash
# Check logs
docker logs openclaw-user-{ID}

# Common issues:
# - Missing API key
# - Port already in use
# - Volume permission issues
```

### Can't connect to gateway

```bash
# Verify container is running
docker ps

# Check gateway port
docker exec openclaw-{ID} curl http://localhost:18789/health
```

## Resources

- [OpenClaw Docs](https://docs.openclaw.ai)
- [Docker Hub](https://hub.docker.com/r/coollabsio/openclaw)
- [GitHub](https://github.com/coollabsio/openclaw)
