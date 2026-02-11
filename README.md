# OpenClaw SaaS - Multi-Tenant AI Agent Platform

Deploy AI agents for your users with complete isolation and security.

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/fresh-industries/openclaw-saas.git
cd openclaw-saas

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your credentials

# Start development
pnpm dev
```

## 📦 Monorepo Structure

```
openclaw-saas/
├── apps/
│   └── web/              # Next.js frontend (App Router)
├── packages/
│   └── openclaw-wrapper/   # Docker container management
├── docker/
│   ├── Dockerfile       # OpenClaw container image
│   └── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Docker SDK
- **Database**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth
- **Payments**: Stripe
- **Infrastructure**: Docker, Traefik
- **Monorepo**: Turborepo

## 🎯 Features

- **Skill Packs**: Marketing, Sales, Personal, Real Estate
- **Multi-Tenancy**: Isolated Docker containers per user
- **Beautiful UI**: Modern chat interface with shadcn/ui
- **OAuth Connections**: Gmail, Discord, Telegram support
- **One-Click Deploy**: Your users deploy in minutes

## 💰 Pricing

| Tier | Price | Includes |
|------|-------|-----------|
| Personal | $27/mo | Personal pack |
| Professional | $47/mo | 2 packs included |
| Business | $97/mo | All packs + priority |

## 🔒 Security

- Per-user Docker containers
- Complete filesystem isolation
- OAuth-only (no API key storage)
- Encrypted tokens at rest

## 📚 Documentation

- [Setup Guide](docs/SETUP.md)
- [API Reference](docs/API.md)
- [Docker Configuration](docs/DOCKER.md)
- [Deployment](docs/DEPLOYMENT.md)

## 🧪 Development

```bash
# Run all apps
pnpm dev

# Build all apps
pnpm build

# Lint all apps
pnpm lint

# Format code
pnpm format
```

## 🚀 Deployment

### Production (Docker)

```bash
docker-compose up -d
```

### Vercel (Frontend)

Connect your repository to Vercel for automatic deployments.

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

Built with ❤️ by [Fresh Industries](https://freshindustries.co)
