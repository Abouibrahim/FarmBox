# Borgdanet Platform Redesign Specification

> **Complete Design Document for Tunisia's Regenerative Food Marketplace**

---

## Executive Summary

**Borgdanet** (بُرڨدانت) is a strategic rebrand of FarmBox, transforming it into Tunisia's premier regenerative food marketplace. Inspired by ButcherBox's streamlined UX and subscription-first approach, Borgdanet adapts these patterns for a multi-farm organic marketplace serving Tunisian communities.

**Tagline:** Local food. Trusted farms. Shared abundance.
**Arabic:** أكل بلدي. فلاحة موثوقة. خير مشترك.

---

# Part 1: Brand Identity & Voice

## 1.1 Brand Story & Positioning

### The Name: Borgdanet
"Borgdanet" draws from Tunisian dialect, evoking the concept of "shared bounty" or "abundant blessing." It positions the platform as more than a marketplace—it's a movement to rebuild local food systems.

### Brand Positioning Statement
> For Tunisian families who want healthy, traceable food and meaningful connection to where it comes from, Borgdanet is the regenerative food marketplace that delivers fresh, seasonal produce directly from trusted small farms—empowering farmers with fair prices while regenerating land and livelihoods.

### Brand Pillars
1. **Traceability** - Know your farmer, know your food
2. **Regeneration** - Healing land while feeding communities
3. **Community** - Shared abundance, collective impact
4. **Accessibility** - Premium organic made reachable

## 1.2 Vision & Mission

### Vision
To rebuild local food systems by connecting people with healthy, organic, and traceable food — while regenerating land and livelihoods for small-scale farmers.

### Mission
1. **Empower** small organic farms with direct market access and fair prices
2. **Deliver** fresh, seasonal, and fully traceable produce to local communities
3. **Create** diversified, resilient revenue streams (CSA, agritourism, value-added goods)
4. **Teach** and inspire regenerative practices through hands-on education

## 1.3 Visual Identity Guidelines

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| **Earth Green** | `#2D5A27` | Primary brand, CTAs, headers |
| **Harvest Gold** | `#D4A84B` | Accents, highlights, premium features |
| **Soil Brown** | `#5C4033` | Secondary text, earthy elements |
| **Cream White** | `#FDF8F0` | Backgrounds, cards |
| **Terracotta** | `#C75B39` | Alerts, seasonal highlights |
| **Sky Blue** | `#87CEEB` | Links, trust indicators |

### Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| **Headlines (FR)** | Playfair Display | Bold | 32-48px |
| **Headlines (AR)** | Noto Naskh Arabic | Bold | 32-48px |
| **Body (FR)** | Inter | Regular/Medium | 16-18px |
| **Body (AR)** | IBM Plex Sans Arabic | Regular/Medium | 16-18px |
| **CTAs** | Inter | Semibold | 16px |

### Imagery Guidelines
- **Hero images**: Wide landscape shots of Tunisian farms, morning light, mist over fields
- **Product shots**: Natural lighting, rustic wooden surfaces, seasonal arrangements
- **Farmer portraits**: Authentic, working in fields, smiling, connection to land
- **Lifestyle**: Tunisian families at tables, market scenes, community gatherings
- **Avoid**: Sterile studio shots, over-processed images, stock photo aesthetics

### Logo Concept
- Primary mark: Stylized olive branch forming a circular embrace
- Wordmark: "Borgdanet" in custom serif with Arabic beneath
- Favicon: Single olive leaf in Earth Green

## 1.4 Voice & Tone

### Brand Voice Attributes
| Attribute | Description | Example |
|-----------|-------------|---------|
| **Warm** | Like a neighbor sharing their harvest | "We saved the best tomatoes for you" |
| **Trustworthy** | Transparent, honest, no hidden agendas | "Here's exactly where your food comes from" |
| **Rooted** | Connected to land, seasons, traditions | "This week's harvest follows ancient rhythms" |
| **Empowering** | Celebrates farmers and customers alike | "Your choice supports 12 farming families" |

### Tone by Context

| Context | Tone | Example |
|---------|------|---------|
| **Marketing** | Inspiring, inviting | "Taste the difference of food grown with care" |
| **Product descriptions** | Sensory, honest | "Sun-ripened figs, picked this morning in Testour" |
| **Transactional** | Clear, reassuring | "Your box is on its way. Track delivery here." |
| **Support** | Empathetic, solution-focused | "We understand. Let's make this right." |
| **Educational** | Accessible, curious | "Ever wondered why heirloom tomatoes taste better?" |

### Bilingual Approach
- **Primary language**: French (majority of UI and marketing)
- **Secondary language**: Arabic (all critical paths, key messaging)
- **Language toggle**: Prominent in header, persists across session
- **Translation style**: Natural adaptation, not literal translation

---

# Part 2: Information Architecture

## 2.1 Navigation Structure

### Primary Navigation (Simplified from ButcherBox model)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]   Découvrir   Nos Fermes   S'abonner   À Propos   [🔍] [🛒] [👤] │
└─────────────────────────────────────────────────────────────────┘
```

| Nav Item | URL | Description |
|----------|-----|-------------|
| **Découvrir** (Discover) | `/shop` | Product catalog with categories |
| **Nos Fermes** (Our Farms) | `/farms` | Farm directory and stories |
| **S'abonner** (Subscribe) | `/get-started` | Subscription onboarding |
| **À Propos** (About) | `/about` | Mission, impact, story |

### Secondary Navigation (Footer)
- Shop by Category
- How It Works
- Traceability
- Agritourism
- Education
- FAQ
- Contact
- Careers

### Mobile Navigation
- Hamburger menu with full navigation
- Sticky bottom bar: Home | Shop | Cart | Account
- Floating "Subscribe" CTA on scroll

## 2.2 Complete Sitemap

```
/                           Homepage
├── /get-started            Subscription onboarding flow
│   ├── /get-started/box    Choose box type
│   ├── /get-started/customize   Customize selections
│   └── /get-started/checkout    Complete subscription
├── /shop                   Product catalog
│   ├── /shop?category=     Filtered by category
│   └── /shop?farm=         Filtered by farm
├── /products/[id]          Product detail page
├── /categories             Category overview
│   └── /categories/[slug]  Category product listing
├── /farms                  Farm directory
│   └── /farms/[slug]       Individual farm profile
├── /subscriptions          Subscription options
│   ├── /subscriptions/csa  CSA box subscriptions
│   ├── /subscriptions/category  Category subscriptions
│   └── /subscriptions/trial     Trial box signup
├── /about                  About Borgdanet
│   ├── /about/mission      Mission & vision
│   ├── /about/impact       Impact dashboard
│   └── /about/team         Team & story
├── /how-it-works           Detailed process explanation
├── /traceability           Farm-to-table journey
├── /experiences            Agritourism & farm visits
│   └── /experiences/[id]   Individual experience booking
├── /learn                  Educational resources
│   ├── /learn/recipes      Seasonal recipes
│   ├── /learn/guides       Growing guides
│   └── /learn/workshops    Workshop calendar
├── /cart                   Shopping cart
├── /checkout               Checkout flow
├── /login                  Authentication
├── /register               Account creation
├── /dashboard              Customer dashboard
│   ├── /dashboard/orders   Order history
│   ├── /dashboard/subscriptions  Subscription management
│   ├── /dashboard/impact   Personal impact stats
│   ├── /dashboard/loyalty  Points & rewards
│   └── /dashboard/quality  Quality feedback
├── /farmer                 Farmer dashboard
│   ├── /farmer/products    Product management
│   ├── /farmer/orders      Order fulfillment
│   ├── /farmer/analytics   Sales analytics
│   └── /farmer/profile     Farm profile editor
└── /faq                    Frequently asked questions
```

## 2.3 User Personas

### Persona 1: Sonia - The Health-Conscious Professional
- **Age**: 32, Marketing Manager in Tunis
- **Needs**: Convenient access to organic produce, time-saving, health-focused
- **Pain points**: Doesn't trust supermarket "organic" labels, no time for markets
- **Goals**: Feed family healthy food without weekend market trips
- **Journey**: Discovery via Instagram → Browse farms → Trial box → CSA subscriber

### Persona 2: Ahmed - The Traditional Foodie
- **Age**: 45, Engineer in Sousse
- **Needs**: Authentic taste like childhood, support local farmers
- **Pain points**: Industrial produce has no flavor, disconnect from food sources
- **Goals**: Rediscover real tomatoes, know where food comes from
- **Journey**: Word of mouth → Farm stories → One-time purchase → Loyal customer

### Persona 3: Fatma - The Young Farmer
- **Age**: 28, Second-generation organic farmer in Cap Bon
- **Needs**: Fair prices, direct customers, stable income
- **Pain points**: Middlemen take large cuts, market price volatility
- **Goals**: Sustainable livelihood, expand farm, teach others
- **Journey**: Farmer referral → Onboarding → First sales → Featured farmer

### Persona 4: Karim - The Curious Explorer
- **Age**: 35, Teacher in Sfax
- **Needs**: Educational content, farm experiences, community connection
- **Pain points**: Wants to learn regenerative practices, lacks access
- **Goals**: Visit farms, understand food systems, teach students
- **Journey**: Educational content → Workshop signup → Farm visit → Ambassador

## 2.4 User Flows

### Customer Journey: Discovery to Subscription

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Awareness│ → │ Interest │ → │  Trial   │ → │ Convert  │ → │ Loyalty  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │              │              │              │              │
  Social         Browse         Trial Box      Subscribe      Refer
  Media          Farms          -25% off       to CSA         Friends
  Word of        Read           First          Monthly        Earn
  Mouth          Stories        Taste          Delivery       Points
```

### Key Conversion Points
1. **Homepage → Get Started**: Hero CTA, value proposition
2. **Farm Story → Trial Box**: Emotional connection trigger
3. **Trial Box → Subscription**: Post-delivery follow-up email
4. **One-time → Subscription**: Cart upsell, savings calculator

---

# Part 3: Homepage Design Specification

## 3.1 Hero Section

### Purpose
Immediate emotional connection and clear value proposition. First impression that communicates what Borgdanet is and why it matters.

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   [Full-width seasonal farm imagery - Tunisian landscape]       │
│                                                                 │
│        Local food. Trusted farms. Shared abundance.             │
│        أكل بلدي. فلاحة موثوقة. خير مشترك                         │
│                                                                 │
│   Fresh, organic produce delivered weekly from small farms      │
│   across Tunisia. Know your farmer. Taste the difference.       │
│                                                                 │
│          [ Commencer → ]     [ Découvrir les fermes ]           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Content Requirements
- **Headline**: Tagline in both languages
- **Subheadline**: 1-2 sentences explaining the core value
- **Primary CTA**: "Commencer" (Get Started) → /get-started
- **Secondary CTA**: "Découvrir les fermes" (Discover farms) → /farms
- **Background**: Rotating seasonal imagery (4 seasons of Tunisian farms)

### Technical Notes
- Hero image lazy-loaded with blur placeholder
- Video option for desktop (muted, looping, 10-15 seconds)
- Mobile: Static image with gradient overlay for text legibility

## 3.2 Trust Bar

### Purpose
Immediate credibility through key metrics and certifications.

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  🌱 45+ Fermes    │   📦 12,000+ Livraisons   │   ⭐ 4.9/5 Avis   │   🏆 Bio Certifié │
└─────────────────────────────────────────────────────────────────┘
```

### Metrics to Display
| Metric | Icon | Label (FR) | Dynamic |
|--------|------|------------|---------|
| Farm count | 🌱 | X Fermes partenaires | Yes |
| Deliveries | 📦 | X Livraisons réussies | Yes |
| Rating | ⭐ | X/5 Satisfaction client | Yes |
| Certification | 🏆 | Bio Certifié | Static |

### Technical Notes
- Metrics pulled from database (cached, updated hourly)
- Animated count-up on scroll into view
- Click to expand with more detail

## 3.3 How It Works

### Purpose
Demystify the subscription/ordering process in 3 simple steps (ButcherBox pattern).

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│                    Comment ça marche                            │
│                                                                 │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐          │
│   │     1       │   │     2       │   │     3       │          │
│   │   [Icon]    │   │   [Icon]    │   │   [Icon]    │          │
│   │             │   │             │   │             │          │
│   │ Choisissez  │   │ Personnalisez│  │  Recevez    │          │
│   │ votre box   │   │ vos produits │  │  chez vous  │          │
│   │             │   │             │   │             │          │
│   │ CSA, essai  │   │ Selon vos   │   │ Livraison   │          │
│   │ ou à la     │   │ goûts et la │   │ gratuite    │          │
│   │ carte       │   │ saison      │   │ dès 80 TND  │          │
│   └─────────────┘   └─────────────┘   └─────────────┘          │
│                                                                 │
│                    [ Commencer maintenant → ]                   │
└─────────────────────────────────────────────────────────────────┘
```

### Steps Content

| Step | Icon | Title (FR) | Description |
|------|------|------------|-------------|
| 1 | 📦 | Choisissez votre formule | Box CSA hebdomadaire, box d'essai à -25%, ou achat à la carte |
| 2 | ✨ | Personnalisez vos produits | Sélectionnez selon vos goûts, allergies et la saison |
| 3 | 🚚 | Recevez chez vous | Livraison gratuite dès 80 TND, fraîcheur garantie |

### CTA
- "Commencer maintenant" → /get-started

## 3.4 Farm Showcase Carousel

### Purpose
Humanize the platform by featuring partner farms. Creates emotional connection and differentiates from anonymous grocery.

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│                    Rencontrez nos fermiers                      │
│          "Derrière chaque produit, une famille"                 │
│                                                                 │
│  ◀  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  ▶    │
│     │ [Photo]  │ │ [Photo]  │ │ [Photo]  │ │ [Photo]  │        │
│     │          │ │          │ │          │ │          │        │
│     │ Ferme    │ │ Domaine  │ │ Jardins  │ │ Oliveraie│        │
│     │ Ben Salah│ │ Zaghouan │ │ de Sonia │ │ Sfax    │        │
│     │          │ │          │ │          │ │          │        │
│     │ Cap Bon  │ │ Zaghouan │ │ Tunis    │ │ Sfax    │        │
│     │ Légumes  │ │ Huile    │ │ Herbes   │ │ Olives  │        │
│     └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                                 │
│                    [ Voir toutes les fermes → ]                 │
└─────────────────────────────────────────────────────────────────┘
```

### Card Content
- Farm photo (farmer portrait or farm landscape)
- Farm name
- Region
- Primary product category
- Click → /farms/[slug]

### Technical Notes
- Auto-scroll with pause on hover
- 4 cards visible on desktop, 1.5 on mobile (peek effect)
- Featured/verified farms prioritized

## 3.5 Product Categories Grid

### Purpose
Quick access to browse by category. Visual representation of product diversity.

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│                    Explorez nos produits                        │
│                                                                 │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│   │ [Image]  │ │ [Image]  │ │ [Image]  │ │ [Image]  │          │
│   │ Légumes  │ │ Fruits   │ │ Produits │ │ Huile    │          │
│   │          │ │          │ │ Laitiers │ │ d'Olive  │          │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                 │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│   │ [Image]  │ │ [Image]  │ │ [Image]  │ │ [Image]  │          │
│   │ Oeufs    │ │ Miel     │ │ Herbes   │ │ Produits │          │
│   │          │ │          │ │ Aromates │ │ Préparés │          │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Categories

| Category | Slug | Image Style |
|----------|------|-------------|
| Légumes | vegetables | Fresh harvest arrangement |
| Fruits | fruits | Seasonal fruit display |
| Produits Laitiers | dairy | Artisan cheese/yogurt |
| Huile d'Olive | olive-oil | Olive branch with bottle |
| Oeufs | eggs | Farm eggs in basket |
| Miel | honey | Honeycomb with jar |
| Herbes & Aromates | herbs | Fresh herb bundles |
| Produits Préparés | prepared | Preserves and value-added |

### Technical Notes
- Hover effect: Slight zoom, category name overlay
- Click → /categories/[slug]
- Badge for seasonal availability

## 3.6 CSA Box Options

### Purpose
Present subscription offerings clearly with pricing and value proposition (core conversion section).

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│                    Nos formules d'abonnement                    │
│        "Recevez le meilleur de nos fermes chaque semaine"       │
│                                                                 │
│   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│   │    ESSENTIEL    │ │    FAMILLE      │ │     GOURMET     │  │
│   │                 │ │   ⭐ Populaire  │ │                 │  │
│   │   45 TND/sem    │ │   75 TND/sem    │ │   120 TND/sem   │  │
│   │                 │ │                 │ │                 │  │
│   │ • 6-8 produits  │ │ • 12-15 produits│ │ • 18-20 produits│  │
│   │ • 2-3 personnes │ │ • 4-5 personnes │ │ • 5-6 personnes │  │
│   │ • Légumes +     │ │ • Légumes +     │ │ • Légumes +     │  │
│   │   Fruits        │ │   Fruits + Oeufs│ │   Tout inclus   │  │
│   │                 │ │                 │ │                 │  │
│   │ Livraison: 5TND │ │ Livraison offerte│ │ Livraison offerte│ │
│   │                 │ │                 │ │                 │  │
│   │  [ Choisir ]    │ │  [ Choisir ]    │ │  [ Choisir ]    │  │
│   └─────────────────┘ └─────────────────┘ └─────────────────┘  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  🎁 Box d'Essai - Première livraison à -25%              │  │
│   │     Découvrez Borgdanet sans engagement                  │  │
│   │                              [ Essayer maintenant → ]    │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ✓ Modifiez ou pausez à tout moment  ✓ Sans engagement       │
│   ✓ Satisfaction garantie 100%        ✓ Livraison flexible    │
└─────────────────────────────────────────────────────────────────┘
```

### Box Details

| Box | Price | Products | Serves | Includes |
|-----|-------|----------|--------|----------|
| Essentiel | 45 TND/week | 6-8 | 2-3 | Vegetables + Fruits |
| Famille | 75 TND/week | 12-15 | 4-5 | + Eggs + Herbs |
| Gourmet | 120 TND/week | 18-20 | 5-6 | Full range + Premium |

### Trust Indicators
- ✓ Modifiez ou pausez à tout moment
- ✓ Sans engagement
- ✓ Satisfaction garantie 100%
- ✓ Livraison flexible

## 3.7 Standards & Values Section

### Purpose
Communicate what makes Borgdanet different—the "Superior Standards" equivalent from ButcherBox.

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│                    Nos engagements                              │
│                                                                 │
│   ┌─────────────────┐         ┌─────────────────┐              │
│   │     [Icon]      │         │     [Icon]      │              │
│   │                 │         │                 │              │
│   │   100% Bio      │         │   Traçabilité   │              │
│   │   Certifié      │         │   Totale        │              │
│   │                 │         │                 │              │
│   │ Tous nos        │         │ Suivez votre    │              │
│   │ produits sont   │         │ nourriture de   │              │
│   │ certifiés bio   │         │ la graine à     │              │
│   │ ou en conversion│         │ l'assiette      │              │
│   └─────────────────┘         └─────────────────┘              │
│                                                                 │
│   ┌─────────────────┐         ┌─────────────────┐              │
│   │     [Icon]      │         │     [Icon]      │              │
│   │                 │         │                 │              │
│   │   Prix Justes   │         │   Agriculture   │              │
│   │   aux Fermiers  │         │   Régénératrice │              │
│   │                 │         │                 │              │
│   │ Nos fermiers    │         │ Des pratiques   │              │
│   │ reçoivent 70%+  │         │ qui régénèrent  │              │
│   │ du prix final   │         │ les sols et la  │              │
│   │                 │         │ biodiversité    │              │
│   └─────────────────┘         └─────────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Four Pillars

| Pillar | Icon | Title | Description |
|--------|------|-------|-------------|
| Organic | 🌱 | 100% Bio Certifié | Tous nos produits certifiés bio ou en conversion |
| Traceability | 🔍 | Traçabilité Totale | Suivez votre nourriture de la graine à l'assiette |
| Fair Trade | 🤝 | Prix Justes aux Fermiers | Nos fermiers reçoivent 70%+ du prix final |
| Regenerative | 🌍 | Agriculture Régénératrice | Pratiques qui régénèrent sols et biodiversité |

## 3.8 Impact Dashboard

### Purpose
Live display of community impact—unique differentiator showing collective good.

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│                    Notre impact collectif                       │
│          "Ensemble, nous changeons le système alimentaire"      │
│                                                                 │
│   ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│   │   45+      │ │  12,500    │ │   850kg    │ │   15T      │  │
│   │  Fermes    │ │  Familles  │ │  Nourriture│ │    CO2     │  │
│   │ partenaires│ │  servies   │ │  sauvée    │ │   évité    │  │
│   └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  💚 Cette semaine: 245 familles ont reçu leur box       │  │
│   │     représentant 890 TND versés directement aux fermes  │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│                    [ Voir notre rapport d'impact → ]            │
└─────────────────────────────────────────────────────────────────┘
```

### Metrics

| Metric | Source | Update Frequency |
|--------|--------|------------------|
| Partner farms | Farm count | Real-time |
| Families served | Unique customers | Daily |
| Food saved | RescuedProduce weight | Weekly |
| CO2 avoided | ImpactMetrics | Monthly calculation |

### Technical Notes
- Animated counters on scroll
- Weekly highlight banner (dynamic)
- Link to full impact report page

## 3.9 Seasonal Spotlight

### Purpose
Highlight what's fresh NOW—creates urgency and showcases seasonal variety.

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│                    🍊 Cette saison: Hiver                       │
│                                                                 │
│   ◀  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  ▶    │
│      │ [Photo]  │ │ [Photo]  │ │ [Photo]  │ │ [Photo]  │        │
│      │          │ │          │ │          │ │          │        │
│      │ Oranges  │ │ Épinards │ │ Carottes │ │ Fenouil  │        │
│      │ de Hammamet│ │ Bio     │ │ nouvelles│ │ sauvage │        │
│      │          │ │          │ │          │ │          │        │
│      │ 4.50 TND │ │ 3.20 TND │ │ 2.80 TND │ │ 5.00 TND │        │
│      │   /kg    │ │  /botte  │ │   /kg    │ │  /botte  │        │
│      │          │ │          │ │          │ │          │        │
│      │[Ajouter] │ │[Ajouter] │ │[Ajouter] │ │[Ajouter] │        │
│      └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                                 │
│                    [ Voir tous les produits de saison → ]       │
└─────────────────────────────────────────────────────────────────┘
```

### Content
- Season indicator with icon
- Products filtered by `seasonalAvailability` matching current month
- Quick "Add to Cart" functionality
- Price and unit displayed

## 3.10 Testimonials Section

### Purpose
Social proof from real customers and farmers (ButcherBox pattern).

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│                    Ce qu'ils disent de nous                     │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │                                                         │  │
│   │  "Depuis que j'ai découvert Borgdanet, mes enfants      │  │
│   │   mangent enfin des légumes avec plaisir. La qualité    │  │
│   │   est incomparable et savoir d'où vient notre           │  │
│   │   nourriture change tout."                              │  │
│   │                                                         │  │
│   │   ⭐⭐⭐⭐⭐                                              │  │
│   │                                                         │  │
│   │   [Photo] Sonia M. - Tunis                              │  │
│   │           Cliente depuis 8 mois                         │  │
│   │                                                         │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│                    ○ ○ ● ○ ○  (pagination dots)                │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  "Borgdanet m'a permis de vendre directement aux        │  │
│   │   familles qui apprécient vraiment mon travail.         │  │
│   │   Je gagne 40% de plus qu'avec les intermédiaires."     │  │
│   │                                                         │  │
│   │   [Photo] Ahmed B. - Fermier à Cap Bon                  │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Content Mix
- 70% customer testimonials
- 30% farmer testimonials
- Include photo, name, location, duration as customer/farmer
- Star rating where applicable

## 3.11 Farm Stories Preview

### Purpose
Deeper connection through storytelling—differentiator from commodity platforms.

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│                    Histoires de nos fermes                      │
│                                                                 │
│   ┌────────────────────────────┐ ┌────────────────────────────┐│
│   │ [Large hero image]         │ │ [Image]                    ││
│   │                            │ │ Comment la famille         ││
│   │ De l'ingénieur à           │ │ Trabelsi a sauvé les       ││
│   │ l'agriculteur: Le          │ │ variétés anciennes         ││
│   │ parcours de Karim          │ │ de tomates                 ││
│   │                            │ │                            ││
│   │ Ferme Zaghouan Bio         │ │ Ferme Ben Salah            ││
│   │                            │ ├────────────────────────────┤│
│   │ [ Lire l'histoire → ]      │ │ [Image]                    ││
│   │                            │ │ Le miel de Kroumirie:      ││
│   │                            │ │ Un trésor menacé           ││
│   │                            │ │                            ││
│   │                            │ │ Apiculture Jendouba        ││
│   └────────────────────────────┘ └────────────────────────────┘│
│                                                                 │
│                    [ Toutes les histoires → ]                   │
└─────────────────────────────────────────────────────────────────┘
```

### Content
- Featured story (large)
- 2 secondary stories
- Links to full farm profiles

## 3.12 FAQ Section

### Purpose
Address common objections and questions before they become barriers.

### FAQ Items

| Question | Answer Summary |
|----------|----------------|
| Comment fonctionne la livraison? | Zones A/B/C, créneaux matin/soir, gratuit dès 80 TND |
| Puis-je personnaliser ma box? | Oui, échangez jusqu'à 3 produits par livraison |
| D'où viennent vos produits? | 100% fermes tunisiennes, traçabilité complète |
| Comment annuler ou pauser? | En 2 clics depuis votre tableau de bord |
| Que faire si un produit ne me plaît pas? | Garantie satisfaction, crédit ou remplacement |
| Vos produits sont-ils vraiment bio? | Certifiés ou en conversion, audités régulièrement |

### Layout
- Accordion style
- Schema markup for SEO
- Link to full FAQ page

## 3.13 Footer

### Layout
```
┌─────────────────────────────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │ DÉCOUVRIR│  │ FERMES   │  │ AIDE     │  │ ENTREPRISE│       │
│  │          │  │          │  │          │  │          │        │
│  │ Produits │  │ Devenir  │  │ FAQ      │  │ À propos │        │
│  │ Catégories│ │ partenaire│ │ Contact  │  │ Impact   │        │
│  │ Saison   │  │ Nos fermes│ │ Livraison│  │ Carrières│        │
│  │ Offres   │  │ Agritour.│  │ Garanties│  │ Presse   │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📧 Recevez nos actualités et recettes de saison         │   │
│  │    [Email_______________] [ S'inscrire ]                │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Logo]  Local food. Trusted farms. Shared abundance.          │
│                                                                 │
│  [FB] [IG] [TikTok] [WhatsApp]                                 │
│                                                                 │
│  © 2024 Borgdanet  |  CGV  |  Confidentialité  |  [FR/AR]      │
└─────────────────────────────────────────────────────────────────┘
```

---

# Part 4: Core Page Specifications

## 4.1 Get Started / Onboarding Flow

### Purpose
Convert visitors to subscribers through a guided, low-friction flow (inspired by ButcherBox's onboarding).

### Flow Steps

```
Step 1: Choose Your Box    →    Step 2: Customize    →    Step 3: Delivery    →    Step 4: Account
     ↓                              ↓                        ↓                        ↓
Select box size              Swap products              Choose zone              Create account
& frequency                  Set preferences            Select day/time          Payment info
```

### Step 1: Choose Your Box (`/get-started`)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Progress: ●○○○]           Étape 1 sur 4                       │
│                                                                 │
│             Choisissez votre formule                            │
│                                                                 │
│   ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐  │
│   │   BOX ESSAI     │ │   ESSENTIEL     │ │   FAMILLE       │  │
│   │   🎁 -25%       │ │                 │ │   ⭐ Populaire  │  │
│   │                 │ │                 │ │                 │  │
│   │   33 TND        │ │   45 TND/sem    │ │   75 TND/sem    │  │
│   │   (au lieu de   │ │                 │ │                 │  │
│   │    45 TND)      │ │                 │ │                 │  │
│   │                 │ │                 │ │                 │  │
│   │ Une seule       │ │ Abonnement      │ │ Abonnement      │  │
│   │ livraison pour  │ │ hebdomadaire    │ │ hebdomadaire    │  │
│   │ découvrir       │ │ 6-8 produits    │ │ 12-15 produits  │  │
│   │                 │ │                 │ │                 │  │
│   │  [ Essayer ]    │ │  [ Choisir ]    │ │  [ Choisir ]    │  │
│   └─────────────────┘ └─────────────────┘ └─────────────────┘  │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  Fréquence:  ○ Chaque semaine   ● Toutes les 2 semaines │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│              [ Continuer → ]                                    │
└─────────────────────────────────────────────────────────────────┘
```

### Step 2: Customize (`/get-started/customize`)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Progress: ●●○○]           Étape 2 sur 4                       │
│                                                                 │
│             Personnalisez votre box                             │
│                                                                 │
│   Votre box Famille contient:                                   │
│                                                                 │
│   ┌────────────────────────────────────────────────────────┐   │
│   │ ✓ Tomates bio (1kg)           [Échanger]               │   │
│   │ ✓ Courgettes (500g)           [Échanger]               │   │
│   │ ✓ Oranges Hammamet (2kg)      [Échanger]               │   │
│   │ ✓ Épinards frais (botte)      [Échanger]               │   │
│   │ ✓ Oeufs fermiers (12)         [Échanger]               │   │
│   │ ✓ Fromage frais (250g)        [Échanger]               │   │
│   │ ...                                                     │   │
│   └────────────────────────────────────────────────────────┘   │
│                                                                 │
│   Préférences alimentaires:                                     │
│   □ Sans gluten  □ Végétarien  □ Sans lactose  □ Allergies     │
│                                                                 │
│   Produits à éviter: [_________________________________]        │
│                                                                 │
│              [ ← Retour ]    [ Continuer → ]                    │
└─────────────────────────────────────────────────────────────────┘
```

### Step 3: Delivery (`/get-started/delivery`)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Progress: ●●●○]           Étape 3 sur 4                       │
│                                                                 │
│             Choisissez votre livraison                          │
│                                                                 │
│   Votre zone:                                                   │
│   ┌────────────────────────────────────────────────────────┐   │
│   │ [Map of Tunisia with zones highlighted]                 │   │
│   │                                                         │   │
│   │  ○ Zone A - Tunis centre (Livraison gratuite dès 80TND)│   │
│   │  ● Zone B - Banlieue (Livraison gratuite dès 120TND)   │   │
│   │  ○ Zone C - Périphérie (Livraison gratuite dès 150TND) │   │
│   └────────────────────────────────────────────────────────┘   │
│                                                                 │
│   Jour de livraison:                                            │
│   ○ Mardi  ● Jeudi  ○ Samedi                                   │
│                                                                 │
│   Créneau horaire:                                              │
│   ○ Matin (6h-9h)  ● Soir (18h-21h)                            │
│                                                                 │
│              [ ← Retour ]    [ Continuer → ]                    │
└─────────────────────────────────────────────────────────────────┘
```

### Step 4: Account & Payment (`/get-started/checkout`)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Progress: ●●●●]           Étape 4 sur 4                       │
│                                                                 │
│             Finalisez votre inscription                         │
│                                                                 │
│   ┌─────────────────────┐  ┌─────────────────────────────────┐ │
│   │ VOTRE COMPTE        │  │ RÉCAPITULATIF                   │ │
│   │                     │  │                                 │ │
│   │ Prénom: [________]  │  │ Box Famille          75.00 TND  │ │
│   │ Nom: [___________]  │  │ Livraison Zone B      0.00 TND  │ │
│   │ Email: [_________]  │  │ ─────────────────────────────── │ │
│   │ Téléphone: [_____]  │  │ Total hebdomadaire   75.00 TND  │ │
│   │ Mot de passe: [___] │  │                                 │ │
│   │                     │  │ Première livraison: Jeudi 15 Dec│ │
│   │ ADRESSE             │  │                                 │ │
│   │ Rue: [___________]  │  │ ✓ Modifiable à tout moment      │ │
│   │ Ville: [_________]  │  │ ✓ Annulation sans frais         │ │
│   │ Code postal: [____] │  │ ✓ Satisfaction garantie         │ │
│   │                     │  │                                 │ │
│   │ PAIEMENT            │  │                                 │ │
│   │ ○ Flouci            │  │                                 │ │
│   │ ○ Espèces           │  │                                 │ │
│   └─────────────────────┘  └─────────────────────────────────┘ │
│                                                                 │
│              [ ← Retour ]    [ Confirmer mon abonnement → ]     │
└─────────────────────────────────────────────────────────────────┘
```

## 4.2 Farms Directory (`/farms`)

### Purpose
Discover and connect with partner farms—the heart of Borgdanet's differentiation.

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                    Nos fermes partenaires                       │
│     "45 familles d'agriculteurs, une même passion"              │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │ Filtrer: [Région ▼] [Catégorie ▼] [Certifications ▼]    │  │
│   │ Rechercher: [________________________________] 🔍       │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│   │ [Farm photo] │ │ [Farm photo] │ │ [Farm photo] │           │
│   │              │ │              │ │              │           │
│   │ Ferme Ben    │ │ Domaine      │ │ Les Jardins  │           │
│   │ Salah        │ │ Zaghouan     │ │ de Sonia     │           │
│   │              │ │              │ │              │           │
│   │ 📍 Cap Bon   │ │ 📍 Zaghouan  │ │ 📍 Tunis     │           │
│   │ 🌱 Légumes   │ │ 🫒 Huile     │ │ 🌿 Herbes    │           │
│   │              │ │              │ │              │           │
│   │ ⭐ 4.9 (127) │ │ ⭐ 4.8 (89)  │ │ ⭐ 5.0 (45)  │           │
│   │              │ │              │ │              │           │
│   │ [Voir la ferme]│ [Voir la ferme]│ [Voir la ferme]│         │
│   └──────────────┘ └──────────────┘ └──────────────┘           │
│                                                                 │
│   ... (more farms in grid)                                      │
│                                                                 │
│   ┌─────────────────────────────────────────────────────────┐  │
│   │  🌾 Vous êtes agriculteur?                              │  │
│   │     Rejoignez notre réseau de fermes partenaires        │  │
│   │                          [ Devenir partenaire → ]       │  │
│   └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Farm Card Data
- Farm photo (primary)
- Farm name
- Region
- Primary category
- Rating and review count
- Verification badge (if verified)
- "Visits available" badge (for agritourism)

## 4.3 Individual Farm Profile (`/farms/[slug]`)

### Purpose
Deep dive into a farm's story, practices, and products—builds trust and emotional connection.

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  [Hero image - farm landscape, wide shot]                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  [Farmer        Ferme Ben Salah                          │  │
│  │   portrait]     ⭐ 4.9 (127 avis) • Cap Bon • Depuis 2018│  │
│  │                                                          │  │
│  │                 🌱 Bio Certifié  🌍 Régénératif           │  │
│  │                                                          │  │
│  │  "Nous cultivons la terre de nos ancêtres avec les      │  │
│  │   méthodes de demain"                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Tabs: Notre histoire | Nos produits | Nos pratiques | Visites]│
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  NOTRE HISTOIRE                                                 │
│  ──────────────                                                 │
│  Ahmed Ben Salah a repris la ferme familiale en 2015 après     │
│  une carrière d'ingénieur. Convaincu que l'avenir de           │
│  l'agriculture tunisienne passe par le bio, il a entamé une    │
│  conversion qui a duré 3 ans...                                 │
│                                                                 │
│  [Photo gallery - farm life, family, seasons]                   │
│                                                                 │
│  NOS PRODUITS                                                   │
│  ────────────                                                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
│  │Tomates  │ │Courgettes│ │Poivrons │ │Aubergines│             │
│  │heirloom │ │bio      │ │         │ │         │              │
│  │4.50 TND │ │3.20 TND │ │5.00 TND │ │3.80 TND │              │
│  │[Ajouter]│ │[Ajouter]│ │[Ajouter]│ │[Ajouter]│              │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
│                                                                 │
│  NOS PRATIQUES                                                  │
│  ─────────────                                                  │
│  • Rotation des cultures sur 4 ans                              │
│  • Compostage sur site                                          │
│  • Irrigation goutte-à-goutte                                   │
│  • Zéro pesticides chimiques                                    │
│  • Semences paysannes locales                                   │
│                                                                 │
│  VISITER LA FERME                                               │
│  ────────────────                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🌻 Journée découverte - 35 TND/personne                │   │
│  │     Visite guidée + dégustation + panier à emporter     │   │
│  │                              [ Réserver une visite → ]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  AVIS CLIENTS                                                   │
│  ────────────                                                   │
│  ⭐⭐⭐⭐⭐ "Les meilleures tomates que j'ai mangées..."       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Sections
1. **Hero & Overview**: Photo, name, rating, badges, quote
2. **Notre histoire**: Farm story, photo gallery
3. **Nos produits**: Product grid with quick-add
4. **Nos pratiques**: Farming methods, certifications
5. **Visites**: Agritourism offerings (if available)
6. **Avis clients**: Customer reviews

## 4.4 Product Catalog (`/shop`)

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                         Nos produits                            │
│                                                                 │
│  ┌──────────────┐  ┌────────────────────────────────────────┐  │
│  │ FILTRES      │  │ Trier par: [Popularité ▼]  [🔍 Rechercher]│ │
│  │              │  └────────────────────────────────────────┘  │
│  │ Catégorie    │                                              │
│  │ □ Légumes    │  ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ □ Fruits     │  │[Product]│ │[Product]│ │[Product]│       │
│  │ □ Oeufs      │  │         │ │         │ │         │       │
│  │ □ Produits   │  │Tomates  │ │Oranges  │ │Oeufs    │       │
│  │   laitiers   │  │heirloom │ │Hammamet │ │fermiers │       │
│  │ □ Huile      │  │         │ │         │ │         │       │
│  │ □ Miel       │  │Ferme Ben│ │Domaine  │ │Les      │       │
│  │ □ Herbes     │  │Salah    │ │Zaghouan │ │Jardins  │       │
│  │              │  │         │ │         │ │         │       │
│  │ Ferme        │  │4.50 TND │ │6.00 TND │ │8.00 TND │       │
│  │ [Toutes ▼]   │  │/kg      │ │/kg      │ │/12      │       │
│  │              │  │         │ │         │ │         │       │
│  │ Prix         │  │[Ajouter]│ │[Ajouter]│ │[Ajouter]│       │
│  │ [0]──●──[50] │  └─────────┘ └─────────┘ └─────────┘       │
│  │              │                                              │
│  │ Disponibilité│  ... (more products)                         │
│  │ □ En stock   │                                              │
│  │ □ Saisonnier │  [Load more]                                 │
│  │ □ Rescue     │                                              │
│  │   (-30%)     │                                              │
│  └──────────────┘                                              │
└─────────────────────────────────────────────────────────────────┘
```

### Product Card
- Product image
- Product name
- Farm name (linked)
- Price per unit
- "Seasonal" badge (if applicable)
- "Rescue -30%" badge (if rescue produce)
- Quick add to cart
- Click → product detail page

## 4.5 About / Our Story (`/about`)

### Sections
1. **Hero**: Mission statement with founder photo
2. **Our Why**: Problem we're solving (industrial food disconnect)
3. **Our Vision**: The world we're building
4. **Our Values**: 4 pillars expanded
5. **Our Impact**: Key metrics and stories
6. **Our Team**: Founders and key team members
7. **Our Partners**: Farm network, certifying bodies
8. **Join Us**: CTA for customers and farmers

---

# Part 5: Subscription Experience

## 5.1 Subscription Types

### CSA Box Subscriptions

| Type | Price | Contents | Frequency | Commitment |
|------|-------|----------|-----------|------------|
| Essentiel | 45 TND | 6-8 items | Weekly/Biweekly | None |
| Famille | 75 TND | 12-15 items | Weekly/Biweekly | None |
| Gourmet | 120 TND | 18-20 items | Weekly/Biweekly | None |

### Category Subscriptions

| Category | Small | Medium | Large |
|----------|-------|--------|-------|
| Légumes | 25 TND | 40 TND | 60 TND |
| Fruits | 20 TND | 35 TND | 50 TND |
| Oeufs + Laitiers | 30 TND | 50 TND | 75 TND |

### Trial Box
- **Price**: 33 TND (25% off regular 45 TND)
- **Contents**: Same as Essentiel box
- **Commitment**: One-time, no subscription required
- **Goal**: Convert to full subscription

## 5.2 Flexibility Features

### Pause Subscription
- Up to 4 pauses per year
- 1-4 weeks per pause
- Resume automatically or manually

### Skip Delivery
- Up to 2 skips per month
- Skip from dashboard or email reminder
- No charge for skipped weeks

### Swap Products
- Up to 3 swaps per delivery
- Swap for similar-value items
- Preferences saved for future boxes

### Cancel Anytime
- No cancellation fee
- Effective immediately
- Exit survey for feedback

## 5.3 Subscription Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│  Mon abonnement                                                 │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  BOX FAMILLE - Actif                                     │   │
│  │  75 TND/semaine • Prochaine livraison: Jeudi 15 Dec     │   │
│  │                                                          │   │
│  │  [Modifier] [Pauser] [Passer cette semaine]              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Votre prochaine box:                                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  • Tomates heirloom (1kg)              [Échanger]       │   │
│  │  • Courgettes bio (500g)               [Échanger]       │   │
│  │  • Oranges Hammamet (2kg)              [Échanger]       │   │
│  │  • ...                                                   │   │
│  │                                                          │   │
│  │  Date limite de modification: Mardi 13 Dec, 18h         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Historique:                                                    │
│  • Box du 8 Dec - Livrée ✓                                     │
│  • Box du 1 Dec - Livrée ✓                                     │
│  • Box du 24 Nov - Passée (vacances)                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# Part 6: Unique Feature Pages

## 6.1 Agritourism & Farm Experiences (`/experiences`)

### Purpose
Diversified revenue for farmers + deeper customer connection.

### Experience Types

| Type | Duration | Price Range | Includes |
|------|----------|-------------|----------|
| Visite découverte | 2-3h | 25-45 TND | Tour + tasting |
| Journée à la ferme | Full day | 60-100 TND | Tour + meal + workshop |
| Atelier pratique | 3-4h | 40-70 TND | Hands-on learning |
| Séjour fermier | 1-2 nights | 150-300 TND | Accommodation + meals |

### Booking Flow
1. Browse experiences by region/type
2. Select date from farm calendar
3. Choose number of participants
4. Confirm and pay
5. Receive confirmation with directions

## 6.2 Value-Added Products (`/shop?category=prepared`)

### Categories
- **Conserves**: Tomato sauce, harissa, pickled vegetables
- **Huiles**: Olive oil, argan oil, infused oils
- **Miels**: Regional honeys, honeycomb
- **Fromages**: Fresh cheese, aged cheese, labneh
- **Confitures**: Seasonal fruit preserves
- **Herbes séchées**: Tea blends, cooking herbs

### Quality Standards
- Small-batch production
- Farm-identified sourcing
- No artificial preservatives
- Traditional methods

## 6.3 Rescue Produce Program (`/shop?rescue=true`)

### Concept
Cosmetically imperfect but perfectly delicious produce at 30% discount.

### Messaging
> "Ces produits sont parfaitement délicieux—ils ont juste une allure différente. En les choisissant, vous réduisez le gaspillage alimentaire et économisez 30%."

### Display
- "Rescue" badge on products
- Before/after imagery showing "imperfection"
- Impact counter: "X kg de nourriture sauvée"

## 6.4 Educational Resources (`/learn`)

### Content Types
1. **Recettes de saison**: Monthly recipe collections featuring box ingredients
2. **Guides de conservation**: How to store produce for maximum freshness
3. **Fiches légumes**: Deep dives into individual vegetables (history, nutrition, cooking)
4. **Agriculture régénératrice**: Educational content on regenerative practices
5. **Calendrier saisonnier**: What's in season each month in Tunisia

### Workshops Calendar
- Online cooking classes with chefs
- Farm-based workshops (hands-on)
- Fermentation and preservation workshops
- Kids' educational programs

## 6.5 Community Events (`/community`)

### Event Types
- Farm open days
- Seasonal harvest festivals
- Producer markets
- Cooking demonstrations
- School programs

### Community Features
- Event calendar
- Member meetups
- Ambassador program
- Social sharing

## 6.6 Loyalty & Referral Program

### Loyalty Tiers

| Tier | Points Required | Benefits |
|------|-----------------|----------|
| Graine | 0-499 | Base benefits |
| Pousse | 500-1499 | 5% discount, early access |
| Fleur | 1500-2999 | 10% discount, free delivery |
| Arbre | 3000+ | 15% discount, exclusive products |

### Earning Points
- 1 TND spent = 1 point
- Review = 50 points
- Referral = 200 points
- Quality survey = 25 points

### Referral Program
- Give 20 TND, Get 20 TND
- Referee gets 20 TND off first box
- Referrer gets 20 TND credit after referee's first order

---

# Part 7: Shopping Experience

## 7.1 Cart Redesign

### Multi-Farm Cart Display

```
┌─────────────────────────────────────────────────────────────────┐
│  Votre panier (7 articles)                                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🌱 Ferme Ben Salah                                      │   │
│  │  ├─ Tomates heirloom (1kg)      4.50 TND    [-] 1 [+]   │   │
│  │  ├─ Courgettes bio (500g)       3.20 TND    [-] 2 [+]   │   │
│  │  └─ Poivrons rouges (500g)      5.00 TND    [-] 1 [+]   │   │
│  │                                 Sous-total: 15.90 TND    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🫒 Domaine Zaghouan                                     │   │
│  │  └─ Huile d'olive extra (1L)    28.00 TND   [-] 1 [+]   │   │
│  │                                 Sous-total: 28.00 TND    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ═══════════════════════════════════════════════════════════   │
│                                                                 │
│  Sous-total produits:                              43.90 TND   │
│  Livraison (Zone B):                                8.00 TND   │
│  ─────────────────────────────────────────────────────────────│
│  Total:                                            51.90 TND   │
│                                                                 │
│  💡 Ajoutez 28.10 TND pour la livraison gratuite!              │
│                                                                 │
│  [ Continuer mes achats ]           [ Commander → ]             │
└─────────────────────────────────────────────────────────────────┘
```

### Key Features
- Grouped by farm
- Single delivery fee (not per-farm)
- Free delivery threshold progress
- Quick quantity adjustment
- Remove item with confirmation

## 7.2 Checkout Flow

### Single Page Checkout

```
┌─────────────────────────────────────────────────────────────────┐
│  Finaliser ma commande                                          │
│                                                                 │
│  ┌────────────────────────┐  ┌────────────────────────────────┐│
│  │ 1. LIVRAISON           │  │ RÉCAPITULATIF                  ││
│  │                        │  │                                ││
│  │ ○ Livraison à domicile │  │ 7 articles de 2 fermes        ││
│  │ ● Point de retrait     │  │                                ││
│  │                        │  │ Ferme Ben Salah    15.90 TND  ││
│  │ [Select pickup point]  │  │ Domaine Zaghouan   28.00 TND  ││
│  │                        │  │ ─────────────────────────────  ││
│  │ 2. CRÉNEAU             │  │ Sous-total         43.90 TND  ││
│  │                        │  │ Livraison           0.00 TND  ││
│  │ Jeudi 15 Dec           │  │ (Point de retrait)            ││
│  │ ○ 6h-9h  ● 18h-21h     │  │                                ││
│  │                        │  │ TOTAL              43.90 TND  ││
│  │ 3. PAIEMENT            │  │                                ││
│  │                        │  │ ✓ Satisfaction garantie       ││
│  │ ○ Flouci               │  │ ✓ Fraîcheur garantie          ││
│  │ ● Espèces à la livr.   │  │                                ││
│  │                        │  │                                ││
│  └────────────────────────┘  └────────────────────────────────┘│
│                                                                 │
│  □ J'accepte les conditions générales de vente                 │
│                                                                 │
│                    [ Confirmer ma commande → ]                  │
└─────────────────────────────────────────────────────────────────┘
```

## 7.3 Order Tracking

### Tracking States
1. **Confirmée**: Order received and confirmed
2. **En préparation**: Farms preparing items
3. **En route**: Out for delivery
4. **Livrée**: Delivered successfully

### Tracking Page

```
┌─────────────────────────────────────────────────────────────────┐
│  Commande #BDN-2024-1234                                        │
│                                                                 │
│  ●────────●────────○────────○                                   │
│  Confirmée  En prép.  En route  Livrée                         │
│                                                                 │
│  Statut actuel: En préparation                                  │
│  Livraison prévue: Jeudi 15 Dec, 18h-21h                       │
│                                                                 │
│  Vos produits sont en cours de préparation chez:               │
│  • Ferme Ben Salah - ✓ Prêt                                    │
│  • Domaine Zaghouan - ⏳ En cours                               │
│                                                                 │
│  [ Contacter le support ]                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

# Part 8: Dashboard Experiences

## 8.1 Customer Dashboard Redesign

### Dashboard Home

```
┌─────────────────────────────────────────────────────────────────┐
│  Bonjour, Sonia! 👋                                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🎁 Prochaine livraison: Jeudi 15 Dec                   │   │
│  │     Box Famille • 12 produits • Zone B                   │   │
│  │                                                          │   │
│  │  [Voir les produits]  [Modifier]                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │ Commandes  │ │ Abonnements│ │ Mon impact │ │ Fidélité   │  │
│  │     12     │ │     2      │ │   124kg    │ │  🌱 890    │  │
│  │  passées   │ │   actifs   │ │ CO2 évité  │ │  points    │  │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
│                                                                 │
│  Commandes récentes:                                            │
│  • #BDN-1234 - Livrée le 8 Dec - 75 TND [Voir] [Évaluer]      │
│  • #BDN-1233 - Livrée le 1 Dec - 52 TND [Voir]                │
│                                                                 │
│  Fermes favorites:                                              │
│  [Ferme Ben Salah] [Domaine Zaghouan] [Les Jardins de Sonia]  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Navigation
- Vue d'ensemble (Dashboard home)
- Mes commandes
- Mes abonnements
- Mon impact
- Fidélité & Parrainage
- Qualité & Retours
- Paramètres

## 8.2 Farmer Dashboard Enhancements

### Dashboard Home

```
┌─────────────────────────────────────────────────────────────────┐
│  Ferme Ben Salah - Tableau de bord                              │
│                                                                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐  │
│  │ Cette sem. │ │ Ce mois    │ │ Note       │ │ Produits   │  │
│  │  1,250 TND │ │  4,800 TND │ │ ⭐ 4.9     │ │    24      │  │
│  │  ventes    │ │  ventes    │ │ (127 avis) │ │  actifs    │  │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘  │
│                                                                 │
│  Commandes à préparer:                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📦 5 commandes pour Jeudi 15 Dec                       │   │
│  │                                                          │   │
│  │  • #BDN-1234 - Tomates (2kg), Courgettes (1kg)          │   │
│  │  • #BDN-1235 - Poivrons (1kg), Tomates (1kg)            │   │
│  │  • ...                                                   │   │
│  │                                                          │   │
│  │  [Voir toutes] [Imprimer la liste]                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Stock à mettre à jour:                                         │
│  • Tomates heirloom - Stock bas (5kg restant)                  │
│  • Courgettes - En rupture                                     │
│                                                                 │
│  [Gérer mes produits] [Voir mes analyses] [Modifier ma ferme]  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Key Farmer Features
- Order fulfillment list (printable)
- Stock management with alerts
- Sales analytics
- Customer feedback
- Profile management
- Payout tracking

---

# Part 9: Technical Integration Notes

## 9.1 Mapping to Existing FarmBox Features

| Borgdanet Feature | FarmBox Equivalent | Status |
|-------------------|-------------------|--------|
| CSA Subscriptions | Subscription model | Exists - enhance UI |
| Category Subscriptions | CategorySubscription | Exists - new feature |
| Trial Boxes | TrialBox model | Exists - enhance flow |
| Farm Profiles | Farm + FarmProfile | Exists - enhance content |
| Product Discovery | ProductDiscovery controller | Exists - add seasonal |
| Quality Assurance | QualityReport model | Exists - enhance |
| Loyalty Program | CustomerLoyalty model | Exists - build UI |
| Referral Program | Referral model | Exists - build UI |
| Rescue Produce | RescuedProduce model | Exists - add filtering |
| Impact Metrics | ImpactMetrics model | Exists - build dashboard |
| Agritourism | New feature | TO BUILD |
| Educational Content | New feature | TO BUILD |
| Farm Stories | FarmProfile.story | Exists - enhance display |

## 9.2 New Components Needed

### Frontend Components
```
src/components/
├── brand/
│   ├── Logo.tsx
│   ├── Tagline.tsx
│   └── TrustBar.tsx
├── home/
│   ├── HeroSection.tsx
│   ├── HowItWorks.tsx
│   ├── FarmCarousel.tsx
│   ├── CategoryGrid.tsx
│   ├── SubscriptionOptions.tsx
│   ├── StandardsSection.tsx
│   ├── ImpactDashboard.tsx
│   ├── SeasonalSpotlight.tsx
│   ├── TestimonialsSection.tsx
│   ├── FarmStoriesPreview.tsx
│   └── FAQSection.tsx
├── subscription/
│   ├── BoxSelector.tsx
│   ├── BoxCustomizer.tsx
│   ├── DeliverySelector.tsx
│   └── SubscriptionDashboard.tsx
├── farm/
│   ├── FarmCard.tsx
│   ├── FarmProfile.tsx
│   ├── FarmStory.tsx
│   └── FarmProducts.tsx
└── experiences/
    ├── ExperienceCard.tsx
    ├── ExperienceBooking.tsx
    └── ExperienceCalendar.tsx
```

### Backend Endpoints (New)
```
/api/experiences           - Agritourism CRUD
/api/experiences/bookings  - Booking management
/api/content/recipes       - Recipe content
/api/content/guides        - Educational guides
/api/community/events      - Community events
```

## 9.3 Database Additions

```prisma
model Experience {
  id          String   @id @default(cuid())
  farmId      String
  farm        Farm     @relation(fields: [farmId], references: [id])
  title       String
  titleAr     String?
  description String
  descriptionAr String?
  type        ExperienceType
  duration    Int      // minutes
  price       Decimal
  maxGuests   Int
  images      String[]
  available   Boolean  @default(true)
  createdAt   DateTime @default(now())
}

model ExperienceBooking {
  id           String   @id @default(cuid())
  experienceId String
  experience   Experience @relation(fields: [experienceId], references: [id])
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  date         DateTime
  guests       Int
  status       BookingStatus
  totalPrice   Decimal
  createdAt    DateTime @default(now())
}

enum ExperienceType {
  VISIT
  FULL_DAY
  WORKSHOP
  STAY
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}
```

## 9.4 Bilingual Implementation

### Strategy
- All user-facing strings in translation files
- Database fields with `*Ar` suffix for Arabic content
- Language preference stored in user profile
- URL structure: `/fr/...` and `/ar/...` with redirect based on preference

### Translation Files Structure
```
locales/
├── fr/
│   ├── common.json
│   ├── home.json
│   ├── products.json
│   ├── checkout.json
│   └── dashboard.json
└── ar/
    ├── common.json
    ├── home.json
    ├── products.json
    ├── checkout.json
    └── dashboard.json
```

---

# Part 10: Mobile Experience

## 10.1 Mobile-First Design Principles

1. **Thumb-friendly navigation**: Bottom nav bar for key actions
2. **Large touch targets**: Minimum 44px for interactive elements
3. **Streamlined forms**: One field per screen in onboarding
4. **Sticky CTAs**: Always-visible "Add to Cart" and "Checkout"
5. **Swipe gestures**: Carousel navigation, pull-to-refresh
6. **Offline capability**: Cart persists offline, sync on reconnect

## 10.2 Mobile Navigation

```
┌─────────────────────────────────────────┐
│  [≡]  BORGDANET  [🔍] [🛒3]            │
└─────────────────────────────────────────┘
                  ...
┌─────────────────────────────────────────┐
│  🏠      🛒      📦      👤            │
│ Accueil  Shop   Commandes  Compte       │
└─────────────────────────────────────────┘
```

## 10.3 Key Mobile Interactions

### Product Quick-Add
- Tap product → Quick view modal
- Single tap "Ajouter" → Add to cart with haptic feedback
- Hold → Full product page

### Cart Drawer
- Swipe up from bottom → Cart preview
- Full cart page for detailed view
- Express checkout option

### Subscription Management
- Swipe to skip/pause
- One-tap product swap
- Push notifications for delivery reminders

## 10.4 PWA Considerations

- Service worker for offline access
- Push notifications for:
  - Delivery updates
  - Subscription reminders
  - Special offers
- Add to home screen prompt
- Background sync for cart

---

# Appendix A: Copy Guidelines

## Key Messages

### Value Proposition (Primary)
> "Des produits frais et bio, livrés de la ferme à votre table. Connaissez vos fermiers, soutenez l'agriculture locale."

### Trust Building
> "Traçabilité totale: suivez votre nourriture de la graine à votre assiette."

### Call to Action (Primary)
> "Commencer" / "Essayer maintenant" / "Découvrir nos fermes"

### Urgency (Seasonal)
> "Disponible cette semaine seulement" / "Dernières récoltes de la saison"

## Tone Examples

### Error Messages
- ❌ "Erreur 404"
- ✅ "Oups! Cette page semble avoir migré vers d'autres champs. Retournons à l'accueil."

### Empty States
- ❌ "Panier vide"
- ✅ "Votre panier attend les trésors de nos fermes. Commençons par découvrir nos produits de saison!"

### Success Messages
- ❌ "Commande confirmée"
- ✅ "Merci! Votre commande est en route vers nos fermes. Les fermiers préparent vos produits avec soin."

---

# Appendix B: Implementation Roadmap

## Phase 1: Brand & Homepage (Foundation)
- Brand identity implementation
- Homepage redesign with new sections
- Navigation restructure
- Trust bar and impact dashboard

## Phase 2: Subscription Experience
- Onboarding flow redesign
- Subscription dashboard enhancements
- Trial box flow optimization
- Flexibility features UI

## Phase 3: Farm Experience
- Farm profiles enhancement
- Farm stories content
- Farm directory redesign
- Farm ratings and reviews

## Phase 4: Shopping Experience
- Cart redesign
- Checkout optimization
- Order tracking improvements
- Rescue produce highlighting

## Phase 5: Engagement Features
- Loyalty program UI
- Referral program UI
- Impact dashboard personalization
- Quality feedback enhancements

## Phase 6: New Features
- Agritourism booking system
- Educational content hub
- Community events calendar
- Mobile PWA enhancements

---

**Document Version**: 1.0
**Last Updated**: December 2024
**Author**: Borgdanet Design Team

---

*Local food. Trusted farms. Shared abundance.*
*أكل بلدي. فلاحة موثوقة. خير مشترك.*
