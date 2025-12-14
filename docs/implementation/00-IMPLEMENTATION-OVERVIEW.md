# Borgdanet Implementation Guide

> **Complete Step-by-Step Guide to Transform FarmBox into Borgdanet**

---

## Overview

This implementation guide transforms the existing FarmBox platform into **Borgdanet**, Tunisia's regenerative food marketplace. The guide is organized into 6 phases, each building upon the previous.

**Tagline:** Local food. Trusted farms. Shared abundance.

---

## Phase Structure

| Phase | Focus | Files Changed | Priority |
|-------|-------|---------------|----------|
| [Phase 1](./01-PHASE-BRAND-HOMEPAGE.md) | Brand & Homepage Foundation | ~25 files | Critical |
| [Phase 2](./02-PHASE-SUBSCRIPTION.md) | Subscription Experience | ~15 files | Critical |
| [Phase 3](./03-PHASE-FARM-EXPERIENCE.md) | Farm Experience | ~12 files | High |
| [Phase 4](./04-PHASE-SHOPPING.md) | Shopping Experience | ~10 files | High |
| [Phase 5](./05-PHASE-ENGAGEMENT.md) | Engagement Features | ~12 files | Medium |
| [Phase 6](./06-PHASE-NEW-FEATURES.md) | New Features & PWA | ~20 files | Medium |

---

## Prerequisites

### Technical Requirements
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose
- npm or yarn

### Existing FarmBox Setup
```bash
# Ensure FarmBox is running
docker-compose up -d

# Verify services
curl http://localhost:3001/api/health  # Backend
curl http://localhost:3000             # Frontend
```

### Environment Variables
Ensure `.env` files are configured:
```bash
# backend/.env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret"
FRONTEND_URL="http://localhost:3000"

# frontend/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

---

## Directory Structure After Implementation

```
FarmBox/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Updated with new models
│   │   └── migrations/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── experience.controller.ts    # NEW
│   │   │   ├── content.controller.ts       # NEW
│   │   │   └── community.controller.ts     # NEW
│   │   ├── routes/
│   │   │   ├── experience.routes.ts        # NEW
│   │   │   ├── content.routes.ts           # NEW
│   │   │   └── community.routes.ts         # NEW
│   │   └── services/
│   │       └── impact.service.ts           # NEW
│   └── locales/                            # NEW - i18n
│       ├── fr/
│       └── ar/
├── frontend/
│   ├── public/
│   │   ├── images/brand/                   # NEW
│   │   └── manifest.json                   # NEW - PWA
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                    # UPDATED - Homepage
│   │   │   ├── get-started/                # NEW
│   │   │   ├── experiences/                # NEW
│   │   │   └── learn/                      # NEW
│   │   ├── components/
│   │   │   ├── brand/                      # NEW
│   │   │   ├── home/                       # NEW
│   │   │   ├── subscription/               # NEW
│   │   │   ├── farm/                       # UPDATED
│   │   │   └── experiences/                # NEW
│   │   ├── lib/
│   │   │   └── i18n.ts                     # NEW
│   │   └── locales/                        # NEW
│   │       ├── fr/
│   │       └── ar/
│   └── tailwind.config.ts                  # UPDATED - Brand colors
└── docs/
    ├── BORGDANET_REDESIGN.md
    └── implementation/
        ├── 00-IMPLEMENTATION-OVERVIEW.md
        ├── 01-PHASE-BRAND-HOMEPAGE.md
        ├── 02-PHASE-SUBSCRIPTION.md
        ├── 03-PHASE-FARM-EXPERIENCE.md
        ├── 04-PHASE-SHOPPING.md
        ├── 05-PHASE-ENGAGEMENT.md
        └── 06-PHASE-NEW-FEATURES.md
```

---

## Implementation Principles

### 1. Incremental Delivery
Each phase delivers working features. Don't wait for all phases to complete before testing.

### 2. Backward Compatibility
Existing functionality must continue working. New features extend, not replace.

### 3. Mobile-First
All new components designed for mobile first, then enhanced for desktop.

### 4. Bilingual Ready
All user-facing strings must use translation keys from day one.

### 5. Test Coverage
Each new component/endpoint should have corresponding tests.

---

## Quick Start by Phase

### Phase 1: Brand & Homepage (Start Here)
```bash
# 1. Update Tailwind config with brand colors
# 2. Create brand components (Logo, Tagline)
# 3. Build homepage sections
# 4. Update navigation
```

### Phase 2: Subscription Experience
```bash
# 1. Create onboarding flow pages
# 2. Build subscription components
# 3. Enhance subscription dashboard
# 4. Add flexibility features
```

### Phase 3: Farm Experience
```bash
# 1. Enhance farm profile pages
# 2. Add farm stories
# 3. Improve farm directory
# 4. Add farm ratings UI
```

### Phase 4: Shopping Experience
```bash
# 1. Redesign cart component
# 2. Optimize checkout flow
# 3. Improve order tracking
# 4. Add rescue produce badges
```

### Phase 5: Engagement Features
```bash
# 1. Build loyalty program UI
# 2. Create referral system
# 3. Add impact dashboard
# 4. Enhance quality feedback
```

### Phase 6: New Features & PWA
```bash
# 1. Add agritourism booking
# 2. Build educational content hub
# 3. Create community events
# 4. Implement PWA features
```

---

## Testing Strategy

### Unit Tests
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

### Integration Tests
```bash
# API tests
npm run test:api

# E2E tests
npm run test:e2e
```

### Manual Testing Checklist
- [ ] Homepage loads correctly in FR and AR
- [ ] Subscription flow completes end-to-end
- [ ] Cart persists across sessions
- [ ] Mobile navigation works
- [ ] Farm profiles display correctly
- [ ] Order tracking updates in real-time

---

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Assets optimized
- [ ] Translations complete

### Deployment Steps
```bash
# 1. Build frontend
cd frontend && npm run build

# 2. Run migrations
cd backend && npm run db:migrate

# 3. Deploy with Docker
docker-compose -f docker-compose.prod.yml up -d
```

### Post-Deployment
- [ ] Smoke test critical paths
- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Verify analytics tracking

---

## Support & Resources

### Documentation
- [Borgdanet Redesign Spec](../BORGDANET_REDESIGN.md)
- [FarmBox CLAUDE.md](../../CLAUDE.md)

### Key Files Reference
| Purpose | File Path |
|---------|-----------|
| Database Schema | `backend/prisma/schema.prisma` |
| API Routes | `backend/src/routes/index.ts` |
| Frontend Pages | `frontend/src/app/` |
| State Management | `frontend/src/store/` |
| API Client | `frontend/src/lib/api.ts` |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 2024 | Initial implementation guide |

---

**Next Step:** Begin with [Phase 1: Brand & Homepage Foundation](./01-PHASE-BRAND-HOMEPAGE.md)
