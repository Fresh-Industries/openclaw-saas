# Skills Directory

This directory contains agent skills for OpenClaw SaaS development.

## Skills Installed

### agent-skills (Vercel)
```
skills/agent-skills/
├── skills/composition-patterns/
├── skills/react-best-practices/
└── skills/web-design-guidelines/
```

### anthropic-skills (Anthropic)
```
skills/anthropic-skills/
├── skills/frontend-design/
├── skills/mcp-builder/
├── skills/pdf/
├── skills/docx/
└── [more skills...]
```

### better-auth-skills
```
skills/better-auth-skills/
├── better-auth/best-practices/SKILL.md
├── better-auth/emailAndPassword/SKILL.md
├── better-auth/create-auth/SKILL.md
├── better-auth/twoFactor/SKILL.md
├── better-auth/organization/SKILL.md
└── security/
```

### next-skills (Vercel)
```
skills/next-skills/
└── skills/next-best-practices/
└── skills/next-cache-components/
```

### prisma-skills
```
skills/prisma-skills/
├── prisma-cli/
├── prisma-client-api/
├── prisma-database-setup/
├── prisma-postgres/
└── prisma-upgrade-v7/
```

### ui-ux-pro-max
```
skills/ui-ux-pro-max/
├── .claude/skills/ui-ux-pro-max/SKILL.md
├── README.md
└── src/ui-ux-pro-max/
```

## Usage

When building features, check relevant skill files:

```bash
# React best practices
cat skills/agent-skills/skills/react-best-practices/SKILL.md

# Prisma database setup
cat skills/prisma-skills/prisma-database-setup/SKILL.md

# Next.js best practices  
cat skills/next-skills/skills/next-best-practices/SKILL.md

# Better Auth practices
cat skills/better-auth-skills/*.md

# Web design guidelines
cat skills/agent-skills/skills/web-design-guidelines/SKILL.md

# Frontend design (Anthropic)
cat skills/anthropic-skills/skills/mcp-builder/SKILL.md
```

## Adding More Skills

Clone skills repos into this directory:

```bash
git clone <repo-url> skills/<folder-name>
```

## Skill Sources

- https://github.com/vercel-labs/agent-skills
- https://github.com/anthropics/skills
- https://github.com/better-auth/skills
- https://github.com/vercel-labs/next-skills
- https://github.com/prisma/skills
- https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
