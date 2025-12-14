# Phase 1: Brand & Homepage Foundation

> **Transform FarmBox identity into Borgdanet with a redesigned homepage**

---

## Phase Overview

| Aspect | Details |
|--------|---------|
| **Priority** | Critical - Must complete first |
| **Dependencies** | None |
| **Files to Create** | ~15 new files |
| **Files to Modify** | ~10 existing files |

---

## Step 1: Brand Configuration

### 1.1 Update Tailwind Configuration

**File:** `frontend/tailwind.config.ts`

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Borgdanet Brand Colors
        brand: {
          green: {
            DEFAULT: '#2D5A27',
            light: '#4A7C43',
            dark: '#1E3D1A',
          },
          gold: {
            DEFAULT: '#D4A84B',
            light: '#E5C77A',
            dark: '#B8923D',
          },
          brown: {
            DEFAULT: '#5C4033',
            light: '#7A5A4A',
            dark: '#3D2A22',
          },
          cream: {
            DEFAULT: '#FDF8F0',
            dark: '#F5EDE0',
          },
          terracotta: {
            DEFAULT: '#C75B39',
            light: '#D97B5C',
          },
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
        arabic: ['IBM Plex Sans Arabic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

### 1.2 Add Google Fonts

**File:** `frontend/src/app/layout.tsx`

Add to the `<head>` section:

```tsx
import { Playfair_Display, Inter } from 'next/font/google'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${playfair.variable} ${inter.variable}`}>
      <head>
        {/* Arabic font from Google Fonts CDN */}
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body">{children}</body>
    </html>
  )
}
```

### 1.3 Create Brand Assets Directory

```bash
mkdir -p frontend/public/images/brand
mkdir -p frontend/public/images/heroes
mkdir -p frontend/public/images/categories
mkdir -p frontend/public/images/icons
```

**Required Assets:**
- `logo.svg` - Main logo
- `logo-white.svg` - White version for dark backgrounds
- `favicon.ico` - Browser favicon
- `hero-spring.jpg` - Spring seasonal hero
- `hero-summer.jpg` - Summer seasonal hero
- `hero-autumn.jpg` - Autumn seasonal hero
- `hero-winter.jpg` - Winter seasonal hero

---

## Step 2: Create Brand Components

### 2.1 Logo Component

**File:** `frontend/src/components/brand/Logo.tsx`

```tsx
import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  variant?: 'default' | 'white'
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
}

const sizes = {
  sm: { width: 120, height: 40 },
  md: { width: 160, height: 53 },
  lg: { width: 200, height: 67 },
}

export function Logo({
  variant = 'default',
  size = 'md',
  showTagline = false
}: LogoProps) {
  const { width, height } = sizes[size]
  const logoSrc = variant === 'white'
    ? '/images/brand/logo-white.svg'
    : '/images/brand/logo.svg'

  return (
    <Link href="/" className="flex flex-col items-center">
      <Image
        src={logoSrc}
        alt="Borgdanet"
        width={width}
        height={height}
        priority
      />
      {showTagline && (
        <span className="text-xs text-brand-brown mt-1">
          Local food. Trusted farms. Shared abundance.
        </span>
      )}
    </Link>
  )
}
```

### 2.2 Tagline Component

**File:** `frontend/src/components/brand/Tagline.tsx`

```tsx
interface TaglineProps {
  variant?: 'default' | 'bilingual'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Tagline({
  variant = 'default',
  size = 'md',
  className = ''
}: TaglineProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <p className="text-brand-green font-medium">
        Local food. Trusted farms. Shared abundance.
      </p>
      {variant === 'bilingual' && (
        <p className="text-brand-brown font-arabic mt-1" dir="rtl">
          أكل بلدي. فلاحة موثوقة. خير مشترك.
        </p>
      )}
    </div>
  )
}
```

### 2.3 Trust Bar Component

**File:** `frontend/src/components/brand/TrustBar.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface TrustMetrics {
  farmCount: number
  deliveryCount: number
  averageRating: number
}

export function TrustBar() {
  const [metrics, setMetrics] = useState<TrustMetrics>({
    farmCount: 45,
    deliveryCount: 12000,
    averageRating: 4.9,
  })

  useEffect(() => {
    // Fetch real metrics from API
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/impact/metrics')
        setMetrics(response.data)
      } catch (error) {
        // Use defaults on error
      }
    }
    fetchMetrics()
  }, [])

  const items = [
    {
      icon: '🌱',
      value: `${metrics.farmCount}+`,
      label: 'Fermes partenaires',
    },
    {
      icon: '📦',
      value: `${metrics.deliveryCount.toLocaleString()}+`,
      label: 'Livraisons réussies',
    },
    {
      icon: '⭐',
      value: `${metrics.averageRating}/5`,
      label: 'Satisfaction client',
    },
    {
      icon: '🏆',
      value: 'Bio',
      label: 'Certifié',
    },
  ]

  return (
    <div className="bg-brand-cream py-4 border-y border-brand-cream-dark">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center md:justify-between items-center gap-4 md:gap-8">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-center md:text-left"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <span className="font-bold text-brand-green">{item.value}</span>
                <span className="text-brand-brown text-sm ml-1">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

### 2.4 Export Brand Components

**File:** `frontend/src/components/brand/index.ts`

```typescript
export { Logo } from './Logo'
export { Tagline } from './Tagline'
export { TrustBar } from './TrustBar'
```

---

## Step 3: Create Homepage Sections

### 3.1 Hero Section

**File:** `frontend/src/components/home/HeroSection.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Tagline } from '@/components/brand'

const seasonalHeroes = {
  spring: '/images/heroes/hero-spring.jpg',
  summer: '/images/heroes/hero-summer.jpg',
  autumn: '/images/heroes/hero-autumn.jpg',
  winter: '/images/heroes/hero-winter.jpg',
}

function getCurrentSeason(): keyof typeof seasonalHeroes {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  if (month >= 8 && month <= 10) return 'autumn'
  return 'winter'
}

export function HeroSection() {
  const [season] = useState(getCurrentSeason())

  return (
    <section className="relative h-[600px] md:h-[700px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={seasonalHeroes[season]}
          alt="Fermes tunisiennes"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
          {/* Tagline */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Local food. Trusted farms.
            <br />
            Shared abundance.
          </h1>

          {/* Arabic Tagline */}
          <p className="font-arabic text-2xl md:text-3xl mb-6 opacity-90" dir="rtl">
            أكل بلدي. فلاحة موثوقة. خير مشترك.
          </p>

          {/* Subheadline */}
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Des produits frais et bio, livrés de la ferme à votre table.
            <br />
            Connaissez vos fermiers, soutenez l'agriculture locale.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center px-8 py-4 bg-brand-green text-white font-semibold rounded-lg hover:bg-brand-green-dark transition-colors"
            >
              Commencer
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/farms"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/20 backdrop-blur text-white font-semibold rounded-lg hover:bg-white/30 transition-colors border border-white/40"
            >
              Découvrir les fermes
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
```

### 3.2 How It Works Section

**File:** `frontend/src/components/home/HowItWorks.tsx`

```tsx
import Link from 'next/link'

const steps = [
  {
    number: 1,
    icon: '📦',
    title: 'Choisissez votre formule',
    description: 'Box CSA hebdomadaire, box d\'essai à -25%, ou achat à la carte',
  },
  {
    number: 2,
    icon: '✨',
    title: 'Personnalisez vos produits',
    description: 'Sélectionnez selon vos goûts, allergies et la saison',
  },
  {
    number: 3,
    icon: '🚚',
    title: 'Recevez chez vous',
    description: 'Livraison gratuite dès 80 TND, fraîcheur garantie',
  },
]

export function HowItWorks() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl text-brand-green mb-4">
            Comment ça marche
          </h2>
          <p className="text-brand-brown text-lg max-w-2xl mx-auto">
            En 3 étapes simples, recevez le meilleur de nos fermes
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              {/* Step Number & Icon */}
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className="w-20 h-20 rounded-full bg-brand-cream flex items-center justify-center text-4xl">
                  {step.icon}
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-brand-green text-white text-sm font-bold flex items-center justify-center">
                  {step.number}
                </span>
              </div>

              {/* Content */}
              <h3 className="font-display text-xl text-brand-green mb-2">
                {step.title}
              </h3>
              <p className="text-brand-brown">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Link
            href="/get-started"
            className="inline-flex items-center justify-center px-8 py-4 bg-brand-green text-white font-semibold rounded-lg hover:bg-brand-green-dark transition-colors"
          >
            Commencer maintenant
            <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
```

### 3.3 Farm Showcase Carousel

**File:** `frontend/src/components/home/FarmCarousel.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/api'

interface Farm {
  id: string
  name: string
  slug: string
  region: string
  description: string
  image: string | null
  rating: number
  reviewCount: number
}

export function FarmCarousel() {
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const response = await api.get('/farms?featured=true&limit=8')
        setFarms(response.data.farms || response.data)
      } catch (error) {
        console.error('Failed to fetch farms:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFarms()
  }, [])

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-brand-cream">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-brand-cream-dark rounded w-64 mx-auto mb-12" />
            <div className="flex gap-6 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-72 h-80 bg-brand-cream-dark rounded-lg flex-shrink-0" />
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 md:py-24 bg-brand-cream">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl text-brand-green mb-4">
            Rencontrez nos fermiers
          </h2>
          <p className="text-brand-brown text-lg">
            "Derrière chaque produit, une famille"
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {farms.map((farm) => (
              <Link
                key={farm.id}
                href={`/farms/${farm.slug}`}
                className="flex-shrink-0 w-72 snap-start"
              >
                <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                  {/* Farm Image */}
                  <div className="relative h-48">
                    <Image
                      src={farm.image || '/images/placeholder-farm.jpg'}
                      alt={farm.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Farm Info */}
                  <div className="p-4">
                    <h3 className="font-display text-lg text-brand-green mb-1">
                      {farm.name}
                    </h3>
                    <p className="text-sm text-brand-brown mb-2">
                      📍 {farm.region}
                    </p>
                    <div className="flex items-center text-sm">
                      <span className="text-brand-gold">⭐ {farm.rating.toFixed(1)}</span>
                      <span className="text-gray-400 ml-1">({farm.reviewCount} avis)</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link
            href="/farms"
            className="inline-flex items-center text-brand-green font-semibold hover:text-brand-green-dark transition-colors"
          >
            Voir toutes les fermes
            <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
```

### 3.4 Category Grid

**File:** `frontend/src/components/home/CategoryGrid.tsx`

```tsx
import Image from 'next/image'
import Link from 'next/link'

const categories = [
  { slug: 'vegetables', name: 'Légumes', image: '/images/categories/vegetables.jpg' },
  { slug: 'fruits', name: 'Fruits', image: '/images/categories/fruits.jpg' },
  { slug: 'dairy', name: 'Produits Laitiers', image: '/images/categories/dairy.jpg' },
  { slug: 'olive-oil', name: 'Huile d\'Olive', image: '/images/categories/olive-oil.jpg' },
  { slug: 'eggs', name: 'Oeufs', image: '/images/categories/eggs.jpg' },
  { slug: 'honey', name: 'Miel', image: '/images/categories/honey.jpg' },
  { slug: 'herbs', name: 'Herbes & Aromates', image: '/images/categories/herbs.jpg' },
  { slug: 'prepared', name: 'Produits Préparés', image: '/images/categories/prepared.jpg' },
]

export function CategoryGrid() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl text-brand-green mb-4">
            Explorez nos produits
          </h2>
          <p className="text-brand-brown text-lg">
            Produits frais et de saison, directement des fermes
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group relative aspect-square rounded-lg overflow-hidden"
            >
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Category Name */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold text-lg">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
```

### 3.5 Subscription Options Section

**File:** `frontend/src/components/home/SubscriptionOptions.tsx`

```tsx
import Link from 'next/link'

const boxes = [
  {
    id: 'essentiel',
    name: 'Essentiel',
    price: 45,
    products: '6-8',
    serves: '2-3',
    includes: ['Légumes', 'Fruits'],
    deliveryFee: 5,
    popular: false,
  },
  {
    id: 'famille',
    name: 'Famille',
    price: 75,
    products: '12-15',
    serves: '4-5',
    includes: ['Légumes', 'Fruits', 'Oeufs', 'Herbes'],
    deliveryFee: 0,
    popular: true,
  },
  {
    id: 'gourmet',
    name: 'Gourmet',
    price: 120,
    products: '18-20',
    serves: '5-6',
    includes: ['Tout inclus', 'Produits premium'],
    deliveryFee: 0,
    popular: false,
  },
]

export function SubscriptionOptions() {
  return (
    <section className="py-16 md:py-24 bg-brand-cream">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl text-brand-green mb-4">
            Nos formules d'abonnement
          </h2>
          <p className="text-brand-brown text-lg">
            "Recevez le meilleur de nos fermes chaque semaine"
          </p>
        </div>

        {/* Box Options */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
          {boxes.map((box) => (
            <div
              key={box.id}
              className={`relative bg-white rounded-lg p-6 shadow-md ${
                box.popular ? 'ring-2 ring-brand-green' : ''
              }`}
            >
              {/* Popular Badge */}
              {box.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-brand-green text-white text-xs font-semibold px-3 py-1 rounded-full">
                    ⭐ Populaire
                  </span>
                </div>
              )}

              {/* Box Name */}
              <h3 className="font-display text-2xl text-brand-green text-center mb-2">
                {box.name}
              </h3>

              {/* Price */}
              <div className="text-center mb-6">
                <span className="text-3xl font-bold text-brand-green">{box.price}</span>
                <span className="text-brand-brown"> TND/sem</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-brand-brown">
                  <span className="mr-2">📦</span>
                  {box.products} produits
                </li>
                <li className="flex items-center text-brand-brown">
                  <span className="mr-2">👨‍👩‍👧‍👦</span>
                  {box.serves} personnes
                </li>
                <li className="flex items-center text-brand-brown">
                  <span className="mr-2">🌱</span>
                  {box.includes.join(' + ')}
                </li>
                <li className="flex items-center text-brand-brown">
                  <span className="mr-2">🚚</span>
                  {box.deliveryFee === 0 ? (
                    <span className="text-brand-green font-semibold">Livraison offerte</span>
                  ) : (
                    `Livraison: ${box.deliveryFee} TND`
                  )}
                </li>
              </ul>

              {/* CTA */}
              <Link
                href={`/get-started?box=${box.id}`}
                className={`block text-center py-3 rounded-lg font-semibold transition-colors ${
                  box.popular
                    ? 'bg-brand-green text-white hover:bg-brand-green-dark'
                    : 'bg-brand-cream text-brand-green hover:bg-brand-cream-dark'
                }`}
              >
                Choisir
              </Link>
            </div>
          ))}
        </div>

        {/* Trial Box Banner */}
        <div className="max-w-3xl mx-auto bg-brand-gold/20 border border-brand-gold rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-2xl mr-2">🎁</span>
              <span className="font-semibold text-brand-green text-lg">
                Box d'Essai - Première livraison à -25%
              </span>
              <p className="text-brand-brown mt-1">
                Découvrez Borgdanet sans engagement
              </p>
            </div>
            <Link
              href="/get-started?trial=true"
              className="whitespace-nowrap px-6 py-3 bg-brand-gold text-white font-semibold rounded-lg hover:bg-brand-gold-dark transition-colors"
            >
              Essayer maintenant
            </Link>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-brand-brown">
          <span>✓ Modifiez ou pausez à tout moment</span>
          <span>✓ Sans engagement</span>
          <span>✓ Satisfaction garantie 100%</span>
          <span>✓ Livraison flexible</span>
        </div>
      </div>
    </section>
  )
}
```

### 3.6 Standards Section

**File:** `frontend/src/components/home/StandardsSection.tsx`

```tsx
const standards = [
  {
    icon: '🌱',
    title: '100% Bio Certifié',
    description: 'Tous nos produits sont certifiés bio ou en conversion',
  },
  {
    icon: '🔍',
    title: 'Traçabilité Totale',
    description: 'Suivez votre nourriture de la graine à l\'assiette',
  },
  {
    icon: '🤝',
    title: 'Prix Justes aux Fermiers',
    description: 'Nos fermiers reçoivent 70%+ du prix final',
  },
  {
    icon: '🌍',
    title: 'Agriculture Régénératrice',
    description: 'Pratiques qui régénèrent sols et biodiversité',
  },
]

export function StandardsSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl text-brand-green mb-4">
            Nos engagements
          </h2>
        </div>

        {/* Standards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {standards.map((standard, index) => (
            <div key={index} className="text-center">
              <div className="w-20 h-20 rounded-full bg-brand-cream flex items-center justify-center text-4xl mx-auto mb-4">
                {standard.icon}
              </div>
              <h3 className="font-display text-xl text-brand-green mb-2">
                {standard.title}
              </h3>
              <p className="text-brand-brown">
                {standard.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

### 3.7 Impact Dashboard Section

**File:** `frontend/src/components/home/ImpactDashboard.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

interface ImpactMetrics {
  farmCount: number
  familiesServed: number
  foodSavedKg: number
  co2AvoidedTons: number
  weeklyHighlight: {
    families: number
    revenue: number
  }
}

export function ImpactDashboard() {
  const [metrics, setMetrics] = useState<ImpactMetrics>({
    farmCount: 45,
    familiesServed: 12500,
    foodSavedKg: 850,
    co2AvoidedTons: 15,
    weeklyHighlight: {
      families: 245,
      revenue: 890,
    },
  })

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/impact/dashboard')
        setMetrics(response.data)
      } catch (error) {
        // Use defaults
      }
    }
    fetchMetrics()
  }, [])

  const stats = [
    { value: `${metrics.farmCount}+`, label: 'Fermes partenaires' },
    { value: metrics.familiesServed.toLocaleString(), label: 'Familles servies' },
    { value: `${metrics.foodSavedKg}kg`, label: 'Nourriture sauvée' },
    { value: `${metrics.co2AvoidedTons}T`, label: 'CO2 évité' },
  ]

  return (
    <section className="py-16 md:py-24 bg-brand-green text-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl mb-4">
            Notre impact collectif
          </h2>
          <p className="text-white/80 text-lg">
            "Ensemble, nous changeons le système alimentaire"
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1">
                {stat.value}
              </div>
              <div className="text-white/70 text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Highlight */}
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur rounded-lg p-4 text-center">
          <span className="text-brand-gold">💚</span>
          <span className="ml-2">
            Cette semaine: {metrics.weeklyHighlight.families} familles ont reçu leur box,
            représentant {metrics.weeklyHighlight.revenue} TND versés directement aux fermes
          </span>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link
            href="/about/impact"
            className="inline-flex items-center text-white font-semibold hover:text-brand-gold transition-colors"
          >
            Voir notre rapport d'impact
            <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
```

### 3.8 FAQ Section

**File:** `frontend/src/components/home/FAQSection.tsx`

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

const faqs = [
  {
    question: 'Comment fonctionne la livraison?',
    answer: 'Nous livrons dans 3 zones autour de Tunis. Zone A (centre): gratuit dès 80 TND. Zone B (banlieue): gratuit dès 120 TND. Zone C (périphérie): gratuit dès 150 TND. Choisissez votre créneau: matin (6h-9h) ou soir (18h-21h).',
  },
  {
    question: 'Puis-je personnaliser ma box?',
    answer: 'Oui! Vous pouvez échanger jusqu\'à 3 produits par livraison. Indiquez aussi vos préférences alimentaires et allergies, nous adaptons automatiquement votre sélection.',
  },
  {
    question: 'D\'où viennent vos produits?',
    answer: 'Tous nos produits viennent de fermes tunisiennes partenaires, 100% bio ou en conversion. Chaque produit affiche sa ferme d\'origine pour une traçabilité totale.',
  },
  {
    question: 'Comment annuler ou pauser mon abonnement?',
    answer: 'En 2 clics depuis votre tableau de bord. Vous pouvez pauser jusqu\'à 4 fois par an (1-4 semaines) ou annuler à tout moment sans frais.',
  },
  {
    question: 'Que faire si un produit ne me plaît pas?',
    answer: 'Notre garantie satisfaction s\'applique: contactez-nous dans les 24h et nous vous offrons un crédit ou remplacement. Votre satisfaction est notre priorité.',
  },
  {
    question: 'Vos produits sont-ils vraiment bio?',
    answer: 'Oui, tous nos partenaires sont certifiés bio ou en conversion (processus de 3 ans). Nous auditons régulièrement leurs pratiques.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl text-brand-green mb-4">
            Questions fréquentes
          </h2>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-brand-cream-dark rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left bg-brand-cream hover:bg-brand-cream-dark transition-colors"
              >
                <span className="font-semibold text-brand-green">
                  {faq.question}
                </span>
                <svg
                  className={`w-5 h-5 text-brand-green transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === index && (
                <div className="p-4 bg-white text-brand-brown">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link
            href="/faq"
            className="inline-flex items-center text-brand-green font-semibold hover:text-brand-green-dark transition-colors"
          >
            Voir toutes les questions
            <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
```

### 3.9 Export Home Components

**File:** `frontend/src/components/home/index.ts`

```typescript
export { HeroSection } from './HeroSection'
export { HowItWorks } from './HowItWorks'
export { FarmCarousel } from './FarmCarousel'
export { CategoryGrid } from './CategoryGrid'
export { SubscriptionOptions } from './SubscriptionOptions'
export { StandardsSection } from './StandardsSection'
export { ImpactDashboard } from './ImpactDashboard'
export { FAQSection } from './FAQSection'
```

---

## Step 4: Update Navigation Header

### 4.1 Redesigned Header

**File:** `frontend/src/components/layout/Header.tsx`

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import { Logo } from '@/components/brand'

const navItems = [
  { href: '/shop', label: 'Découvrir' },
  { href: '/farms', label: 'Nos Fermes' },
  { href: '/get-started', label: 'S\'abonner' },
  { href: '/about', label: 'À Propos' },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const { getItemCount } = useCartStore()
  const cartCount = getItemCount()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-brand-cream-dark">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-brand-green"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Logo */}
          <Logo size="sm" />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-brand-brown hover:text-brand-green font-medium transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button className="p-2 text-brand-brown hover:text-brand-green transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-brand-brown hover:text-brand-green transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-green text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div className="relative group">
                <button className="p-2 text-brand-brown hover:text-brand-green transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
                {/* Dropdown */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-brand-cream-dark opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link href="/dashboard" className="block px-4 py-2 text-brand-brown hover:bg-brand-cream">
                    Mon compte
                  </Link>
                  <Link href="/dashboard/orders" className="block px-4 py-2 text-brand-brown hover:bg-brand-cream">
                    Mes commandes
                  </Link>
                  <Link href="/dashboard/subscriptions" className="block px-4 py-2 text-brand-brown hover:bg-brand-cream">
                    Mes abonnements
                  </Link>
                  <hr className="border-brand-cream-dark" />
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-brand-brown hover:bg-brand-cream"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden md:inline-flex px-4 py-2 text-brand-green border border-brand-green rounded-lg hover:bg-brand-green hover:text-white transition-colors"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-brand-cream-dark">
          <nav className="container mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-brand-brown hover:text-brand-green font-medium"
              >
                {item.label}
              </Link>
            ))}
            {!user && (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-brand-green font-medium"
              >
                Connexion
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
```

---

## Step 5: Assemble Homepage

### 5.1 Updated Homepage

**File:** `frontend/src/app/page.tsx`

```tsx
import { TrustBar } from '@/components/brand'
import {
  HeroSection,
  HowItWorks,
  FarmCarousel,
  CategoryGrid,
  SubscriptionOptions,
  StandardsSection,
  ImpactDashboard,
  FAQSection,
} from '@/components/home'

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <HeroSection />

      {/* Trust Bar */}
      <TrustBar />

      {/* How It Works */}
      <HowItWorks />

      {/* Farm Showcase */}
      <FarmCarousel />

      {/* Product Categories */}
      <CategoryGrid />

      {/* Subscription Options */}
      <SubscriptionOptions />

      {/* Standards & Values */}
      <StandardsSection />

      {/* Impact Dashboard */}
      <ImpactDashboard />

      {/* FAQ */}
      <FAQSection />
    </main>
  )
}
```

---

## Step 6: Backend API Endpoints

### 6.1 Impact Metrics Endpoint

**File:** `backend/src/controllers/impact.controller.ts`

```typescript
import { Request, Response } from 'express'
import { prisma } from '../config/database'

export const getImpactMetrics = async (req: Request, res: Response) => {
  try {
    // Get farm count
    const farmCount = await prisma.farm.count({
      where: { isVerified: true },
    })

    // Get unique customers with orders
    const familiesServed = await prisma.user.count({
      where: {
        role: 'CUSTOMER',
        orders: { some: {} },
      },
    })

    // Get food saved from rescue produce
    const rescueData = await prisma.rescuedProduce.aggregate({
      _sum: { originalQuantity: true },
    })
    const foodSavedKg = rescueData._sum.originalQuantity || 0

    // Get impact metrics
    const impactMetrics = await prisma.impactMetrics.findFirst({
      orderBy: { createdAt: 'desc' },
    })

    // Get weekly stats
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const weeklyOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: oneWeekAgo },
        status: { in: ['DELIVERED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'] },
      },
      select: {
        userId: true,
        totalAmount: true,
      },
    })

    const weeklyFamilies = new Set(weeklyOrders.map((o) => o.userId)).size
    const weeklyRevenue = weeklyOrders.reduce(
      (sum, o) => sum + Number(o.totalAmount),
      0
    )

    res.json({
      farmCount,
      familiesServed,
      foodSavedKg: Math.round(foodSavedKg),
      co2AvoidedTons: impactMetrics?.co2Avoided || 15,
      weeklyHighlight: {
        families: weeklyFamilies,
        revenue: Math.round(weeklyRevenue),
      },
    })
  } catch (error) {
    console.error('Error fetching impact metrics:', error)
    res.status(500).json({ error: 'Failed to fetch impact metrics' })
  }
}

export const getTrustMetrics = async (req: Request, res: Response) => {
  try {
    const farmCount = await prisma.farm.count({ where: { isVerified: true } })

    const deliveryCount = await prisma.order.count({
      where: { status: 'DELIVERED' },
    })

    const reviewStats = await prisma.review.aggregate({
      _avg: { rating: true },
    })

    res.json({
      farmCount,
      deliveryCount,
      averageRating: reviewStats._avg.rating || 4.9,
    })
  } catch (error) {
    console.error('Error fetching trust metrics:', error)
    res.status(500).json({ error: 'Failed to fetch trust metrics' })
  }
}
```

### 6.2 Impact Routes

**File:** `backend/src/routes/impact.routes.ts`

```typescript
import { Router } from 'express'
import { getImpactMetrics, getTrustMetrics } from '../controllers/impact.controller'

const router = Router()

router.get('/metrics', getTrustMetrics)
router.get('/dashboard', getImpactMetrics)

export default router
```

### 6.3 Register Routes

**File:** `backend/src/routes/index.ts` (add to existing)

```typescript
import impactRoutes from './impact.routes'

// Add with other route registrations
router.use('/impact', impactRoutes)
```

---

## Step 7: Testing Checklist

### 7.1 Visual Testing
- [ ] Logo displays correctly at all sizes
- [ ] Brand colors applied consistently
- [ ] Fonts load properly (including Arabic)
- [ ] Hero image changes with season
- [ ] All sections render on mobile
- [ ] Navigation dropdown works

### 7.2 Functional Testing
- [ ] Trust bar metrics load from API
- [ ] Farm carousel fetches real data
- [ ] Category links navigate correctly
- [ ] Subscription CTAs link to /get-started
- [ ] FAQ accordion expands/collapses
- [ ] Cart badge updates correctly

### 7.3 Performance Testing
- [ ] Lighthouse score > 80
- [ ] Images lazy-loaded
- [ ] No layout shift on load
- [ ] Fonts don't cause FOUT

---

## Step 8: Deployment Notes

### 8.1 Environment Variables
No new environment variables required for Phase 1.

### 8.2 Database Changes
No schema changes required for Phase 1.

### 8.3 Asset Requirements
Ensure the following images are added:
- `/public/images/brand/logo.svg`
- `/public/images/brand/logo-white.svg`
- `/public/images/heroes/hero-spring.jpg`
- `/public/images/heroes/hero-summer.jpg`
- `/public/images/heroes/hero-autumn.jpg`
- `/public/images/heroes/hero-winter.jpg`
- `/public/images/categories/*.jpg` (8 category images)

---

## Summary

Phase 1 establishes the Borgdanet brand identity and transforms the homepage into an engaging, conversion-focused landing page.

**Files Created:** ~15
**Files Modified:** ~10
**New API Endpoints:** 2

**Next Phase:** [Phase 2: Subscription Experience](./02-PHASE-SUBSCRIPTION.md)
