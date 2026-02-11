# OpenClaw SaaS - Skill Packs for Everyone

**Version:** 1.0  
**Date:** February 11, 2026  
**Founder:** Nik (Fresh Industries)

---

## Problem

OpenClaw is powerful but hard to set up:
- Requires API keys, Docker, cron jobs, config files
- No visual interface
- Technical barrier excludes 90% of potential users
- Cloud providers racing to solve this but offering raw hosting

**Result:** Huge demand, high friction, few can use it.

---

## Solution

**OpenClaw SaaS** — OpenClaw wrapped in a beautiful UI.

```
User: Signs up → Picks skill pack → Works in 5 minutes

What They Get:
- Beautiful dashboard (your UI/UX)
- OAuth connections (no API key pasting)
- Pre-built skill packs (no code)
- Visual activation (toggle on/off)
- Built-in billing

What You Handle:
- User management & billing
- OAuth & API connections
- Cron scheduling
- Agent orchestration
```

---

## Product Vision

"OpenClaw for Normies"

The one-click wrapper that makes AI agents accessible to everyone.

---

## Target Market

| Segment | Pain Point | Willing to Pay |
|---------|------------|----------------|
| Small business owners | No tech skills | $47-97/mo |
| Real estate agents | Busy, need automation | $47-97/mo |
| Freelancers | Repetitive tasks | $27-47/mo |
| Solopreneurs | No time to learn CLI | $47-97/mo |

---

## Product Roadmap

### Phase 1: MVP (4-6 weeks)
**Goal:** Launch with 3 skill packs, manual deployment

| Feature | Description |
|----------|-------------|
| Authentication | Email/password + OAuth |
| Dashboard | Beautiful UI showing active skills |
| Skill Packs | Marketing, Sales, Real Estate |
| User Config | Store preferences in database |
| Manual Trigger | User runs "Activate" → you deploy |

### Phase 2: Automation (8-12 weeks)
**Goal:** Self-service activation

| Feature | Description |
|----------|-------------|
| One-Click Deploy | User clicks → Bot deploys |
| OAuth Connections | Connect Gmail, Stripe, etc. |
| Billing Integration | Stripe subscriptions |
| Usage Analytics | API calls, agent runs |

### Phase 3: Scale (16-24 weeks)
**Goal:** Multi-tenant, containerized deployment

| Feature | Description |
|----------|-------------|
| Container Per User | Isolation + security |
| Auto-Scaling | Add resources as needed |
| Marketplace | User-generated skill packs |
| White-Label | Agencies resell |

---

## Skill Packs

### Marketing Pack ($47/mo)
| Skill | Purpose |
|--------|---------|
| Blog Writer | Generate blog posts |
| Social Poster | Post to X/LinkedIn/Facebook |
| Email Campaigns | Nurture sequences |
| SEO Analyzer | Keyword research |

### Sales Pack ($47/mo)
| Skill | Purpose |
|--------|---------|
| Lead Research | Find prospects |
| Cold Outreach | Email/LinkedIn DMs |
| CRM Sync | HubSpot/Notion |
| Follow-Up Reminders | Never miss a lead |

### Real Estate Pack ($47/mo)
| Skill | Purpose |
|--------|---------|
| Listing Descriptions | Auto-generate property copy |
| Market Reports | Neighborhood analytics |
| Lead Follow-Up | Automated nurturing |
| Open House Promotion | Social posts |

### Personal Pack ($27/mo)
| Skill | Purpose |
|--------|---------|
| Email Triage | Sort inbox |
| Calendar Management | Schedule meetings |
| Weather Alerts | Daily forecasts |
| Reminders | Task management |

---

## Technical Architecture

### Repo Structure

```
openclaw-saas/
├── frontend/                 # Next.js 16 + Tailwind
│   ├── app/
│   │   ├── (auth)/         # Login, signup
│   │   ├── dashboard/       # Main UI
│   │   ├── billing/        # Subscription management
│   │   └── settings/       # User preferences
│   ├── components/          # UI components
│   └── lib/                 # Utilities
│
├── backend/                  # Node.js + Hono
│   ├── routes/
│   │   ├── auth.ts          # Authentication
│   │   ├── users.ts         # User management
│   │   ├── billing.ts       # Stripe integration
│   │   ├── deployment.ts    # Agent orchestration
│   │   └── webhooks.ts      # External callbacks
│   ├── services/
│   │   ├── openclaw.ts      # OpenClaw process management
│   │   ├── oauth.ts         # OAuth connection handlers
│   │   ├── cron.ts          # Job scheduling
│   │   └── skills.ts        # Skill pack management
│   └── db/                  # Database schema
│
├── skills/                   # Skill pack definitions
│   ├── marketing.json
│   ├── sales.json
│   ├── real-estate.json
│   └── personal.json
│
├── openclaw-wrapper/        # Custom OpenClaw integration
│   ├── config-generator.ts  # Generate user configs
│   ├── process-manager.ts   # Spawn/kill agents
│   └── api-bridge.ts        # Bridge frontend ↔ OpenClaw
│
└── scripts/                  # Deployment & setup scripts
```

### Hosting Stack

| Component | Service | Reason |
|-----------|---------|--------|
| **Frontend** | Vercel | Free tier, Next.js native |
| **Backend API** | Railway/Render | Node.js support, easy scaling |
| **Database** | Supabase | PostgreSQL + Auth included |
| **OpenClaw** | DigitalOcean Droplet | $4-20/mo, full control |
| **Payments** | Stripe | Standard, reliable |
| **Domains** | Cloudflare | DNS + SSL |

### Database Schema (Supabase)

```sql
-- Users table (extends Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Active skill packs per user
CREATE TABLE user_skill_packs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  pack_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}',
  last_deployed TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- OAuth connections per user
CREATE TABLE user_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  provider TEXT NOT NULL, -- gmail, stripe, etc.
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel (Frontend)                     │
│              https://openclaw-saas.com                   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                 Railway (Backend API)                    │
│              https://api.openclaw-saas.com              │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │ Auth Service │  │ Billing      │  │ Deployment │  │
│  └──────────────┘  └──────────────┘  └────────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
   ┌───────────┐  ┌───────────┐  ┌───────────┐
   │  Supabase │  │   Stripe  │  │  Digital  │
   │  (DB+Auth)│  │  (Billing)│  │   Ocean   │
   └───────────┘  └───────────┘  │  (OpenClaw)│
                                  └───────────┘
```

### OpenClaw Deployment Strategy

**Option A: Single Server (MVP)**
- Run OpenClaw on single DigitalOcean Droplet
- Multiple user configs via environment variables
- Simple but less secure

**Option B: Container Per User (Scale)**
- Each user gets Docker container
- Full isolation
- More complex, higher cost

**Recommended:** Start with Option A, migrate to B when hitting 100+ users.

---

## OpenClaw Integration

### Should You Fork OpenClaw?

**No.** Forking creates maintenance burden.

**Better Approach:**
1. Keep OpenClaw as a submodule or dependency
2. Build your SaaS as an orchestration layer
3. Generate user configs based on skill pack selections
4. Spawn OpenClaw processes programmatically

### Integration Points

```typescript
// backend/services/openclaw.ts

interface UserConfig {
  userId: string;
  skills: string[];
  connections: {
    gmail?: { token: string };
    stripe?: { token: string };
  };
  cronSchedule: Record<string, string>;
}

// Generate OpenClaw config from user selections
function generateConfig(user: UserConfig) {
  return {
    skills: user.skills,
    connections: user.connections,
    cron: user.cronSchedule,
    workspace: `/home/openclaw/users/${user.userId}`
  };
}

// Deploy user's agent
async function deployAgent(user: UserConfig) {
  const config = generateConfig(user);
  await writeConfig(`/etc/openclaw/users/${user.userId}/config.json`, config);
  await spawnProcess(`openclaw --config /etc/openclaw/users/${user.userId}/config.json`);
}
```

### Skill Pack Definition

```json
// skills/marketing.json
{
  "name": "Marketing Pack",
  "description": "Everything you need to automate marketing",
  "price": 47,
  "skills": ["blog-writer", "social-poster", "email-campaigns", "seo-analyzer"],
  "required_connections": ["gmail"],
  "optional_connections": ["stripe", "hubspot"],
  "default_cron": {
    "blog-writer": "0 8 * * 1",  // Monday 8am
    "social-poster": "0 9 * * *",  // Daily 9am
    "email-campaigns": "0 10 * * 3" // Wednesday 10am
  },
  "config_template": {
    "blog-writer": {
      "tone": "professional",
      "length": "medium"
    }
  }
}
```

---

## Revenue Model

### Pricing Tiers

| Tier | Price/Mo | Includes |
|------|----------|----------|
| **Free** | $0 | 1 skill, limited usage |
| **Personal** | $27/mo | Personal pack, email support |
| **Professional** | $47/mo | 2 skill packs, priority support |
| **Business** | $97/mo | All packs, API access, dedicated support |
| **Enterprise** | $297/mo | White-label, custom integrations |

### Revenue Projections

| Month | Users | MRR | Notes |
|-------|-------|-----|-------|
| 1 | 10 | $470 | Launch to existing contacts |
| 3 | 50 | $2,350 | Word of mouth, SEO |
| 6 | 200 | $9,400 | Paid ads, content marketing |
| 12 | 1,000 | $47,000 | Scale marketing, referrals |

---

## Go-to-Market Strategy

### Launch (Month 1)

1. **Soft launch to Fresh Industries email list** (50-100 people)
2. **Offer 50% off first 3 months** for early adopters
3. **Collect feedback** → iterate weekly

### Growth (Month 2-3)

1. **Content marketing** — Blog posts on "AI automation for small business"
2. **X/Twitter** — Share wins, post daily tips
3. **Product Hunt launch** — Target 500+ upvotes

### Scale (Month 4+)

1. **Paid ads** — Google + Meta targeting "small business owners"
2. **Affiliate program** — 20% commission for referrals
3. **Partnerships** — CRM companies, real estate platforms

---

## Key Success Metrics

| Metric | Month 1 | Month 3 | Month 6 |
|--------|---------|---------|---------|
| Signups | 25 | 200 | 1,000 |
| Activated Users | 10 | 100 | 500 |
| MRR | $470 | $4,700 | $23,500 |
| Churn | <10% | <8% | <5% |
| NPS | >40 | >50 | >60 |

---

## Competitive Advantages

| Competitors | Us |
|-------------|----|
| Manual OpenClaw setup | ✅ One-click activation |
| API keys everywhere | ✅ OAuth connections |
| Config files | ✅ Visual dashboard |
| Terminal-only | ✅ Beautiful web UI |
| Self-hosted | ✅ Managed service |
| Expensive enterprise | ✅ Affordable SMB pricing |

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| OpenClaw changes breaking API | Version pinning, modular design |
| Competitors (DigitalOcean, etc.) | Better UX, faster iteration |
| Security concerns | Container isolation, OAuth only |
| Cost overruns | Usage-based pricing, tier limits |
| User churn | Community building, great support |

---

## Next Steps

### Immediate (This Week)
- [ ] Set up GitHub repo (fork pattern, not forking OpenClaw)
- [ ] Deploy Next.js skeleton to Vercel
- [ ] Connect Supabase for auth + DB
- [ ] Create skill pack JSON definitions

### Short-Term (2-4 Weeks)
- [ ] Build dashboard UI
- [ ] Implement user registration flow
- [ ] Create Marketing skill pack
- [ ] Manual deployment process

### Medium-Term (1-3 Months)
- [ ] One-click deployment automation
- [ ] Stripe billing integration
- [ ] Launch to 50 beta users
- [ ] Iterate based on feedback

---

## Files to Create

```
openclaw-saas/
├── README.md
├── PRD.md                    (this file)
├── .gitignore
├── package.json
├── tsconfig.json
├── frontend/
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── app/
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
└── skills/
    ├── marketing.json
    ├── sales.json
    ├── real-estate.json
    └── personal.json
```

---

## Questions to Answer

1. Should users bring their own OpenAI/Anthropic keys, or include in subscription?
2. What's the fair use limit for "free" tier?
3. How to handle OpenClaw process restarts?
4. What's the SLA for uptime?

---

*Document created: February 11, 2026*
*Version: 1.0*
