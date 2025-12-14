# Phase 3: Farm Experience

> **Enhance farm profiles with storytelling, ratings, and improved discovery**

---

## Phase Overview

| Aspect | Details |
|--------|---------|
| **Priority** | High |
| **Dependencies** | Phase 1 (Brand & Homepage) |
| **Files to Create** | ~8 new files |
| **Files to Modify** | ~6 existing files |

---

## Step 1: Enhanced Farm Directory

### 1.1 Farms Directory Page

**File:** `frontend/src/app/farms/page.tsx` (update existing)

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { FarmCard } from '@/components/farm/FarmCard'
import { FarmFilters } from '@/components/farm/FarmFilters'

interface Farm {
  id: string
  name: string
  slug: string
  region: string
  description: string
  image: string | null
  rating: number
  reviewCount: number
  isVerified: boolean
  categories: string[]
  hasExperiences: boolean
}

const regions = [
  { id: 'all', label: 'Toutes les régions' },
  { id: 'CAP_BON', label: 'Cap Bon' },
  { id: 'SAHEL', label: 'Sahel' },
  { id: 'TUNIS_SUBURBS', label: 'Grand Tunis' },
  { id: 'NORTH', label: 'Nord' },
  { id: 'CENTRAL', label: 'Centre' },
  { id: 'SOUTH', label: 'Sud' },
]

const categories = [
  { id: 'all', label: 'Toutes catégories' },
  { id: 'vegetables', label: 'Légumes' },
  { id: 'fruits', label: 'Fruits' },
  { id: 'dairy', label: 'Produits laitiers' },
  { id: 'olive-oil', label: 'Huile d\'olive' },
  { id: 'honey', label: 'Miel' },
  { id: 'eggs', label: 'Oeufs' },
  { id: 'herbs', label: 'Herbes' },
]

export default function FarmsPage() {
  const searchParams = useSearchParams()
  const [farms, setFarms] = useState<Farm[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    region: searchParams.get('region') || 'all',
    category: searchParams.get('category') || 'all',
    search: searchParams.get('q') || '',
  })

  useEffect(() => {
    const fetchFarms = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (filters.region !== 'all') params.set('region', filters.region)
        if (filters.category !== 'all') params.set('category', filters.category)
        if (filters.search) params.set('search', filters.search)

        const response = await api.get(`/farms?${params.toString()}`)
        setFarms(response.data.farms || response.data)
      } catch (error) {
        console.error('Failed to fetch farms:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFarms()
  }, [filters])

  return (
    <main className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <section className="bg-brand-green text-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-4xl mb-4">
            Nos fermes partenaires
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            "45 familles d'agriculteurs, une même passion pour l'agriculture biologique et régénératrice"
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-brand-cream-dark sticky top-16 z-30">
        <div className="container mx-auto px-4 py-4">
          <FarmFilters
            filters={filters}
            onFilterChange={setFilters}
            regions={regions}
            categories={categories}
          />
        </div>
      </section>

      {/* Farm Grid */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg h-80 animate-pulse" />
              ))}
            </div>
          ) : farms.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🌱</div>
              <h2 className="font-display text-xl text-brand-green mb-2">
                Aucune ferme trouvée
              </h2>
              <p className="text-brand-brown mb-4">
                Essayez de modifier vos critères de recherche
              </p>
              <button
                onClick={() => setFilters({ region: 'all', category: 'all', search: '' })}
                className="text-brand-green font-medium hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {farms.map((farm) => (
                <FarmCard key={farm.id} farm={farm} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Become a Partner CTA */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-brand-cream rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">🌾</div>
            <h2 className="font-display text-2xl text-brand-green mb-2">
              Vous êtes agriculteur?
            </h2>
            <p className="text-brand-brown mb-6">
              Rejoignez notre réseau de fermes partenaires et vendez directement
              aux familles qui apprécient votre travail.
            </p>
            <Link
              href="/farmer/register"
              className="inline-flex px-6 py-3 bg-brand-green text-white rounded-lg font-semibold hover:bg-brand-green-dark transition-colors"
            >
              Devenir partenaire
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
```

### 1.2 Farm Filters Component

**File:** `frontend/src/components/farm/FarmFilters.tsx`

```tsx
interface FarmFiltersProps {
  filters: {
    region: string
    category: string
    search: string
  }
  onFilterChange: (filters: any) => void
  regions: { id: string; label: string }[]
  categories: { id: string; label: string }[]
}

export function FarmFilters({
  filters,
  onFilterChange,
  regions,
  categories,
}: FarmFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Search */}
      <div className="flex-1">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher une ferme..."
            value={filters.search}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-brown"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Region Filter */}
      <select
        value={filters.region}
        onChange={(e) => onFilterChange({ ...filters, region: e.target.value })}
        className="px-4 py-2 border border-brand-cream-dark rounded-lg bg-white focus:outline-none focus:border-brand-green"
      >
        {regions.map((region) => (
          <option key={region.id} value={region.id}>
            {region.label}
          </option>
        ))}
      </select>

      {/* Category Filter */}
      <select
        value={filters.category}
        onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
        className="px-4 py-2 border border-brand-cream-dark rounded-lg bg-white focus:outline-none focus:border-brand-green"
      >
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.label}
          </option>
        ))}
      </select>
    </div>
  )
}
```

### 1.3 Farm Card Component

**File:** `frontend/src/components/farm/FarmCard.tsx`

```tsx
import Image from 'next/image'
import Link from 'next/link'

interface FarmCardProps {
  farm: {
    id: string
    name: string
    slug: string
    region: string
    description: string
    image: string | null
    rating: number
    reviewCount: number
    isVerified: boolean
    categories?: string[]
    hasExperiences?: boolean
  }
}

export function FarmCard({ farm }: FarmCardProps) {
  return (
    <Link
      href={`/farms/${farm.slug}`}
      className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
    >
      {/* Farm Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={farm.image || '/images/placeholder-farm.jpg'}
          alt={farm.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {farm.isVerified && (
            <span className="bg-brand-green text-white text-xs px-2 py-1 rounded-full">
              ✓ Vérifié
            </span>
          )}
          {farm.hasExperiences && (
            <span className="bg-brand-gold text-white text-xs px-2 py-1 rounded-full">
              🌻 Visites
            </span>
          )}
        </div>
      </div>

      {/* Farm Info */}
      <div className="p-4">
        <h3 className="font-display text-lg text-brand-green mb-1 group-hover:text-brand-green-dark transition-colors">
          {farm.name}
        </h3>
        <p className="text-sm text-brand-brown mb-2 flex items-center">
          <span className="mr-1">📍</span>
          {farm.region.replace('_', ' ')}
        </p>
        <p className="text-sm text-brand-brown line-clamp-2 mb-3">
          {farm.description}
        </p>

        {/* Categories */}
        {farm.categories && farm.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {farm.categories.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="text-xs bg-brand-cream px-2 py-1 rounded text-brand-brown"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center text-sm">
          <span className="text-brand-gold">⭐ {farm.rating.toFixed(1)}</span>
          <span className="text-gray-400 ml-1">({farm.reviewCount} avis)</span>
        </div>
      </div>
    </Link>
  )
}
```

---

## Step 2: Enhanced Farm Profile Page

### 2.1 Farm Profile Page

**File:** `frontend/src/app/farms/[slug]/page.tsx` (update existing)

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { api } from '@/lib/api'
import { FarmStory } from '@/components/farm/FarmStory'
import { FarmProducts } from '@/components/farm/FarmProducts'
import { FarmPractices } from '@/components/farm/FarmPractices'
import { FarmExperiences } from '@/components/farm/FarmExperiences'
import { FarmReviews } from '@/components/farm/FarmReviews'

interface Farm {
  id: string
  name: string
  slug: string
  description: string
  region: string
  image: string | null
  rating: number
  reviewCount: number
  isVerified: boolean
  profile: {
    story: string
    storyAr?: string
    foundedYear: number
    farmerName: string
    farmerPhoto?: string
    farmSize: string
    certifications: string[]
    practices: string[]
    gallery: string[]
    quote?: string
  } | null
  products: any[]
  experiences: any[]
  reviews: any[]
}

type TabId = 'story' | 'products' | 'practices' | 'visits' | 'reviews'

export default function FarmProfilePage() {
  const params = useParams()
  const slug = params.slug as string

  const [farm, setFarm] = useState<Farm | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('story')

  useEffect(() => {
    const fetchFarm = async () => {
      try {
        const response = await api.get(`/farms/${slug}`)
        setFarm(response.data)
      } catch (error) {
        console.error('Failed to fetch farm:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchFarm()
  }, [slug])

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-cream">
        <div className="h-80 bg-brand-cream-dark animate-pulse" />
        <div className="container mx-auto px-4 -mt-20">
          <div className="bg-white rounded-lg p-8 animate-pulse">
            <div className="h-8 bg-brand-cream-dark rounded w-64 mb-4" />
            <div className="h-4 bg-brand-cream-dark rounded w-32" />
          </div>
        </div>
      </main>
    )
  }

  if (!farm) {
    return (
      <main className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🌾</div>
          <h1 className="font-display text-2xl text-brand-green mb-2">
            Ferme non trouvée
          </h1>
          <Link href="/farms" className="text-brand-green hover:underline">
            Retour aux fermes
          </Link>
        </div>
      </main>
    )
  }

  const tabs: { id: TabId; label: string; show: boolean }[] = [
    { id: 'story', label: 'Notre histoire', show: true },
    { id: 'products', label: 'Nos produits', show: farm.products.length > 0 },
    { id: 'practices', label: 'Nos pratiques', show: !!farm.profile?.practices?.length },
    { id: 'visits', label: 'Visites', show: farm.experiences.length > 0 },
    { id: 'reviews', label: `Avis (${farm.reviewCount})`, show: true },
  ]

  return (
    <main className="min-h-screen bg-brand-cream">
      {/* Hero Image */}
      <div className="relative h-80 md:h-96">
        <Image
          src={farm.image || '/images/placeholder-farm.jpg'}
          alt={farm.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Farm Info Card */}
      <div className="container mx-auto px-4 -mt-24 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Farmer Photo */}
            {farm.profile?.farmerPhoto && (
              <div className="flex-shrink-0">
                <Image
                  src={farm.profile.farmerPhoto}
                  alt={farm.profile.farmerName}
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-brand-cream"
                />
              </div>
            )}

            {/* Farm Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-display text-3xl text-brand-green mb-2">
                    {farm.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-brand-brown mb-3">
                    <span>📍 {farm.region.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>⭐ {farm.rating.toFixed(1)} ({farm.reviewCount} avis)</span>
                    {farm.profile?.foundedYear && (
                      <>
                        <span>•</span>
                        <span>Depuis {farm.profile.foundedYear}</span>
                      </>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {farm.isVerified && (
                      <span className="bg-brand-green text-white text-sm px-3 py-1 rounded-full">
                        🌱 Bio Certifié
                      </span>
                    )}
                    {farm.profile?.certifications?.map((cert) => (
                      <span
                        key={cert}
                        className="bg-brand-cream text-brand-green text-sm px-3 py-1 rounded-full"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="hidden md:flex gap-2">
                  <Link
                    href={`/farms/${slug}/products`}
                    className="px-4 py-2 bg-brand-green text-white rounded-lg font-medium hover:bg-brand-green-dark transition-colors"
                  >
                    Voir les produits
                  </Link>
                </div>
              </div>

              {/* Quote */}
              {farm.profile?.quote && (
                <blockquote className="text-lg text-brand-brown italic border-l-4 border-brand-gold pl-4">
                  "{farm.profile.quote}"
                </blockquote>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 mt-8">
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-brand-cream-dark overflow-x-auto">
            {tabs.filter(t => t.show).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-brand-green border-b-2 border-brand-green'
                    : 'text-brand-brown hover:text-brand-green'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {activeTab === 'story' && (
              <FarmStory
                story={farm.profile?.story || farm.description}
                farmerName={farm.profile?.farmerName}
                gallery={farm.profile?.gallery || []}
              />
            )}
            {activeTab === 'products' && (
              <FarmProducts products={farm.products} farmSlug={farm.slug} />
            )}
            {activeTab === 'practices' && (
              <FarmPractices practices={farm.profile?.practices || []} />
            )}
            {activeTab === 'visits' && (
              <FarmExperiences experiences={farm.experiences} />
            )}
            {activeTab === 'reviews' && (
              <FarmReviews farmId={farm.id} reviews={farm.reviews} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-brand-cream-dark p-4 md:hidden z-50">
        <Link
          href={`/farms/${slug}/products`}
          className="block w-full py-3 bg-brand-green text-white text-center rounded-lg font-semibold"
        >
          Voir les produits
        </Link>
      </div>
    </main>
  )
}
```

### 2.2 Farm Story Component

**File:** `frontend/src/components/farm/FarmStory.tsx`

```tsx
import Image from 'next/image'

interface FarmStoryProps {
  story: string
  farmerName?: string
  gallery: string[]
}

export function FarmStory({ story, farmerName, gallery }: FarmStoryProps) {
  return (
    <div>
      <h2 className="font-display text-2xl text-brand-green mb-6">
        Notre histoire
      </h2>

      {/* Story Text */}
      <div className="prose prose-lg max-w-none text-brand-brown mb-8">
        {story.split('\n\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      {/* Photo Gallery */}
      {gallery.length > 0 && (
        <div>
          <h3 className="font-semibold text-brand-green mb-4">
            La vie à la ferme
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {gallery.map((image, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={image}
                  alt={`${farmerName || 'Farm'} - Photo ${index + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
```

### 2.3 Farm Products Component

**File:** `frontend/src/components/farm/FarmProducts.tsx`

```tsx
'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'

interface Product {
  id: string
  name: string
  price: number
  unit: string
  image: string | null
  isInSeason: boolean
  isRescue: boolean
}

interface FarmProductsProps {
  products: Product[]
  farmSlug: string
}

export function FarmProducts({ products, farmSlug }: FarmProductsProps) {
  const { addItem } = useCartStore()

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      quantity: 1,
      image: product.image,
      farmId: farmSlug,
      farmName: '', // Will be filled from context
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-brand-green">
          Nos produits ({products.length})
        </h2>
        <Link
          href={`/shop?farm=${farmSlug}`}
          className="text-brand-green font-medium hover:underline"
        >
          Voir tout →
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.slice(0, 8).map((product) => (
          <div key={product.id} className="bg-brand-cream rounded-lg p-4">
            {/* Product Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
              <Image
                src={product.image || '/images/placeholder-product.jpg'}
                alt={product.name}
                fill
                className="object-cover"
              />
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.isInSeason && (
                  <span className="bg-brand-green text-white text-xs px-2 py-1 rounded">
                    Saison
                  </span>
                )}
                {product.isRescue && (
                  <span className="bg-brand-terracotta text-white text-xs px-2 py-1 rounded">
                    -30% Rescue
                  </span>
                )}
              </div>
            </div>

            {/* Product Info */}
            <h3 className="font-medium text-brand-green mb-1">{product.name}</h3>
            <p className="text-brand-brown text-sm mb-3">
              {product.price.toFixed(2)} TND / {product.unit}
            </p>

            {/* Add to Cart */}
            <button
              onClick={() => handleAddToCart(product)}
              className="w-full py-2 bg-brand-green text-white text-sm rounded-lg hover:bg-brand-green-dark transition-colors"
            >
              Ajouter
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 2.4 Farm Practices Component

**File:** `frontend/src/components/farm/FarmPractices.tsx`

```tsx
interface FarmPracticesProps {
  practices: string[]
}

const practiceIcons: Record<string, string> = {
  'Rotation des cultures': '🔄',
  'Compostage': '🍂',
  'Irrigation goutte-à-goutte': '💧',
  'Zéro pesticides': '🚫',
  'Semences paysannes': '🌱',
  'Agroforesterie': '🌳',
  'Énergie solaire': '☀️',
  'Permaculture': '🌿',
}

export function FarmPractices({ practices }: FarmPracticesProps) {
  return (
    <div>
      <h2 className="font-display text-2xl text-brand-green mb-6">
        Nos pratiques agricoles
      </h2>

      <div className="grid md:grid-cols-2 gap-4">
        {practices.map((practice, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 bg-brand-cream rounded-lg"
          >
            <span className="text-2xl">
              {practiceIcons[practice] || '✓'}
            </span>
            <div>
              <h3 className="font-medium text-brand-green">{practice}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-brand-green/5 rounded-lg border border-brand-green/20">
        <h3 className="font-semibold text-brand-green mb-2">
          🌍 Notre engagement régénératif
        </h3>
        <p className="text-brand-brown">
          Ces pratiques contribuent à régénérer les sols, préserver la biodiversité
          et réduire notre empreinte carbone. En choisissant nos produits, vous
          soutenez une agriculture qui nourrit les gens et la planète.
        </p>
      </div>
    </div>
  )
}
```

### 2.5 Farm Reviews Component

**File:** `frontend/src/components/farm/FarmReviews.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: {
    firstName: string
    lastName: string
  }
}

interface FarmReviewsProps {
  farmId: string
  reviews: Review[]
}

export function FarmReviews({ farmId, reviews: initialReviews }: FarmReviewsProps) {
  const { user } = useAuthStore()
  const [reviews, setReviews] = useState(initialReviews)
  const [showForm, setShowForm] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    try {
      const response = await api.post(`/farms/${farmId}/reviews`, newReview)
      setReviews([response.data, ...reviews])
      setShowForm(false)
      setNewReview({ rating: 5, comment: '' })
    } catch (error) {
      console.error('Failed to submit review:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl text-brand-green">
            Avis clients
          </h2>
          {reviews.length > 0 && (
            <p className="text-brand-brown">
              ⭐ {averageRating.toFixed(1)} basé sur {reviews.length} avis
            </p>
          )}
        </div>
        {user && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-brand-green text-white rounded-lg font-medium hover:bg-brand-green-dark transition-colors"
          >
            Écrire un avis
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-brand-cream rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-brand-green mb-4">Votre avis</h3>

          {/* Rating */}
          <div className="mb-4">
            <label className="block text-brand-brown mb-2">Note</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className={`text-2xl ${
                    star <= newReview.rating ? 'text-brand-gold' : 'text-gray-300'
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-brand-brown mb-2">Commentaire</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              rows={4}
              required
              className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
              placeholder="Partagez votre expérience avec cette ferme..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-brand-green text-white rounded-lg font-medium hover:bg-brand-green-dark transition-colors disabled:opacity-50"
            >
              {submitting ? 'Envoi...' : 'Publier'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-2 text-brand-brown hover:text-brand-green transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">💬</div>
          <p className="text-brand-brown">
            Aucun avis pour le moment. Soyez le premier à partager votre expérience!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-brand-cream-dark pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-brand-cream rounded-full flex items-center justify-center text-brand-green font-semibold">
                    {review.user.firstName[0]}{review.user.lastName[0]}
                  </div>
                  <div>
                    <div className="font-medium text-brand-green">
                      {review.user.firstName} {review.user.lastName[0]}.
                    </div>
                    <div className="text-xs text-brand-brown">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </div>
                <div className="text-brand-gold">
                  {'⭐'.repeat(review.rating)}
                </div>
              </div>
              <p className="text-brand-brown">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### 2.6 Export Farm Components

**File:** `frontend/src/components/farm/index.ts`

```typescript
export { FarmCard } from './FarmCard'
export { FarmFilters } from './FarmFilters'
export { FarmStory } from './FarmStory'
export { FarmProducts } from './FarmProducts'
export { FarmPractices } from './FarmPractices'
export { FarmReviews } from './FarmReviews'
```

---

## Step 3: Backend Farm Enhancements

### 3.1 Enhanced Farm Controller

**File:** `backend/src/controllers/farm.controller.ts` (add to existing)

```typescript
// Add these methods to existing controller

export const getFarmBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params

    const farm = await prisma.farm.findUnique({
      where: { slug },
      include: {
        profile: true,
        products: {
          where: { isActive: true },
          take: 12,
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          include: {
            user: {
              select: { firstName: true, lastName: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        experiences: {
          where: { available: true },
        },
      },
    })

    if (!farm) {
      return res.status(404).json({ error: 'Farm not found' })
    }

    // Calculate rating
    const avgRating = farm.reviews.length > 0
      ? farm.reviews.reduce((sum, r) => sum + r.rating, 0) / farm.reviews.length
      : 0

    res.json({
      ...farm,
      rating: avgRating,
      reviewCount: farm.reviews.length,
    })
  } catch (error) {
    console.error('Error fetching farm:', error)
    res.status(500).json({ error: 'Failed to fetch farm' })
  }
}

export const createFarmReview = async (req: Request, res: Response) => {
  try {
    const { farmId } = req.params
    const userId = req.user!.id
    const { rating, comment } = req.body

    // Check if user has ordered from this farm
    const hasOrdered = await prisma.orderItem.findFirst({
      where: {
        order: { userId },
        product: { farmId },
      },
    })

    if (!hasOrdered) {
      return res.status(400).json({
        error: 'You must have ordered from this farm to leave a review',
      })
    }

    // Check for existing review
    const existingReview = await prisma.review.findFirst({
      where: { farmId, userId },
    })

    if (existingReview) {
      return res.status(400).json({
        error: 'You have already reviewed this farm',
      })
    }

    const review = await prisma.review.create({
      data: {
        farmId,
        userId,
        rating,
        comment,
      },
      include: {
        user: {
          select: { firstName: true, lastName: true },
        },
      },
    })

    res.status(201).json(review)
  } catch (error) {
    console.error('Error creating review:', error)
    res.status(500).json({ error: 'Failed to create review' })
  }
}

export const getFarmsWithFilters = async (req: Request, res: Response) => {
  try {
    const { region, category, search, featured } = req.query

    const where: any = { isActive: true }

    if (region && region !== 'all') {
      where.region = region
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ]
    }

    if (featured === 'true') {
      where.isVerified = true
    }

    // Category filter requires join with products
    let categoryFilter = {}
    if (category && category !== 'all') {
      categoryFilter = {
        products: {
          some: {
            category: { slug: category },
          },
        },
      }
    }

    const farms = await prisma.farm.findMany({
      where: { ...where, ...categoryFilter },
      include: {
        _count: { select: { reviews: true } },
        reviews: { select: { rating: true } },
        products: {
          select: { category: { select: { slug: true, name: true } } },
          distinct: ['categoryId'],
        },
        experiences: {
          where: { available: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate ratings and format response
    const formattedFarms = farms.map((farm) => {
      const avgRating = farm.reviews.length > 0
        ? farm.reviews.reduce((sum, r) => sum + r.rating, 0) / farm.reviews.length
        : 0

      return {
        id: farm.id,
        name: farm.name,
        slug: farm.slug,
        description: farm.description,
        region: farm.region,
        image: farm.image,
        isVerified: farm.isVerified,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: farm._count.reviews,
        categories: [...new Set(farm.products.map((p) => p.category?.name).filter(Boolean))],
        hasExperiences: farm.experiences.length > 0,
      }
    })

    res.json({ farms: formattedFarms })
  } catch (error) {
    console.error('Error fetching farms:', error)
    res.status(500).json({ error: 'Failed to fetch farms' })
  }
}
```

### 3.2 Updated Farm Routes

**File:** `backend/src/routes/farm.routes.ts` (update existing)

```typescript
import { authMiddleware } from '../middleware/auth.middleware'
import {
  getFarmsWithFilters,
  getFarmBySlug,
  createFarmReview,
} from '../controllers/farm.controller'

router.get('/', getFarmsWithFilters)
router.get('/:slug', getFarmBySlug)
router.post('/:farmId/reviews', authMiddleware, createFarmReview)
```

---

## Step 4: Testing Checklist

### 4.1 Farm Directory
- [ ] Farms list loads correctly
- [ ] Region filter works
- [ ] Category filter works
- [ ] Search functionality works
- [ ] Empty state displays properly
- [ ] Farm cards show correct info
- [ ] Verified badge appears for verified farms
- [ ] Experiences badge shows when applicable

### 4.2 Farm Profile
- [ ] Profile page loads with all sections
- [ ] Tab navigation works
- [ ] Story section displays text and gallery
- [ ] Products section shows farm products
- [ ] Practices section displays farming methods
- [ ] Reviews section loads reviews
- [ ] Review submission works for authenticated users
- [ ] Star rating selection works
- [ ] Mobile action bar appears on mobile

### 4.3 API Endpoints
- [ ] GET /farms returns filtered results
- [ ] GET /farms/:slug returns full farm profile
- [ ] POST /farms/:farmId/reviews creates review

---

## Summary

Phase 3 enhances the farm experience with rich profiles, storytelling, and improved discovery.

**Files Created:** ~8
**Files Modified:** ~6
**New API Endpoints:** 3

**Next Phase:** [Phase 4: Shopping Experience](./04-PHASE-SHOPPING.md)
