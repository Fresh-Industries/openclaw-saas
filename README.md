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

# Initialize database
cd apps/api
pnpm db:push

# Start development
pnpm dev
```

## 📦 Monorepo Structure

```
openclaw-saas/
├── apps/
│   ├── web/              # Next.js 16 frontend (App Router)
│   └── api/              # Express API + Better Auth + Prisma
├── packages/
│   └── openclaw-wrapper/   # Docker container management
├── docker/
│   ├── Dockerfile       # OpenClaw container image
│   └── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library

### Backend
- **Express** - API server
- **Better Auth** - Authentication (JWT, OAuth, email/password)
- **Prisma 7** - Database ORM (SQLite for dev, PostgreSQL for prod)
- **Vercel AI SDK** - AI integration (GPT-4o, streaming)
- **Docker SDK** - Container management

### Infrastructure
- **Docker** - Per-user container isolation
- **Stripe** - Billing & subscriptions
- **Traefik** - Reverse proxy (production)

## 🎯 Features

- **Skill Packs**: Marketing, Sales, Personal, Real Estate
- **Multi-Tenancy**: Isolated Docker containers per user
- **Better Auth**: Email/password, OAuth (Google, GitHub, etc.)
- **AI Chat**: Vercel AI SDK with streaming responses
- **Stripe Billing**: Subscription management with webhooks
- **Modern UI**: Beautiful interface with shadcn/ui

## 💰 Pricing

| Tier | Price | Includes |
|------|-------|----------|
| Personal | $27/mo | Personal pack |
| Professional | $47/mo | 2 packs included |
| Business | $97/mo | All packs + priority |

## 🔒 Security

- Per-user Docker containers with complete isolation
- JWT-based authentication with Better Auth
- OAuth-only (no API key storage in DB)
- Encrypted tokens at rest
- Docker socket protection

## 🧪 Development

```bash
# Install all dependencies
pnpm install

# Run all apps in parallel
pnpm dev

# Build all apps
pnpm build

# Lint all apps
pnpm lint

# Format code
pnpm format
```

## 📚 API Routes

### Authentication (`/api/auth/*`)
- `POST /sign-up` - Create account
- `POST /sign-in` - Login
- `GET /session` - Get current session
- `POST /sign-out` - Logout

### Containers (`/api/containers/*`)
- `GET /` - List user containers
- `POST /` - Create container
- `GET /:id` - Get container info
- `POST /:id/message` - Send message to agent
- `POST /:id/stop` - Stop container
- `DELETE /:id` - Delete container
- `GET /:id/logs` - Get container logs

### Billing (`/api/billing/*`)
- `GET /plans` - List plans
- `POST /create-checkout` - Create Stripe checkout
- `POST /create-portal` - Stripe billing portal
- `GET /subscription/:userId` - Get subscription status
- `POST /webhook` - Stripe webhook handler

### AI (`/api/ai/*`)
- `POST /chat` - Chat with AI (streaming supported)
- `POST /generate` - Generate content
- `POST /analyze` - Analyze text

## 🚀 Deployment

### Development (local)
```bash
pnpm dev
```

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
