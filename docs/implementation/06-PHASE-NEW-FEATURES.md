# Phase 6: New Features & PWA

> **Agritourism booking, educational content hub, community events, and PWA implementation**

---

## Phase Overview

| Aspect | Details |
|--------|---------|
| **Priority** | Medium |
| **Dependencies** | Phase 1 (Brand), Phase 3 (Farms) |
| **Files to Create** | ~20 new files |
| **Files to Modify** | ~10 existing files |

---

## Step 1: Agritourism Booking System

### 1.1 Experience Listing Page

**File:** `frontend/src/app/experiences/page.tsx` (create)

```tsx
import { Metadata } from 'next'
import { ExperienceGrid } from '@/components/experiences/ExperienceGrid'
import { ExperienceFilters } from '@/components/experiences/ExperienceFilters'

export const metadata: Metadata = {
  title: 'Expériences à la ferme - Borgdanet',
  description: 'Découvrez nos fermes tunisiennes avec des visites, ateliers et séjours authentiques',
}

export default function ExperiencesPage() {
  return (
    <main className="min-h-screen bg-brand-cream py-8">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl text-brand-green mb-4">
            Expériences à la ferme
          </h1>
          <p className="text-xl text-brand-brown max-w-2xl mx-auto">
            Visitez nos fermes partenaires, participez à des ateliers et reconnectez-vous
            avec la terre et ceux qui la cultivent.
          </p>
        </div>

        {/* Experience Types */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <ExperienceTypeCard
            icon="🌻"
            title="Visites découverte"
            description="2-3h de visite guidée avec dégustation"
            priceRange="25-45 TND"
          />
          <ExperienceTypeCard
            icon="🌾"
            title="Journée à la ferme"
            description="Immersion complète avec repas inclus"
            priceRange="60-100 TND"
          />
          <ExperienceTypeCard
            icon="🧑‍🌾"
            title="Ateliers pratiques"
            description="Apprenez les gestes des fermiers"
            priceRange="40-70 TND"
          />
          <ExperienceTypeCard
            icon="🏡"
            title="Séjours fermiers"
            description="1-2 nuits en immersion totale"
            priceRange="150-300 TND"
          />
        </div>

        {/* Filters and Grid */}
        <div className="grid lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <ExperienceFilters />
          </aside>
          <div className="lg:col-span-3">
            <ExperienceGrid />
          </div>
        </div>
      </div>
    </main>
  )
}

function ExperienceTypeCard({
  icon,
  title,
  description,
  priceRange,
}: {
  icon: string
  title: string
  description: string
  priceRange: string
}) {
  return (
    <div className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
      <span className="text-4xl mb-3 block">{icon}</span>
      <h3 className="font-semibold text-brand-green mb-2">{title}</h3>
      <p className="text-sm text-brand-brown mb-2">{description}</p>
      <p className="text-sm font-medium text-brand-gold">{priceRange}</p>
    </div>
  )
}
```

### 1.2 Experience Card Component

**File:** `frontend/src/components/experiences/ExperienceCard.tsx` (create)

```tsx
import Link from 'next/link'
import Image from 'next/image'

interface Experience {
  id: string
  title: string
  farmName: string
  farmSlug: string
  type: 'VISIT' | 'FULL_DAY' | 'WORKSHOP' | 'STAY'
  duration: number // minutes
  price: number
  image: string
  region: string
  rating: number
  reviewCount: number
}

interface ExperienceCardProps {
  experience: Experience
}

const typeLabels = {
  VISIT: { label: 'Visite', icon: '🌻' },
  FULL_DAY: { label: 'Journée', icon: '🌾' },
  WORKSHOP: { label: 'Atelier', icon: '🧑‍🌾' },
  STAY: { label: 'Séjour', icon: '🏡' },
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h${mins}`
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  const type = typeLabels[experience.type]

  return (
    <Link
      href={`/experiences/${experience.id}`}
      className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={experience.image || '/images/placeholder-farm.jpg'}
          alt={experience.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 px-3 py-1 rounded-full text-sm font-medium text-brand-green">
            {type.icon} {type.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-brand-green mb-1 group-hover:text-brand-green-dark transition-colors">
          {experience.title}
        </h3>
        <p className="text-sm text-brand-brown mb-2">
          {experience.farmName} • {experience.region}
        </p>

        <div className="flex items-center gap-4 text-sm text-brand-brown mb-3">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDuration(experience.duration)}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4 text-brand-gold" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {experience.rating} ({experience.reviewCount})
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-brand-green">
            {experience.price} TND
          </span>
          <span className="text-sm text-brand-brown">/personne</span>
        </div>
      </div>
    </Link>
  )
}
```

### 1.3 Experience Grid Component

**File:** `frontend/src/components/experiences/ExperienceGrid.tsx` (create)

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import api from '@/lib/api'
import { ExperienceCard } from './ExperienceCard'

interface Experience {
  id: string
  title: string
  farmName: string
  farmSlug: string
  type: 'VISIT' | 'FULL_DAY' | 'WORKSHOP' | 'STAY'
  duration: number
  price: number
  image: string
  region: string
  rating: number
  reviewCount: number
}

export function ExperienceGrid() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()

  useEffect(() => {
    fetchExperiences()
  }, [searchParams])

  const fetchExperiences = async () => {
    try {
      const params = new URLSearchParams()
      const type = searchParams.get('type')
      const region = searchParams.get('region')
      const priceMax = searchParams.get('priceMax')

      if (type) params.set('type', type)
      if (region) params.set('region', region)
      if (priceMax) params.set('priceMax', priceMax)

      const response = await api.get(`/experiences?${params.toString()}`)
      setExperiences(response.data.data)
    } catch (error) {
      console.error('Failed to fetch experiences:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-[4/3] bg-brand-cream rounded-t-xl" />
            <div className="bg-white rounded-b-xl p-4 space-y-2">
              <div className="h-5 bg-brand-cream rounded w-3/4" />
              <div className="h-4 bg-brand-cream rounded w-1/2" />
              <div className="h-4 bg-brand-cream rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (experiences.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl">
        <p className="text-brand-brown">Aucune expérience trouvée.</p>
        <p className="text-sm text-brand-brown mt-2">
          Essayez de modifier vos filtres.
        </p>
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {experiences.map((experience) => (
        <ExperienceCard key={experience.id} experience={experience} />
      ))}
    </div>
  )
}
```

### 1.4 Experience Filters Component

**File:** `frontend/src/components/experiences/ExperienceFilters.tsx` (create)

```tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const experienceTypes = [
  { value: 'VISIT', label: 'Visite découverte' },
  { value: 'FULL_DAY', label: 'Journée complète' },
  { value: 'WORKSHOP', label: 'Atelier pratique' },
  { value: 'STAY', label: 'Séjour' },
]

const regions = [
  'Cap Bon',
  'Tunis',
  'Zaghouan',
  'Bizerte',
  'Sfax',
  'Sousse',
  'Nabeul',
  'Jendouba',
]

const priceRanges = [
  { value: '50', label: 'Moins de 50 TND' },
  { value: '100', label: 'Moins de 100 TND' },
  { value: '200', label: 'Moins de 200 TND' },
]

export function ExperienceFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/experiences?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/experiences')
  }

  const activeType = searchParams.get('type')
  const activeRegion = searchParams.get('region')
  const activePriceMax = searchParams.get('priceMax')

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-brand-green">Filtres</h3>
        {(activeType || activeRegion || activePriceMax) && (
          <button
            onClick={clearFilters}
            className="text-sm text-brand-brown hover:text-brand-green"
          >
            Effacer
          </button>
        )}
      </div>

      {/* Type Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-brand-brown mb-2">
          Type d'expérience
        </h4>
        <div className="space-y-2">
          {experienceTypes.map((type) => (
            <label
              key={type.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="type"
                checked={activeType === type.value}
                onChange={() => updateFilter('type', type.value)}
                className="text-brand-green focus:ring-brand-green"
              />
              <span className="text-sm text-brand-brown">{type.label}</span>
            </label>
          ))}
          {activeType && (
            <button
              onClick={() => updateFilter('type', null)}
              className="text-xs text-brand-green hover:underline"
            >
              Tous les types
            </button>
          )}
        </div>
      </div>

      {/* Region Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-brand-brown mb-2">Région</h4>
        <select
          value={activeRegion || ''}
          onChange={(e) => updateFilter('region', e.target.value || null)}
          className="w-full px-3 py-2 border border-brand-cream rounded-lg text-sm"
        >
          <option value="">Toutes les régions</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </div>

      {/* Price Filter */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-brand-brown mb-2">
          Budget max
        </h4>
        <div className="space-y-2">
          {priceRanges.map((range) => (
            <label
              key={range.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="priceMax"
                checked={activePriceMax === range.value}
                onChange={() => updateFilter('priceMax', range.value)}
                className="text-brand-green focus:ring-brand-green"
              />
              <span className="text-sm text-brand-brown">{range.label}</span>
            </label>
          ))}
          {activePriceMax && (
            <button
              onClick={() => updateFilter('priceMax', null)}
              className="text-xs text-brand-green hover:underline"
            >
              Tous les prix
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

### 1.5 Experience Detail Page

**File:** `frontend/src/app/experiences/[id]/page.tsx` (create)

```tsx
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ExperienceBookingForm } from '@/components/experiences/ExperienceBookingForm'

interface PageProps {
  params: { id: string }
}

async function getExperience(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/experiences/${id}`, {
    cache: 'no-store',
  })
  if (!res.ok) return null
  const data = await res.json()
  return data.data
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const experience = await getExperience(params.id)
  if (!experience) return { title: 'Expérience non trouvée' }

  return {
    title: `${experience.title} - Borgdanet`,
    description: experience.description,
  }
}

export default async function ExperienceDetailPage({ params }: PageProps) {
  const experience = await getExperience(params.id)

  if (!experience) {
    notFound()
  }

  const typeLabels = {
    VISIT: 'Visite découverte',
    FULL_DAY: 'Journée complète',
    WORKSHOP: 'Atelier pratique',
    STAY: 'Séjour',
  }

  return (
    <main className="min-h-screen bg-brand-cream py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link href="/experiences" className="text-brand-brown hover:text-brand-green">
            Expériences
          </Link>
          <span className="mx-2 text-brand-brown">/</span>
          <span className="text-brand-green">{experience.title}</span>
        </nav>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Image */}
            <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
              <Image
                src={experience.images[0] || '/images/placeholder-farm.jpg'}
                alt={experience.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Gallery */}
            {experience.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {experience.images.slice(1, 5).map((image: string, index: number) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src={image}
                      alt={`${experience.title} ${index + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Details */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block bg-brand-cream text-brand-green px-3 py-1 rounded-full text-sm font-medium mb-2">
                    {typeLabels[experience.type as keyof typeof typeLabels]}
                  </span>
                  <h1 className="font-display text-3xl text-brand-green">
                    {experience.title}
                  </h1>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-brand-green">{experience.price} TND</p>
                  <p className="text-sm text-brand-brown">par personne</p>
                </div>
              </div>

              {/* Farm Link */}
              <Link
                href={`/farms/${experience.farm.slug}`}
                className="flex items-center gap-3 p-4 bg-brand-cream rounded-lg mb-6 hover:bg-brand-cream-dark transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl">
                  🌱
                </div>
                <div>
                  <p className="font-medium text-brand-green">{experience.farm.name}</p>
                  <p className="text-sm text-brand-brown">{experience.farm.region}</p>
                </div>
              </Link>

              {/* Quick Info */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-brand-cream rounded-lg">
                  <p className="text-2xl mb-1">⏱️</p>
                  <p className="text-sm text-brand-brown">Durée</p>
                  <p className="font-medium text-brand-green">
                    {experience.duration >= 60
                      ? `${Math.floor(experience.duration / 60)}h${experience.duration % 60 || ''}`
                      : `${experience.duration} min`}
                  </p>
                </div>
                <div className="text-center p-3 bg-brand-cream rounded-lg">
                  <p className="text-2xl mb-1">👥</p>
                  <p className="text-sm text-brand-brown">Participants</p>
                  <p className="font-medium text-brand-green">Max {experience.maxGuests}</p>
                </div>
                <div className="text-center p-3 bg-brand-cream rounded-lg">
                  <p className="text-2xl mb-1">⭐</p>
                  <p className="text-sm text-brand-brown">Note</p>
                  <p className="font-medium text-brand-green">
                    {experience.rating} ({experience.reviewCount})
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="prose prose-green max-w-none">
                <h2 className="font-display text-xl text-brand-green mb-3">Description</h2>
                <p className="text-brand-brown whitespace-pre-line">{experience.description}</p>
              </div>

              {/* What's Included */}
              {experience.includes && experience.includes.length > 0 && (
                <div className="mt-6">
                  <h2 className="font-display text-xl text-brand-green mb-3">Ce qui est inclus</h2>
                  <ul className="space-y-2">
                    {experience.includes.map((item: string, index: number) => (
                      <li key={index} className="flex items-center gap-2 text-brand-brown">
                        <span className="text-brand-green">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <ExperienceBookingForm
                experienceId={experience.id}
                price={experience.price}
                maxGuests={experience.maxGuests}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
```

### 1.6 Experience Booking Form

**File:** `frontend/src/components/experiences/ExperienceBookingForm.tsx` (create)

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'

interface ExperienceBookingFormProps {
  experienceId: string
  price: number
  maxGuests: number
}

export function ExperienceBookingForm({
  experienceId,
  price,
  maxGuests,
}: ExperienceBookingFormProps) {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()

  const [date, setDate] = useState('')
  const [guests, setGuests] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totalPrice = price * guests

  // Get minimum date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      router.push(`/login?redirect=/experiences/${experienceId}`)
      return
    }

    setError(null)
    setLoading(true)

    try {
      const response = await api.post('/experiences/bookings', {
        experienceId,
        date,
        guests,
      })

      router.push(`/dashboard/bookings/${response.data.data.id}?success=true`)
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Échec de la réservation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold text-brand-green mb-4">Réserver cette expérience</h3>

      {/* Date Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-brand-brown mb-2">
          Date souhaitée
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          min={minDate}
          required
          className="w-full px-4 py-2 border border-brand-cream rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
        />
      </div>

      {/* Guests Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-brand-brown mb-2">
          Nombre de participants
        </label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setGuests(Math.max(1, guests - 1))}
            className="w-10 h-10 rounded-full bg-brand-cream text-brand-green flex items-center justify-center hover:bg-brand-cream-dark transition-colors"
          >
            -
          </button>
          <span className="text-xl font-semibold text-brand-green w-8 text-center">
            {guests}
          </span>
          <button
            type="button"
            onClick={() => setGuests(Math.min(maxGuests, guests + 1))}
            className="w-10 h-10 rounded-full bg-brand-cream text-brand-green flex items-center justify-center hover:bg-brand-cream-dark transition-colors"
          >
            +
          </button>
          <span className="text-sm text-brand-brown">max {maxGuests}</span>
        </div>
      </div>

      {/* Price Summary */}
      <div className="border-t border-brand-cream pt-4 mb-4">
        <div className="flex justify-between text-sm text-brand-brown mb-2">
          <span>{price} TND x {guests} personne{guests > 1 ? 's' : ''}</span>
          <span>{totalPrice} TND</span>
        </div>
        <div className="flex justify-between font-semibold text-brand-green">
          <span>Total</span>
          <span>{totalPrice} TND</span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !date}
        className="w-full py-3 bg-brand-green text-white rounded-lg font-medium hover:bg-brand-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Réservation en cours...' : 'Réserver maintenant'}
      </button>

      {/* Info Text */}
      <p className="text-xs text-brand-brown text-center mt-3">
        Confirmation sous 24h. Annulation gratuite jusqu'à 48h avant.
      </p>
    </form>
  )
}
```

---

## Step 2: Educational Content Hub

### 2.1 Learn Page

**File:** `frontend/src/app/learn/page.tsx` (create)

```tsx
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Apprendre - Borgdanet',
  description: 'Recettes de saison, guides de conservation et ressources éducatives',
}

export default function LearnPage() {
  return (
    <main className="min-h-screen bg-brand-cream py-8">
      <div className="container mx-auto px-4">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl text-brand-green mb-4">
            Apprendre
          </h1>
          <p className="text-xl text-brand-brown max-w-2xl mx-auto">
            Découvrez nos recettes de saison, apprenez à conserver vos produits
            et explorez le monde de l'agriculture régénératrice.
          </p>
        </div>

        {/* Categories */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <ContentCategoryCard
            href="/learn/recipes"
            icon="🍳"
            title="Recettes"
            description="Cuisinez avec les produits de saison"
            count={24}
          />
          <ContentCategoryCard
            href="/learn/guides"
            icon="📚"
            title="Guides"
            description="Conservation et astuces pratiques"
            count={12}
          />
          <ContentCategoryCard
            href="/learn/calendar"
            icon="📅"
            title="Calendrier"
            description="Les produits de chaque saison"
            count={4}
          />
          <ContentCategoryCard
            href="/learn/workshops"
            icon="🎓"
            title="Ateliers"
            description="Cours en ligne et sur place"
            count={8}
          />
        </div>

        {/* Featured Recipes */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-brand-green">
              Recettes de saison
            </h2>
            <Link
              href="/learn/recipes"
              className="text-brand-green hover:underline"
            >
              Voir toutes les recettes →
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Recipe cards would be dynamically loaded */}
            <RecipePreviewCard
              title="Salade d'oranges au fenouil"
              image="/images/recipes/orange-salad.jpg"
              duration={15}
              difficulty="Facile"
              season="Hiver"
            />
            <RecipePreviewCard
              title="Tajine de légumes bio"
              image="/images/recipes/tajine.jpg"
              duration={45}
              difficulty="Moyen"
              season="Toute l'année"
            />
            <RecipePreviewCard
              title="Smoothie aux épinards"
              image="/images/recipes/smoothie.jpg"
              duration={5}
              difficulty="Facile"
              season="Printemps"
            />
          </div>
        </section>

        {/* Seasonal Calendar Preview */}
        <section className="bg-white rounded-xl p-8 shadow-sm mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl text-brand-green">
                Calendrier saisonnier
              </h2>
              <p className="text-brand-brown">
                Découvrez ce qui pousse en Tunisie ce mois-ci
              </p>
            </div>
            <Link
              href="/learn/calendar"
              className="px-4 py-2 bg-brand-cream text-brand-green rounded-lg hover:bg-brand-cream-dark transition-colors"
            >
              Voir le calendrier complet
            </Link>
          </div>

          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {['🍊', '🥬', '🥕', '🥦', '🧅', '🍋', '🥒', '🌿'].map((emoji, i) => (
              <div
                key={i}
                className="aspect-square bg-brand-cream rounded-lg flex items-center justify-center text-3xl"
              >
                {emoji}
              </div>
            ))}
          </div>
        </section>

        {/* Conservation Guides */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-brand-green">
              Guides de conservation
            </h2>
            <Link
              href="/learn/guides"
              className="text-brand-green hover:underline"
            >
              Tous les guides →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <GuideCard
              title="Conserver vos légumes"
              description="Les meilleures techniques pour garder vos légumes frais plus longtemps"
              icon="🥬"
            />
            <GuideCard
              title="Congélation des fruits"
              description="Comment congeler les fruits de saison pour en profiter toute l'année"
              icon="🍓"
            />
            <GuideCard
              title="Conservation des oeufs"
              description="Durée et conditions optimales pour vos oeufs fermiers"
              icon="🥚"
            />
            <GuideCard
              title="Huile d'olive"
              description="Stockage et utilisation optimale de votre huile d'olive"
              icon="🫒"
            />
          </div>
        </section>
      </div>
    </main>
  )
}

function ContentCategoryCard({
  href,
  icon,
  title,
  description,
  count,
}: {
  href: string
  icon: string
  title: string
  description: string
  count: number
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all group"
    >
      <span className="text-4xl mb-4 block">{icon}</span>
      <h3 className="font-semibold text-brand-green group-hover:text-brand-green-dark transition-colors">
        {title}
      </h3>
      <p className="text-sm text-brand-brown mb-2">{description}</p>
      <p className="text-xs text-brand-green">{count} articles</p>
    </Link>
  )
}

function RecipePreviewCard({
  title,
  image,
  duration,
  difficulty,
  season,
}: {
  title: string
  image: string
  duration: number
  difficulty: string
  season: string
}) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer">
      <div className="relative aspect-[4/3]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-full text-xs font-medium text-brand-green">
          {season}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-brand-green mb-2">{title}</h3>
        <div className="flex items-center gap-3 text-sm text-brand-brown">
          <span>⏱️ {duration} min</span>
          <span>•</span>
          <span>{difficulty}</span>
        </div>
      </div>
    </div>
  )
}

function GuideCard({
  title,
  description,
  icon,
}: {
  title: string
  description: string
  icon: string
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer">
      <span className="text-2xl mb-2 block">{icon}</span>
      <h4 className="font-semibold text-brand-green mb-1">{title}</h4>
      <p className="text-sm text-brand-brown">{description}</p>
    </div>
  )
}
```

### 2.2 Recipes Page

**File:** `frontend/src/app/learn/recipes/page.tsx` (create)

```tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import api from '@/lib/api'

interface Recipe {
  id: string
  title: string
  description: string
  image: string
  duration: number
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  season: string
  ingredients: string[]
  category: string
}

const difficultyLabels = {
  EASY: 'Facile',
  MEDIUM: 'Moyen',
  HARD: 'Difficile',
}

const categories = [
  { value: '', label: 'Toutes' },
  { value: 'salads', label: 'Salades' },
  { value: 'mains', label: 'Plats principaux' },
  { value: 'soups', label: 'Soupes' },
  { value: 'desserts', label: 'Desserts' },
  { value: 'drinks', label: 'Boissons' },
]

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchRecipes()
  }, [category])

  const fetchRecipes = async () => {
    try {
      const params = new URLSearchParams()
      if (category) params.set('category', category)

      const response = await api.get(`/content/recipes?${params.toString()}`)
      setRecipes(response.data.data)
    } catch (error) {
      console.error('Failed to fetch recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-brand-cream py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/learn" className="text-brand-brown hover:text-brand-green text-sm mb-2 inline-block">
            ← Retour à Apprendre
          </Link>
          <h1 className="font-display text-4xl text-brand-green mb-4">
            Recettes de saison
          </h1>
          <p className="text-brand-brown max-w-2xl">
            Des recettes simples et délicieuses pour cuisiner les produits frais de nos fermes.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            placeholder="Rechercher une recette..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-brand-cream rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
          />
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  category === cat.value
                    ? 'bg-brand-green text-white'
                    : 'bg-white text-brand-brown hover:bg-brand-cream'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recipes Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/3] bg-white rounded-t-xl" />
                <div className="bg-white rounded-b-xl p-4 space-y-2">
                  <div className="h-5 bg-brand-cream rounded w-3/4" />
                  <div className="h-4 bg-brand-cream rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-brand-brown">Aucune recette trouvée.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <Link
                key={recipe.id}
                href={`/learn/recipes/${recipe.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={recipe.image || '/images/placeholder-recipe.jpg'}
                    alt={recipe.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-full text-xs font-medium text-brand-green">
                    {recipe.season}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-brand-green mb-2 group-hover:text-brand-green-dark transition-colors">
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-brand-brown mb-3 line-clamp-2">
                    {recipe.description}
                  </p>
                  <div className="flex items-center gap-3 text-sm text-brand-brown">
                    <span>⏱️ {recipe.duration} min</span>
                    <span>•</span>
                    <span>{difficultyLabels[recipe.difficulty]}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
```

---

## Step 3: PWA Implementation

### 3.1 Web App Manifest

**File:** `frontend/public/manifest.json` (create)

```json
{
  "name": "Borgdanet - Produits Bio Locaux",
  "short_name": "Borgdanet",
  "description": "Produits bio et locaux directement des fermes tunisiennes",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FDF8F0",
  "theme_color": "#2D5A27",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "categories": ["food", "shopping", "lifestyle"],
  "lang": "fr-TN",
  "dir": "ltr",
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "/screenshots/mobile-home.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "shortcuts": [
    {
      "name": "Mes commandes",
      "short_name": "Commandes",
      "description": "Voir mes commandes",
      "url": "/dashboard/orders",
      "icons": [{ "src": "/icons/orders.png", "sizes": "96x96" }]
    },
    {
      "name": "Mon panier",
      "short_name": "Panier",
      "description": "Voir mon panier",
      "url": "/cart",
      "icons": [{ "src": "/icons/cart.png", "sizes": "96x96" }]
    }
  ]
}
```

### 3.2 Service Worker

**File:** `frontend/public/sw.js` (create)

```javascript
const CACHE_NAME = 'borgdanet-v1'
const STATIC_CACHE = 'borgdanet-static-v1'
const DYNAMIC_CACHE = 'borgdanet-dynamic-v1'

const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Caching static assets')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') return

  // Skip API requests (let them fail normally)
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline' }),
          { headers: { 'Content-Type': 'application/json' } }
        )
      })
    )
    return
  }

  // For page navigations - network first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clonedResponse)
          })
          return response
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || caches.match('/offline')
          })
        })
    )
    return
  }

  // For static assets - cache first
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request).then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const clonedResponse = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clonedResponse)
          })
        }
        return response
      })
    })
  )
})

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return

  const data = event.data.json()

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: data.actions || [],
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data.url

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Check if there's already a window open
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      // Open a new window
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

// Background sync for cart
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart())
  }
})

async function syncCart() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    const cartData = await cache.match('/cart-pending')

    if (cartData) {
      const cart = await cartData.json()
      await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cart),
      })
      await cache.delete('/cart-pending')
    }
  } catch (error) {
    console.error('Cart sync failed:', error)
  }
}
```

### 3.3 Offline Page

**File:** `frontend/src/app/offline/page.tsx` (create)

```tsx
import Link from 'next/link'

export default function OfflinePage() {
  return (
    <main className="min-h-screen bg-brand-cream flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">📡</div>
        <h1 className="font-display text-3xl text-brand-green mb-4">
          Vous êtes hors ligne
        </h1>
        <p className="text-brand-brown mb-6">
          Vérifiez votre connexion internet et réessayez.
          Votre panier est sauvegardé et sera synchronisé automatiquement.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-brand-green text-white rounded-lg font-medium hover:bg-brand-green-dark transition-colors"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="block w-full py-3 bg-white text-brand-green border border-brand-green rounded-lg font-medium hover:bg-brand-cream transition-colors"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </main>
  )
}
```

### 3.4 PWA Registration Hook

**File:** `frontend/src/hooks/usePWA.ts` (create)

```typescript
'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }

    // Listen for successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setInstallPrompt(null)
    }

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial online status
    setIsOnline(navigator.onLine)

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('Service worker registration failed:', error)
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const promptInstall = async () => {
    if (!installPrompt) return false

    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice

    if (outcome === 'accepted') {
      setIsInstalled(true)
    }

    setInstallPrompt(null)
    return outcome === 'accepted'
  }

  return {
    canInstall: !!installPrompt && !isInstalled,
    isInstalled,
    isOnline,
    promptInstall,
  }
}
```

### 3.5 Install Prompt Component

**File:** `frontend/src/components/pwa/InstallPrompt.tsx` (create)

```tsx
'use client'

import { useState, useEffect } from 'react'
import { usePWA } from '@/hooks/usePWA'

export function InstallPrompt() {
  const { canInstall, promptInstall } = usePWA()
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if user has dismissed before
    const hasDismissed = localStorage.getItem('pwa-install-dismissed')
    if (hasDismissed) {
      const dismissedAt = parseInt(hasDismissed, 10)
      // Show again after 7 days
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) {
        setDismissed(true)
      }
    }
  }, [])

  if (!canInstall || dismissed) return null

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    setDismissed(true)
  }

  const handleInstall = async () => {
    const success = await promptInstall()
    if (success) {
      // Track installation
      console.log('PWA installed successfully')
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-xl shadow-lg p-4 z-50 border border-brand-cream">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-brand-brown hover:text-brand-green"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-brand-cream rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🌱</span>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-brand-green mb-1">
            Installer Borgdanet
          </h3>
          <p className="text-sm text-brand-brown mb-3">
            Accédez rapidement à vos commandes et recevez des notifications.
          </p>
          <button
            onClick={handleInstall}
            className="w-full py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green-dark transition-colors"
          >
            Installer l'application
          </button>
        </div>
      </div>
    </div>
  )
}
```

### 3.6 Offline Indicator Component

**File:** `frontend/src/components/pwa/OfflineIndicator.tsx` (create)

```tsx
'use client'

import { usePWA } from '@/hooks/usePWA'

export function OfflineIndicator() {
  const { isOnline } = usePWA()

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 text-sm z-50">
      <span className="mr-2">📡</span>
      Vous êtes hors ligne. Certaines fonctionnalités peuvent être limitées.
    </div>
  )
}
```

### 3.7 Update Layout to Include PWA Components

**File:** `frontend/src/app/layout.tsx` (update)

```tsx
// Add to layout.tsx
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator'

// In the body of the layout:
<body>
  <OfflineIndicator />
  {/* ... existing content ... */}
  <InstallPrompt />
</body>
```

---

## Step 4: Backend API for New Features

### 4.1 Experience Controller

**File:** `backend/src/controllers/experience.controller.ts` (create)

```typescript
import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'

const prisma = new PrismaClient()

export const getExperiences = async (req: Request, res: Response) => {
  try {
    const { type, region, priceMax } = req.query

    const where: any = { available: true }

    if (type) where.type = type
    if (region) where.farm = { region }
    if (priceMax) where.price = { lte: parseFloat(priceMax as string) }

    const experiences = await prisma.experience.findMany({
      where,
      include: {
        farm: {
          select: { id: true, name: true, slug: true, region: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate ratings
    const experiencesWithRatings = await Promise.all(
      experiences.map(async (exp) => {
        const reviews = await prisma.experienceReview.aggregate({
          where: { experienceId: exp.id },
          _avg: { rating: true },
          _count: { rating: true },
        })

        return {
          id: exp.id,
          title: exp.title,
          farmName: exp.farm.name,
          farmSlug: exp.farm.slug,
          type: exp.type,
          duration: exp.duration,
          price: exp.price,
          image: exp.images[0] || null,
          region: exp.farm.region,
          rating: reviews._avg.rating || 0,
          reviewCount: reviews._count.rating,
        }
      })
    )

    res.json({ success: true, data: experiencesWithRatings })
  } catch (error) {
    console.error('Get experiences error:', error)
    res.status(500).json({ success: false, error: { message: 'Failed to fetch experiences' } })
  }
}

export const getExperienceById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const experience = await prisma.experience.findUnique({
      where: { id },
      include: {
        farm: {
          select: { id: true, name: true, slug: true, region: true, logo: true },
        },
      },
    })

    if (!experience) {
      return res.status(404).json({
        success: false,
        error: { message: 'Experience not found' },
      })
    }

    // Get reviews
    const reviews = await prisma.experienceReview.aggregate({
      where: { experienceId: id },
      _avg: { rating: true },
      _count: { rating: true },
    })

    res.json({
      success: true,
      data: {
        ...experience,
        rating: reviews._avg.rating || 0,
        reviewCount: reviews._count.rating,
      },
    })
  } catch (error) {
    console.error('Get experience error:', error)
    res.status(500).json({ success: false, error: { message: 'Failed to fetch experience' } })
  }
}

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { experienceId, date, guests } = req.body
    const customerId = req.user!.id

    // Get experience
    const experience = await prisma.experience.findUnique({
      where: { id: experienceId },
    })

    if (!experience || !experience.available) {
      return res.status(404).json({
        success: false,
        error: { message: 'Experience not found or unavailable' },
      })
    }

    if (guests > experience.maxGuests) {
      return res.status(400).json({
        success: false,
        error: { message: `Maximum ${experience.maxGuests} guests allowed` },
      })
    }

    // Check date is valid (at least tomorrow)
    const bookingDate = new Date(date)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    if (bookingDate < tomorrow) {
      return res.status(400).json({
        success: false,
        error: { message: 'Booking must be at least 1 day in advance' },
      })
    }

    const totalPrice = experience.price.toNumber() * guests

    const booking = await prisma.experienceBooking.create({
      data: {
        experienceId,
        userId: customerId,
        date: bookingDate,
        guests,
        totalPrice,
        status: 'PENDING',
      },
      include: {
        experience: {
          include: {
            farm: { select: { name: true } },
          },
        },
      },
    })

    res.status(201).json({ success: true, data: booking })
  } catch (error) {
    console.error('Create booking error:', error)
    res.status(500).json({ success: false, error: { message: 'Failed to create booking' } })
  }
}

export const getMyBookings = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!.id

    const bookings = await prisma.experienceBooking.findMany({
      where: { userId: customerId },
      include: {
        experience: {
          include: {
            farm: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    res.json({ success: true, data: bookings })
  } catch (error) {
    console.error('Get bookings error:', error)
    res.status(500).json({ success: false, error: { message: 'Failed to fetch bookings' } })
  }
}

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const customerId = req.user!.id

    const booking = await prisma.experienceBooking.findFirst({
      where: { id, userId: customerId },
    })

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: { message: 'Booking not found' },
      })
    }

    // Check if cancellation is allowed (48h before)
    const now = new Date()
    const bookingDate = new Date(booking.date)
    const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilBooking < 48) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cancellation not allowed less than 48h before booking' },
      })
    }

    await prisma.experienceBooking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    res.json({ success: true, data: { message: 'Booking cancelled successfully' } })
  } catch (error) {
    console.error('Cancel booking error:', error)
    res.status(500).json({ success: false, error: { message: 'Failed to cancel booking' } })
  }
}
```

### 4.2 Experience Routes

**File:** `backend/src/routes/experience.routes.ts` (create)

```typescript
import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import {
  getExperiences,
  getExperienceById,
  createBooking,
  getMyBookings,
  cancelBooking,
} from '../controllers/experience.controller'

const router = Router()

// Public routes
router.get('/', getExperiences)
router.get('/:id', getExperienceById)

// Protected routes
router.use(authenticate)
router.post('/bookings', createBooking)
router.get('/bookings/my', getMyBookings)
router.patch('/bookings/:id/cancel', cancelBooking)

export default router
```

### 4.3 Content Controller

**File:** `backend/src/controllers/content.controller.ts` (create)

```typescript
import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const getRecipes = async (req: Request, res: Response) => {
  try {
    const { category, season } = req.query

    const where: any = { published: true }
    if (category) where.category = category
    if (season) where.season = season

    const recipes = await prisma.recipe.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        duration: true,
        difficulty: true,
        season: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json({ success: true, data: recipes })
  } catch (error) {
    console.error('Get recipes error:', error)
    res.status(500).json({ success: false, error: { message: 'Failed to fetch recipes' } })
  }
}

export const getRecipeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const recipe = await prisma.recipe.findUnique({
      where: { id, published: true },
    })

    if (!recipe) {
      return res.status(404).json({
        success: false,
        error: { message: 'Recipe not found' },
      })
    }

    res.json({ success: true, data: recipe })
  } catch (error) {
    console.error('Get recipe error:', error)
    res.status(500).json({ success: false, error: { message: 'Failed to fetch recipe' } })
  }
}

export const getGuides = async (req: Request, res: Response) => {
  try {
    const guides = await prisma.guide.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
    })

    res.json({ success: true, data: guides })
  } catch (error) {
    console.error('Get guides error:', error)
    res.status(500).json({ success: false, error: { message: 'Failed to fetch guides' } })
  }
}

export const getSeasonalCalendar = async (req: Request, res: Response) => {
  try {
    const calendar = await prisma.seasonalCalendar.findMany({
      include: {
        products: {
          select: { id: true, name: true, category: true, images: true },
        },
      },
      orderBy: { month: 'asc' },
    })

    res.json({ success: true, data: calendar })
  } catch (error) {
    console.error('Get calendar error:', error)
    res.status(500).json({ success: false, error: { message: 'Failed to fetch calendar' } })
  }
}
```

### 4.4 Content Routes

**File:** `backend/src/routes/content.routes.ts` (create)

```typescript
import { Router } from 'express'
import {
  getRecipes,
  getRecipeById,
  getGuides,
  getSeasonalCalendar,
} from '../controllers/content.controller'

const router = Router()

router.get('/recipes', getRecipes)
router.get('/recipes/:id', getRecipeById)
router.get('/guides', getGuides)
router.get('/calendar', getSeasonalCalendar)

export default router
```

### 4.5 Register New Routes

**File:** `backend/src/routes/index.ts` (update)

```typescript
// Add imports
import experienceRoutes from './experience.routes'
import contentRoutes from './content.routes'

// Add routes
router.use('/experiences', experienceRoutes)
router.use('/content', contentRoutes)
```

---

## Step 5: Database Schema Additions

### 5.1 Prisma Schema for New Features

**File:** `backend/prisma/schema.prisma` (add models)

```prisma
// Agritourism Experiences
model Experience {
  id          String       @id @default(cuid())
  farmId      String
  farm        Farm         @relation(fields: [farmId], references: [id])
  title       String
  titleAr     String?
  description String
  descriptionAr String?
  type        ExperienceType
  duration    Int          // minutes
  price       Decimal      @db.Decimal(10, 3)
  maxGuests   Int
  images      String[]
  includes    String[]
  available   Boolean      @default(true)
  bookings    ExperienceBooking[]
  reviews     ExperienceReview[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([farmId])
  @@index([type])
}

model ExperienceBooking {
  id           String        @id @default(cuid())
  experienceId String
  experience   Experience    @relation(fields: [experienceId], references: [id])
  userId       String
  user         User          @relation(fields: [userId], references: [id])
  date         DateTime
  guests       Int
  totalPrice   Decimal       @db.Decimal(10, 3)
  status       BookingStatus @default(PENDING)
  notes        String?
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@index([experienceId])
  @@index([userId])
}

model ExperienceReview {
  id           String     @id @default(cuid())
  experienceId String
  experience   Experience @relation(fields: [experienceId], references: [id])
  userId       String
  user         User       @relation(fields: [userId], references: [id])
  rating       Int
  comment      String?
  createdAt    DateTime   @default(now())

  @@unique([experienceId, userId])
  @@index([experienceId])
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

// Educational Content
model Recipe {
  id          String   @id @default(cuid())
  title       String
  titleAr     String?
  description String
  descriptionAr String?
  image       String?
  duration    Int      // minutes
  difficulty  RecipeDifficulty
  season      String
  category    String
  ingredients Json     // Array of ingredient objects
  steps       Json     // Array of step objects
  tips        String?
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category])
  @@index([season])
}

model Guide {
  id          String   @id @default(cuid())
  title       String
  titleAr     String?
  description String
  descriptionAr String?
  icon        String
  content     String   @db.Text
  contentAr   String?  @db.Text
  order       Int      @default(0)
  published   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model SeasonalCalendar {
  id       String    @id @default(cuid())
  month    Int       // 1-12
  products Product[]
}

enum RecipeDifficulty {
  EASY
  MEDIUM
  HARD
}
```

### 5.2 Run Migration

```bash
cd backend
npx prisma migrate dev --name add_new_features
npx prisma generate
```

---

## Acceptance Criteria

### Agritourism
- [ ] Experience listing page displays all available experiences
- [ ] Filters work correctly (type, region, price)
- [ ] Experience detail page shows all information
- [ ] Booking form validates dates and guests
- [ ] Users can view and cancel their bookings

### Educational Content
- [ ] Learn page displays all content categories
- [ ] Recipes page shows recipes with filters
- [ ] Recipe detail page displays full recipe
- [ ] Seasonal calendar shows products by month

### PWA
- [ ] App can be installed on mobile devices
- [ ] Offline page displays when offline
- [ ] Service worker caches static assets
- [ ] Install prompt appears for eligible users
- [ ] Offline indicator shows when connection lost

---

## Final Notes

### Testing the PWA

1. Build the production frontend:
```bash
cd frontend && npm run build
```

2. Serve with HTTPS (required for service worker):
```bash
npx serve out -s -l 3000
```

3. Test installation on mobile:
- Open site in Chrome/Safari
- Wait for install prompt or use browser menu
- Test offline functionality

### Performance Optimization

- Enable image optimization in next.config.js
- Configure caching headers for static assets
- Use lazy loading for images and components
- Implement code splitting for large pages

---

**Implementation Complete!**

You have now transformed FarmBox into Borgdanet with:
- New brand identity and homepage
- Enhanced subscription experience
- Improved farm profiles
- Redesigned shopping experience
- Loyalty and referral programs
- Impact tracking dashboard
- Quality feedback system
- Agritourism booking
- Educational content hub
- Progressive Web App capabilities

*Local food. Trusted farms. Shared abundance.*
