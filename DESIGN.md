# FarmBox - Local Organic CSA Marketplace

## Design Document

**Version:** 1.0
**Date:** December 2024
**Author:** FarmBox Team
**Location Focus:** Mediterranean / Tunisia

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Problem Statement](#problem-statement)
3. [Solution Overview](#solution-overview)
4. [Target Market](#target-market)
5. [Geography & Climate Considerations](#geography--climate-considerations)
6. [Product Selection Strategy](#product-selection-strategy)
7. [MVP Features](#mvp-features)
8. [Technical Architecture](#technical-architecture)
9. [Data Models](#data-models)
10. [Monetization Strategy](#monetization-strategy)
11. [Delivery & Logistics](#delivery--logistics)
12. [Packaging Guidelines](#packaging-guidelines)
13. [Starting Checklist](#starting-checklist)
14. [Success Metrics](#success-metrics)
15. [Future Roadmap](#future-roadmap)

---

## Executive Summary

FarmBox is a digital marketplace platform connecting small organic farms in Tunisia and the Mediterranean region to urban consumers through subscription boxes and weekly deliveries. The platform enables local farmers to sell directly to consumers, cutting out middlemen and ensuring fresher produce at fair prices for both parties.

### Vision
Empower Tunisian small-scale organic farmers with digital tools to reach urban markets while providing city dwellers access to fresh, local, seasonal produce.

### Mission
Build a sustainable farm-to-table ecosystem that supports local agriculture, promotes healthy eating, and strengthens rural-urban economic connections.

---

## Problem Statement

### For Farmers
- Limited access to urban markets
- Dependency on intermediaries who take significant margins
- Lack of direct customer relationships
- No tools for demand forecasting or marketing
- Difficulty competing with imported produce

### For Consumers
- Limited access to truly local, organic produce
- Uncertainty about food origins and farming practices
- Inconvenient access to farm-fresh products
- No direct connection to the people who grow their food

---

## Solution Overview

FarmBox provides:

1. **For Farmers:**
   - Digital storefront with farm profiles
   - Order management system
   - Delivery calendar and route planning
   - Customer communication tools
   - (Premium) Analytics and marketing features

2. **For Consumers:**
   - Browse local farms and their offerings
   - Subscribe to weekly/bi-weekly boxes
   - Choose pickup or delivery
   - Rate and review farms
   - Learn about seasonal availability

---

## Target Market

### Primary Geography
- **Region:** Northern Tunisia (Greater Tunis area)
- **Urban Centers:** Tunis, La Marsa, Carthage, Sidi Bou Said, Ariana, Ben Arous
- **Initial Radius:** 50km from central Tunis

### Target Farmers
- Small-scale organic/traditional farms (0.5 - 10 hectares)
- Family-owned operations
- Farms practicing sustainable agriculture
- Producers of Mediterranean crops

### Target Consumers
- Urban professionals (25-55 years)
- Health-conscious families
- Expat community
- Restaurants and cafes (B2B expansion)
- Hotels and guesthouses

---

## Geography & Climate Considerations

### Mediterranean Climate Characteristics
- **Hot, dry summers** (June - September): 30-40°C
- **Mild, wet winters** (November - February): 10-18°C
- **Growing seasons:** Spring (March-May), Autumn (September-November)
- **Challenges:** Water scarcity, summer heat stress

### Tunisia-Specific Factors

| Season | Conditions | Implications |
|--------|-----------|--------------|
| Summer | Extreme heat, drought | Limited leafy greens, focus on heat-tolerant crops |
| Winter | Mild, rainy | Peak season for many vegetables |
| Spring | Optimal growing | Widest variety available |
| Autumn | Olive harvest | Major seasonal product |

### Delivery Timing Considerations
- **Avoid:** Mid-day deliveries (11am - 4pm) during summer
- **Optimal:** Early morning (6am - 9am) or evening (5pm - 8pm)
- **Cold chain:** Essential for dairy, eggs during hot months

---

## Product Selection Strategy

### Recommended Core Products (2-4 Focus Areas)

#### 1. Aromatic Herbs (Primary)
**Why:** High value, low weight, drought-tolerant, year-round demand

| Herb | Season | Notes |
|------|--------|-------|
| Mint (Na'na) | Year-round | Essential for Tunisian tea |
| Rosemary | Year-round | Mediterranean staple |
| Thyme | Year-round | Drought-tolerant |
| Basil | Spring-Autumn | Heat-sensitive |
| Parsley | Year-round | High demand |
| Coriander | Spring, Autumn | Bolts in summer heat |

#### 2. Seasonal Vegetables (Primary)
**Why:** Core demand, diverse offerings, year-round rotation

| Season | Vegetables |
|--------|-----------|
| Winter | Artichokes, carrots, turnips, beets, cabbage, cauliflower, broccoli |
| Spring | Peas, fava beans, lettuce, spinach, radishes, green onions |
| Summer | Tomatoes, peppers, eggplant, zucchini, cucumbers, melons |
| Autumn | Squash, pumpkins, late tomatoes, leafy greens |

#### 3. Olives & Olive Products (Secondary)
**Why:** Iconic Tunisian product, high value, long shelf life

- Fresh olives (seasonal: October - December)
- Olive oil (year-round)
- Marinated olives (value-added)

#### 4. Eggs & Honey (Optional Add-ons)
**Why:** High demand, recurring purchase, premium pricing

| Product | Considerations |
|---------|---------------|
| Free-range eggs | Cold chain needed, high demand |
| Raw honey | Long shelf life, premium pricing |
| Seasonal honeycomb | Specialty item |

### Seasonal Availability Calendar

```
         J  F  M  A  M  J  J  A  S  O  N  D
Herbs    ████████████████████████████████████
Tomatoes          ████████████████████
Peppers           ████████████████████
Olives                              ██████
Citrus   ████████                      ████
Greens   ████████████      ████████████████
Eggs     ████████████████████████████████████
Honey    ████████████████████████████████████
```

---

## MVP Features

### Phase 1: Minimal Viable Platform

#### Farm Management
- [ ] Farm profile creation (name, location, story, photos)
- [ ] Product listing with photos and descriptions
- [ ] Availability calendar (what's in season)
- [ ] Simple pricing management
- [ ] Order notifications (email/SMS)

#### Consumer Features
- [ ] Browse farms and products
- [ ] View farm profiles and stories
- [ ] See delivery/pickup calendar
- [ ] Place orders (one-time or subscription)
- [ ] Basic user accounts

#### Core Platform
- [ ] Responsive web application
- [ ] Simple admin dashboard
- [ ] Order management
- [ ] Basic payment integration (or cash on delivery)
- [ ] WhatsApp/SMS integration for communication

### Out of Scope for MVP
- Mobile native apps
- Advanced analytics
- Route optimization
- Inventory management
- Multi-language support (beyond French/Arabic)

---

## Technical Architecture

### Technology Stack (Recommended)

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend                              │
│  React.js / Next.js + Tailwind CSS                      │
│  Mobile-responsive, PWA-capable                         │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend API                           │
│  Node.js + Express / Fastify                            │
│  RESTful API                                            │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    Database                              │
│  PostgreSQL (primary data)                              │
│  Redis (sessions, caching)                              │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                External Services                         │
│  - Cloudinary (images)                                  │
│  - Twilio/WhatsApp API (notifications)                  │
│  - Stripe/Flouci (payments)                             │
│  - Google Maps API (delivery routing)                   │
└─────────────────────────────────────────────────────────┘
```

### Hosting Options (Tunisia-friendly)
- **Primary:** Vercel (frontend) + Railway/Render (backend)
- **Alternative:** DigitalOcean (Frankfurt region for low latency)
- **Budget option:** Shared hosting with Node.js support

### Key Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Language | JavaScript/TypeScript | Wide talent pool, full-stack capability |
| Database | PostgreSQL | Reliable, free tier available, good for relational data |
| Payments | Cash on delivery (MVP) | Highest adoption in Tunisia, add Flouci later |
| Communication | WhatsApp API | Most popular messaging platform in Tunisia |
| Maps | Google Maps | Best coverage of Tunisian addresses |

---

## Data Models

### Core Entities

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Farm     │────<│   Product   │     │    User     │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │     │ id          │     │ id          │
│ name        │     │ farm_id     │     │ email       │
│ description │     │ name        │     │ phone       │
│ location    │     │ description │     │ name        │
│ owner_id    │     │ price       │     │ address     │
│ images      │     │ unit        │     │ role        │
│ delivery_   │     │ available   │     │ created_at  │
│   zones     │     │ seasonal_   │     └─────────────┘
│ created_at  │     │   calendar  │            │
└─────────────┘     │ images      │            │
                    │ created_at  │            │
                    └─────────────┘            │
                           │                   │
                           ▼                   ▼
                    ┌─────────────────────────────┐
                    │          Order              │
                    ├─────────────────────────────┤
                    │ id                          │
                    │ user_id                     │
                    │ farm_id                     │
                    │ status                      │
                    │ delivery_date               │
                    │ delivery_type (pickup/      │
                    │                delivery)    │
                    │ total_amount                │
                    │ notes                       │
                    │ created_at                  │
                    └─────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────────────┐
                    │       Order_Item            │
                    ├─────────────────────────────┤
                    │ id                          │
                    │ order_id                    │
                    │ product_id                  │
                    │ quantity                    │
                    │ unit_price                  │
                    └─────────────────────────────┘
```

### Subscription Model

```
┌─────────────────────────────────────┐
│          Subscription               │
├─────────────────────────────────────┤
│ id                                  │
│ user_id                             │
│ farm_id                             │
│ box_type (small/medium/large)       │
│ frequency (weekly/bi-weekly)        │
│ delivery_day                        │
│ status (active/paused/cancelled)    │
│ start_date                          │
│ next_delivery                       │
│ created_at                          │
└─────────────────────────────────────┘
```

---

## Monetization Strategy

### Revenue Streams

#### 1. Commission per Sale (Primary)
| Tier | Commission | Conditions |
|------|------------|------------|
| Standard | 10% | All sales |
| Subscription | 8% | Recurring orders |
| High Volume | 7% | >500 TND/month |

#### 2. Premium Farm Subscription (Secondary)
| Plan | Price (TND/month) | Features |
|------|-------------------|----------|
| Basic | Free | Profile, listings, orders |
| Growth | 50 | Analytics, featured placement |
| Pro | 150 | Marketing tools, priority support, custom domain |

#### 3. Future Revenue Opportunities
- Delivery logistics service
- Packaging supplies
- Farm input marketplace
- Data insights for agricultural planning

### Pricing Guidelines for Farmers

Suggested markup over wholesale:

| Product Type | Markup | Example |
|--------------|--------|---------|
| Vegetables | 30-50% | 2 TND → 2.6-3 TND |
| Herbs | 50-100% | 1 TND → 1.5-2 TND |
| Eggs (dozen) | 40-60% | 4 TND → 5.5-6.5 TND |
| Honey (kg) | 30-50% | 25 TND → 32-38 TND |
| Olive oil (L) | 20-40% | 15 TND → 18-21 TND |

### Box Pricing Strategy

| Box Size | Contents | Price Range (TND) |
|----------|----------|-------------------|
| Small | 3-4 kg mixed produce | 25-35 |
| Medium | 5-7 kg mixed produce | 45-60 |
| Large | 8-10 kg mixed produce | 70-90 |
| Family | 12-15 kg + eggs + extras | 100-130 |

---

## Delivery & Logistics

### Service Area Definition

#### Phase 1: Greater Tunis (50km radius)
```
Zone A (0-15km): Tunis, La Marsa, Carthage, Sidi Bou Said
  - Delivery fee: 5 TND
  - Free delivery: orders > 80 TND

Zone B (15-30km): Ariana, Ben Arous, Manouba
  - Delivery fee: 8 TND
  - Free delivery: orders > 120 TND

Zone C (30-50km): Outer suburbs
  - Delivery fee: 12 TND
  - Free delivery: orders > 150 TND
```

### Delivery Schedule

| Day | Activity |
|-----|----------|
| Saturday-Sunday | Order cutoff (customers finalize) |
| Monday | Harvest and preparation |
| Tuesday | Packing |
| Wednesday | Delivery Day 1 (Zone A) |
| Thursday | Delivery Day 2 (Zones B & C) |
| Friday | Rest / Pickup option |

### Timing Windows

| Season | Morning Window | Evening Window |
|--------|----------------|----------------|
| Summer (Jun-Sep) | 6:00 - 9:00 | 18:00 - 21:00 |
| Winter (Nov-Feb) | 8:00 - 12:00 | 15:00 - 19:00 |
| Spring/Autumn | 7:00 - 11:00 | 16:00 - 20:00 |

### Vehicle Requirements

| Scale | Vehicle | Capacity | Cost Estimate |
|-------|---------|----------|---------------|
| Start | Personal car | 20-30 boxes | Existing asset |
| Growth | Small van (Kangoo/Partner) | 50-80 boxes | 25-35k TND used |
| Scale | Refrigerated van | 100+ boxes | 60-80k TND used |

### Route Planning Tips
1. Group deliveries by zone
2. Start furthest, work back toward farm
3. Use Google Maps "multiple stops" feature
4. Allow 10-15 min per delivery stop
5. Plan for traffic (avoid 8-9am, 5-7pm in Tunis)

---

## Packaging Guidelines

### Recommended Materials

| Material | Use Case | Source | Eco-Friendly |
|----------|----------|--------|--------------|
| Wooden crates | Reusable, heavy items | Local carpenter | Yes |
| Cardboard boxes | Single-use, mixed produce | Packaging suppliers | Recyclable |
| Jute bags | Herbs, light items | Local markets | Yes |
| Paper bags | Individual items | Wholesale | Yes |
| Beeswax wraps | Leafy greens | DIY or import | Yes |
| Glass jars | Honey, preserved items | Recyclable collection | Yes |

### Box Assembly

```
┌─────────────────────────────────────┐
│         Standard Box Layout         │
├─────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐          │
│  │ Heavy   │  │ Medium  │          │
│  │ Items   │  │ Items   │          │
│  │ (root   │  │ (fruit) │          │
│  │  veg)   │  │         │          │
│  └─────────┘  └─────────┘          │
│  ┌──────────────────────┐          │
│  │   Delicate Items     │          │
│  │   (herbs, greens)    │          │
│  │   ─── TOP ───        │          │
│  └──────────────────────┘          │
│  ┌──────────────────────┐          │
│  │   Eggs (if included) │          │
│  │   Secure separately  │          │
│  └──────────────────────┘          │
└─────────────────────────────────────┘
```

### Branding Elements
- FarmBox sticker/stamp on every package
- Farm info card (farm story, what's in the box)
- Recipe suggestion card (seasonal)
- Feedback QR code

### Deposit System for Reusables
| Item | Deposit (TND) |
|------|---------------|
| Wooden crate | 10 |
| Glass jars | 2 |
| Egg carton | 1 |

---

## Starting Checklist

### Week 1-2: Foundation

#### Product Selection
- [ ] Survey your farm for viable crops
- [ ] Select 2-4 main product categories
- [ ] Document current yields and capacities
- [ ] Research local market prices
- [ ] Set initial pricing (aim for 30-50% above wholesale)

#### Legal & Administrative
- [ ] Register business (if not already)
- [ ] Obtain necessary permits for food sales
- [ ] Set up business bank account
- [ ] Create simple record-keeping system

### Week 3-4: Platform & Packaging

#### Website Setup
- [ ] Register domain (farmbox.tn or similar)
- [ ] Set up basic website with:
  - [ ] Farm profile and story
  - [ ] Product listings with photos
  - [ ] Delivery calendar
  - [ ] Contact information
  - [ ] Order form or WhatsApp link

#### Packaging Preparation
- [ ] Source packaging materials
- [ ] Design simple branding (logo, stickers)
- [ ] Prepare reusable container system
- [ ] Create packing station at farm

### Week 5-6: Logistics & Launch

#### Delivery Setup
- [ ] Define delivery zones (start small: 15-20km)
- [ ] Create delivery schedule (1-2 days/week)
- [ ] Plan routes for each zone
- [ ] Test drive routes, note timing
- [ ] Prepare vehicle (coolers, storage)

#### Communication Channels
- [ ] Set up WhatsApp Business account
- [ ] Create order confirmation templates
- [ ] Set up delivery notification messages
- [ ] Create feedback collection method

### Week 7-8: Soft Launch

#### Initial Customers
- [ ] Reach out to friends and family
- [ ] Offer founding customer discount (10-15%)
- [ ] Start with 10-20 boxes maximum
- [ ] Focus on quality and reliability

#### Feedback Collection
- [ ] Send post-delivery survey
- [ ] Call customers for verbal feedback
- [ ] Document all feedback received
- [ ] Identify top 3 improvements needed

### Ongoing: Record Keeping

#### Weekly Records
- [ ] Orders received
- [ ] Products harvested
- [ ] Delivery completion rate
- [ ] Customer feedback scores

#### Monthly Records
- [ ] Total revenue
- [ ] Costs (packaging, fuel, labor)
- [ ] Net profit/loss
- [ ] Customer acquisition/churn
- [ ] Product performance

#### Seasonal Planning
- [ ] Crop planning for next season
- [ ] Pricing adjustments
- [ ] Zone expansion decisions
- [ ] Investment priorities

---

## Success Metrics

### Launch Phase (Month 1-3)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Active customers | 25+ | Unique buyers |
| Weekly orders | 15+ | Order count |
| Delivery success | 95%+ | On-time, complete |
| Customer satisfaction | 4.5/5 | Survey average |
| Repeat order rate | 50%+ | Returning customers |

### Growth Phase (Month 4-12)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Active subscribers | 50+ | Recurring orders |
| Monthly revenue | 5,000+ TND | Total sales |
| Gross margin | 40%+ | Revenue - COGS |
| Delivery zones | 3+ | Geographic coverage |
| Product variety | 15+ | Unique SKUs |

### Scale Phase (Year 2+)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Partner farms | 5+ | Multi-farm platform |
| Monthly GMV | 25,000+ TND | Total platform sales |
| Mobile app users | 500+ | App downloads |
| B2B customers | 10+ | Restaurants/hotels |

---

## Future Roadmap

### Phase 2: Platform Enhancement
- Mobile application (iOS/Android)
- Online payment integration (Flouci, D17)
- Advanced subscription management
- Customer loyalty program

### Phase 3: Network Growth
- Multi-farm marketplace
- Farm-to-farm coordination
- Shared delivery routes
- Collective marketing

### Phase 4: B2B Expansion
- Restaurant partnerships
- Hotel/tourism sector
- Corporate wellness programs
- Event catering suppliers

### Phase 5: Value Chain Integration
- Farm input marketplace
- Agricultural knowledge sharing
- Weather and planning tools
- Export facilitation

---

## Appendix

### Useful Resources

#### Tunisia-Specific
- **APIA** (Agence de Promotion des Investissements Agricoles)
- **GIFruits** - Fruit sector association
- **UTAP** - Agricultural producers union

#### Technology
- **WhatsApp Business API:** business.whatsapp.com
- **Flouci Payment:** flouci.com
- **Google Maps Platform:** cloud.google.com/maps-platform

#### Packaging Suppliers (Tunisia)
- SOTIPAPIER (cardboard)
- Local souks (jute, baskets)
- Recyclage Tunisia (eco-options)

### Sample Order Form

```
═══════════════════════════════════════
         FARMBOX ORDER FORM
═══════════════════════════════════════

Customer Name: _______________________
Phone: ______________________________
Delivery Address: ___________________
____________________________________
Delivery Day:  □ Wednesday  □ Thursday

BOX SELECTION:
□ Small Box (25 TND)   - 3-4 kg
□ Medium Box (50 TND)  - 5-7 kg
□ Large Box (80 TND)   - 8-10 kg

ADD-ONS:
□ Eggs (1 dozen) - 6 TND
□ Honey (500g) - 18 TND
□ Olive Oil (1L) - 20 TND
□ Herb Bundle - 5 TND

FREQUENCY:
□ One-time order
□ Weekly subscription
□ Bi-weekly subscription

Special requests / allergies:
____________________________________

═══════════════════════════════════════
```

### Contact Templates

#### Order Confirmation (WhatsApp)
```
Bonjour [Name]! 🌿

Merci pour votre commande FarmBox!

📦 Commande #[NUMBER]
📅 Livraison: [DAY], [DATE]
⏰ Créneau: [TIME WINDOW]
💰 Total: [AMOUNT] TND

Votre box contiendra:
- [Product 1]
- [Product 2]
- [Product 3]

Questions? Répondez à ce message.

À bientôt!
L'équipe FarmBox 🚜
```

#### Delivery Notification
```
Bonjour [Name]!

Votre FarmBox est en route! 🚗

📍 Arrivée estimée: [TIME]
📞 Livreur: [PHONE]

Bon appétit! 🥗
```

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | December 2024 | Initial design document |

---

*This document serves as the foundational blueprint for FarmBox. It should be reviewed and updated quarterly as the business evolves.*
