# OpenClaw SaaS - Todo List

## Phase 1: Frontend Foundation (Week 1)

### Authentication Pages
- [ ] Create `(auth)/login/page.tsx` - Login form with email/password
- [ ] Create `(auth)/signup/page.tsx` - Signup form
- [ ] Create `(auth)/forgot-password/page.tsx` - Password recovery
- [ ] Integrate Better Auth client on frontend
- [ ] Create auth context/hooks for session management

### Dashboard Layout
- [ ] Create `(dashboard)/layout.tsx` - Dashboard shell with sidebar
- [ ] Create sidebar navigation component
- [ ] Add user avatar dropdown menu
- [ ] Create mobile-responsive navigation

## Phase 2: Core Features (Week 2)

### Chat Interface
- [ ] Build `/chat/page.tsx` - Main chat interface
- [ ] Connect chat to `/api/ai/chat` endpoint
- [ ] Implement streaming responses
- [ ] Add message history with local storage
- [ ] Create chat input with enter/shift-enter support

### User Settings
- [ ] Create `/settings/profile/page.tsx` - Profile management
- [ ] Create `/settings/connections/page.tsx` - OAuth connections
- [ ] Create `/settings/billing/page.tsx` - Stripe billing link
- [ ] Create `/settings/security/page.tsx` - Password, 2FA

### Container Management
- [ ] Create `/containers/page.tsx` - List user's containers
- [ ] Add "Create Container" modal with skill pack selector
- [ ] Add container status indicators
- [ ] Add container actions (stop, restart, delete)
- [ ] Add logs viewer for each container

## Phase 3: Skill Packs & Billing (Week 3)

### Skill Pack UI
- [ ] Create skill pack details pages
- [ ] Add skill pack activation flow
- [ ] Create skill configuration forms
- [ ] Add skill pack usage analytics

### Billing Pages
- [ ] Create `/pricing/page.tsx` - Pricing display
- [ ] Integrate Stripe Checkout
- [ ] Create success/cancel pages after checkout
- [ ] Add subscription status badge in dashboard

## Phase 4: Polish & Ship (Week 4)

### UI Improvements
- [ ] Add loading states and skeletons
- [ ] Implement error boundaries
- [ ] Add toast notifications
- [ ] Create empty states for lists
- [ ] Add keyboard shortcuts

### Documentation
- [ ] Write API documentation
- [ ] Create deployment guide
- [ ] Add environment variable docs
- [ ] Write Docker setup guide

### Testing & Bug Fixes
- [ ] Test all auth flows
- [ ] Test container creation/deletion
- [ ] Test Stripe webhooks
- [ ] Fix mobile responsive issues
- [ ] Performance optimization

---

## Quick Wins (Can Do Today)

1. ✅ Login/Signup pages - 2 hours
2. ✅ Dashboard layout - 1 hour  
3. ✅ Connect chat to API - 1 hour
4. ✅ Container list page - 2 hours

## Priority Order

1. **Auth pages** - Can't use app without login
2. **Chat interface** - Core feature
3. **Settings** - User management
4. **Billing** - Revenue
5. **Polish** - Make it pretty

---

## Estimated Timeline

| Phase | Tasks | Time |
|-------|-------|------|
| Phase 1 | Auth + Layout | 1 week |
| Phase 2 | Core Features | 1 week |
| Phase 3 | Billing + Skills | 1 week |
| Phase 4 | Polish + Ship | 1 week |

**Total: 4 weeks to MVP**
