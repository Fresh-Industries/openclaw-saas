# OpenClaw SaaS - Todo List

## Phase 1: Frontend Foundation (Week 1)

### Authentication Pages
- [x] Create `(auth)/login/page.tsx` - Login form with email/password
- [x] Create `(auth)/signup/page.tsx` - Signup form
- [ ] Create `(auth)/forgot-password/page.tsx` - Password recovery
- [x] Integrate Better Auth client on frontend
- [x] Create auth context/hooks for session management

### Dashboard Layout
- [x] Create `(dashboard)/layout.tsx` - Dashboard shell with sidebar
- [x] Create sidebar navigation component
- [x] Add user avatar dropdown menu
- [x] Create mobile-responsive navigation

## Phase 2: Core Features (Week 2)

### Chat Interface
- [x] Build `/chat/page.tsx` - Main chat interface
- [x] Connect chat to `/api/ai/chat` endpoint
- [ ] Implement streaming responses
- [ ] Add message history with local storage
- [x] Create chat input with enter/shift-enter support

### User Settings
- [x] Create `/settings/profile/page.tsx` - Profile management
- [x] Create `/settings/connections/page.tsx` - OAuth connections
- [ ] Create `/settings/billing/page.tsx` - Stripe billing link
- [ ] Create `/settings/security/page.tsx` - Password, 2FA

### Container Management
- [x] Create `/containers/page.tsx` - List user's containers
- [x] Add "Create Container" modal with skill pack selector
- [x] Add container status indicators
- [x] Add container actions (stop, restart, delete)
- [x] Add logs viewer for each container

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

1. ✅ Login/Signup pages - DONE
2. ✅ Dashboard layout - DONE
3. ✅ Connect chat to API - DONE
4. ✅ Container list page - DONE

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
