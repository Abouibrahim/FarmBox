# Phase 2: Subscription Experience

> **Build a streamlined onboarding flow and enhanced subscription management**

---

## Phase Overview

| Aspect | Details |
|--------|---------|
| **Priority** | Critical |
| **Dependencies** | Phase 1 (Brand & Homepage) |
| **Files to Create** | ~12 new files |
| **Files to Modify** | ~8 existing files |

---

## Step 1: Create Onboarding Flow Pages

### 1.1 Get Started Landing Page

**File:** `frontend/src/app/get-started/page.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type BoxType = 'trial' | 'essentiel' | 'famille' | 'gourmet'
type Frequency = 'weekly' | 'biweekly'

const boxes = [
  {
    id: 'trial' as BoxType,
    name: 'Box Essai',
    badge: '🎁 -25%',
    price: 33,
    originalPrice: 45,
    description: 'Une seule livraison pour découvrir',
    products: '6-8 produits',
    isSubscription: false,
  },
  {
    id: 'essentiel' as BoxType,
    name: 'Essentiel',
    price: 45,
    description: 'Abonnement hebdomadaire',
    products: '6-8 produits',
    serves: '2-3 personnes',
    isSubscription: true,
  },
  {
    id: 'famille' as BoxType,
    name: 'Famille',
    badge: '⭐ Populaire',
    price: 75,
    description: 'Abonnement hebdomadaire',
    products: '12-15 produits',
    serves: '4-5 personnes',
    isSubscription: true,
    popular: true,
  },
  {
    id: 'gourmet' as BoxType,
    name: 'Gourmet',
    price: 120,
    description: 'Abonnement hebdomadaire',
    products: '18-20 produits',
    serves: '5-6 personnes',
    isSubscription: true,
  },
]

export default function GetStartedPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialBox = searchParams.get('box') as BoxType ||
                     (searchParams.get('trial') === 'true' ? 'trial' : null)

  const [selectedBox, setSelectedBox] = useState<BoxType | null>(initialBox)
  const [frequency, setFrequency] = useState<Frequency>('weekly')

  const handleContinue = () => {
    if (!selectedBox) return

    const box = boxes.find(b => b.id === selectedBox)
    if (box?.isSubscription) {
      router.push(`/get-started/customize?box=${selectedBox}&frequency=${frequency}`)
    } else {
      router.push(`/get-started/customize?box=${selectedBox}`)
    }
  }

  return (
    <main className="min-h-screen bg-brand-cream py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Progress */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="ml-2 text-brand-green font-medium">Formule</span>
            </div>
            <div className="w-12 h-0.5 bg-brand-cream-dark" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-cream-dark text-brand-brown flex items-center justify-center text-sm">
                2
              </div>
              <span className="ml-2 text-brand-brown">Personnaliser</span>
            </div>
            <div className="w-12 h-0.5 bg-brand-cream-dark" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-cream-dark text-brand-brown flex items-center justify-center text-sm">
                3
              </div>
              <span className="ml-2 text-brand-brown">Livraison</span>
            </div>
            <div className="w-12 h-0.5 bg-brand-cream-dark" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-cream-dark text-brand-brown flex items-center justify-center text-sm">
                4
              </div>
              <span className="ml-2 text-brand-brown">Finaliser</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-brand-green mb-2">
            Choisissez votre formule
          </h1>
          <p className="text-brand-brown">
            Étape 1 sur 4
          </p>
        </div>

        {/* Box Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {boxes.map((box) => (
            <button
              key={box.id}
              onClick={() => setSelectedBox(box.id)}
              className={`relative text-left p-6 rounded-lg border-2 transition-all ${
                selectedBox === box.id
                  ? 'border-brand-green bg-white shadow-lg'
                  : 'border-brand-cream-dark bg-white hover:border-brand-green/50'
              } ${box.popular ? 'ring-2 ring-brand-green ring-offset-2' : ''}`}
            >
              {/* Badge */}
              {box.badge && (
                <span className={`absolute -top-3 left-4 px-3 py-1 text-xs font-semibold rounded-full ${
                  box.id === 'trial' ? 'bg-brand-gold text-white' : 'bg-brand-green text-white'
                }`}>
                  {box.badge}
                </span>
              )}

              {/* Content */}
              <h3 className="font-display text-xl text-brand-green mb-2 mt-2">
                {box.name}
              </h3>

              <div className="mb-3">
                <span className="text-2xl font-bold text-brand-green">{box.price}</span>
                <span className="text-brand-brown"> TND</span>
                {box.originalPrice && (
                  <span className="text-sm text-gray-400 line-through ml-2">
                    {box.originalPrice} TND
                  </span>
                )}
              </div>

              <p className="text-sm text-brand-brown mb-2">{box.description}</p>
              <p className="text-sm text-brand-brown">📦 {box.products}</p>
              {box.serves && (
                <p className="text-sm text-brand-brown">👨‍👩‍👧‍👦 {box.serves}</p>
              )}

              {/* Selection indicator */}
              {selectedBox === box.id && (
                <div className="absolute top-4 right-4 w-6 h-6 bg-brand-green rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Frequency Selection (for subscriptions only) */}
        {selectedBox && boxes.find(b => b.id === selectedBox)?.isSubscription && (
          <div className="bg-white rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-brand-green mb-4">Fréquence de livraison</h3>
            <div className="flex gap-4">
              <button
                onClick={() => setFrequency('weekly')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  frequency === 'weekly'
                    ? 'border-brand-green bg-brand-cream'
                    : 'border-brand-cream-dark hover:border-brand-green/50'
                }`}
              >
                <div className="font-semibold text-brand-green">Chaque semaine</div>
                <div className="text-sm text-brand-brown">Livraison hebdomadaire</div>
              </button>
              <button
                onClick={() => setFrequency('biweekly')}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  frequency === 'biweekly'
                    ? 'border-brand-green bg-brand-cream'
                    : 'border-brand-cream-dark hover:border-brand-green/50'
                }`}
              >
                <div className="font-semibold text-brand-green">Toutes les 2 semaines</div>
                <div className="text-sm text-brand-brown">Livraison bi-mensuelle</div>
              </button>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="flex justify-between items-center">
          <Link
            href="/"
            className="text-brand-brown hover:text-brand-green transition-colors"
          >
            ← Retour à l'accueil
          </Link>
          <button
            onClick={handleContinue}
            disabled={!selectedBox}
            className={`px-8 py-4 rounded-lg font-semibold transition-colors ${
              selectedBox
                ? 'bg-brand-green text-white hover:bg-brand-green-dark'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Continuer →
          </button>
        </div>
      </div>
    </main>
  )
}
```

### 1.2 Customize Step Page

**File:** `frontend/src/app/get-started/customize/page.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { api } from '@/lib/api'

interface Product {
  id: string
  name: string
  image: string | null
  farm: { name: string }
  unit: string
}

interface BoxContents {
  included: Product[]
  alternatives: Product[]
}

export default function CustomizePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const boxType = searchParams.get('box') || 'essentiel'
  const frequency = searchParams.get('frequency') || 'weekly'

  const [contents, setContents] = useState<BoxContents | null>(null)
  const [swaps, setSwaps] = useState<Record<string, string>>({})
  const [preferences, setPreferences] = useState({
    glutenFree: false,
    vegetarian: false,
    lactoseFree: false,
    avoidItems: '',
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBoxContents = async () => {
      try {
        // Fetch default box contents based on box type
        const response = await api.get(`/subscriptions/box-preview?type=${boxType}`)
        setContents(response.data)
      } catch (error) {
        // Mock data for development
        setContents({
          included: [
            { id: '1', name: 'Tomates heirloom', image: null, farm: { name: 'Ferme Ben Salah' }, unit: '1kg' },
            { id: '2', name: 'Courgettes bio', image: null, farm: { name: 'Ferme Ben Salah' }, unit: '500g' },
            { id: '3', name: 'Oranges Hammamet', image: null, farm: { name: 'Domaine Zaghouan' }, unit: '2kg' },
            { id: '4', name: 'Épinards frais', image: null, farm: { name: 'Les Jardins de Sonia' }, unit: 'botte' },
            { id: '5', name: 'Oeufs fermiers', image: null, farm: { name: 'Ferme Testour' }, unit: '12' },
            { id: '6', name: 'Fromage frais', image: null, farm: { name: 'Laiterie Bio' }, unit: '250g' },
          ],
          alternatives: [
            { id: 'a1', name: 'Poivrons rouges', image: null, farm: { name: 'Ferme Ben Salah' }, unit: '500g' },
            { id: 'a2', name: 'Carottes nouvelles', image: null, farm: { name: 'Ferme Testour' }, unit: '1kg' },
            { id: 'a3', name: 'Pommes de terre', image: null, farm: { name: 'Domaine Zaghouan' }, unit: '1kg' },
          ],
        })
      } finally {
        setLoading(false)
      }
    }
    fetchBoxContents()
  }, [boxType])

  const handleSwap = (originalId: string, newId: string) => {
    setSwaps(prev => ({ ...prev, [originalId]: newId }))
  }

  const handleContinue = () => {
    // Store customization in session storage
    sessionStorage.setItem('borgdanet-customization', JSON.stringify({
      boxType,
      frequency,
      swaps,
      preferences,
    }))
    router.push(`/get-started/delivery?box=${boxType}&frequency=${frequency}`)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-cream py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-brand-cream-dark rounded w-64 mx-auto" />
            <div className="h-64 bg-brand-cream-dark rounded" />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brand-cream py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-sm">✓</div>
              <span className="ml-2 text-brand-green">Formule</span>
            </div>
            <div className="w-12 h-0.5 bg-brand-green" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-sm font-semibold">2</div>
              <span className="ml-2 text-brand-green font-medium">Personnaliser</span>
            </div>
            <div className="w-12 h-0.5 bg-brand-cream-dark" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-cream-dark text-brand-brown flex items-center justify-center text-sm">3</div>
              <span className="ml-2 text-brand-brown">Livraison</span>
            </div>
            <div className="w-12 h-0.5 bg-brand-cream-dark" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-cream-dark text-brand-brown flex items-center justify-center text-sm">4</div>
              <span className="ml-2 text-brand-brown">Finaliser</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-brand-green mb-2">
            Personnalisez votre box
          </h1>
          <p className="text-brand-brown">Étape 2 sur 4</p>
        </div>

        {/* Box Contents */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-brand-green mb-4">
            Votre box {boxType.charAt(0).toUpperCase() + boxType.slice(1)} contient:
          </h2>
          <div className="space-y-3">
            {contents?.included.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 border border-brand-cream-dark rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-brand-cream rounded-lg flex items-center justify-center">
                    {product.image ? (
                      <Image src={product.image} alt={product.name} width={48} height={48} className="rounded-lg object-cover" />
                    ) : (
                      <span className="text-2xl">🥬</span>
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-brand-green">
                      {swaps[product.id]
                        ? contents.alternatives.find(a => a.id === swaps[product.id])?.name
                        : product.name}
                    </div>
                    <div className="text-sm text-brand-brown">
                      {product.farm.name} • {product.unit}
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={swaps[product.id] || ''}
                    onChange={(e) => handleSwap(product.id, e.target.value)}
                    className="appearance-none bg-brand-cream px-4 py-2 pr-8 rounded-lg text-sm text-brand-green cursor-pointer"
                  >
                    <option value="">Garder</option>
                    {contents?.alternatives.map((alt) => (
                      <option key={alt.id} value={alt.id}>
                        Échanger: {alt.name}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">▼</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-brand-brown mt-4">
            💡 Vous pouvez échanger jusqu'à 3 produits par livraison
          </p>
        </div>

        {/* Dietary Preferences */}
        <div className="bg-white rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-brand-green mb-4">Préférences alimentaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { key: 'glutenFree', label: 'Sans gluten' },
              { key: 'vegetarian', label: 'Végétarien' },
              { key: 'lactoseFree', label: 'Sans lactose' },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={preferences[key as keyof typeof preferences] as boolean}
                  onChange={(e) => setPreferences(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="w-5 h-5 rounded border-brand-cream-dark text-brand-green focus:ring-brand-green"
                />
                <span className="text-brand-brown">{label}</span>
              </label>
            ))}
          </div>
          <div>
            <label className="block text-brand-brown mb-2">
              Produits à éviter (allergies, préférences)
            </label>
            <input
              type="text"
              value={preferences.avoidItems}
              onChange={(e) => setPreferences(prev => ({ ...prev, avoidItems: e.target.value }))}
              placeholder="Ex: aubergines, piments..."
              className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link
            href={`/get-started?box=${boxType}`}
            className="text-brand-brown hover:text-brand-green transition-colors"
          >
            ← Retour
          </Link>
          <button
            onClick={handleContinue}
            className="px-8 py-4 bg-brand-green text-white rounded-lg font-semibold hover:bg-brand-green-dark transition-colors"
          >
            Continuer →
          </button>
        </div>
      </div>
    </main>
  )
}
```

### 1.3 Delivery Step Page

**File:** `frontend/src/app/get-started/delivery/page.tsx`

```tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

type Zone = 'ZONE_A' | 'ZONE_B' | 'ZONE_C'
type DeliveryDay = 'tuesday' | 'thursday' | 'saturday'
type TimeSlot = 'morning' | 'evening'

const zones = [
  { id: 'ZONE_A' as Zone, name: 'Zone A - Tunis centre', fee: 5, freeThreshold: 80 },
  { id: 'ZONE_B' as Zone, name: 'Zone B - Banlieue', fee: 8, freeThreshold: 120 },
  { id: 'ZONE_C' as Zone, name: 'Zone C - Périphérie', fee: 12, freeThreshold: 150 },
]

const deliveryDays = [
  { id: 'tuesday' as DeliveryDay, label: 'Mardi' },
  { id: 'thursday' as DeliveryDay, label: 'Jeudi' },
  { id: 'saturday' as DeliveryDay, label: 'Samedi' },
]

const timeSlots = [
  { id: 'morning' as TimeSlot, label: 'Matin (6h-9h)' },
  { id: 'evening' as TimeSlot, label: 'Soir (18h-21h)' },
]

export default function DeliveryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const boxType = searchParams.get('box') || 'essentiel'
  const frequency = searchParams.get('frequency') || 'weekly'

  const [zone, setZone] = useState<Zone>('ZONE_B')
  const [deliveryDay, setDeliveryDay] = useState<DeliveryDay>('thursday')
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('evening')

  const selectedZone = zones.find(z => z.id === zone)

  const handleContinue = () => {
    // Store delivery preferences
    const existing = JSON.parse(sessionStorage.getItem('borgdanet-customization') || '{}')
    sessionStorage.setItem('borgdanet-customization', JSON.stringify({
      ...existing,
      zone,
      deliveryDay,
      timeSlot,
    }))
    router.push(`/get-started/checkout?box=${boxType}&frequency=${frequency}`)
  }

  return (
    <main className="min-h-screen bg-brand-cream py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-sm">✓</div>
              <span className="ml-2 text-brand-green">Formule</span>
            </div>
            <div className="w-12 h-0.5 bg-brand-green" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-sm">✓</div>
              <span className="ml-2 text-brand-green">Personnaliser</span>
            </div>
            <div className="w-12 h-0.5 bg-brand-green" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-sm font-semibold">3</div>
              <span className="ml-2 text-brand-green font-medium">Livraison</span>
            </div>
            <div className="w-12 h-0.5 bg-brand-cream-dark" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-cream-dark text-brand-brown flex items-center justify-center text-sm">4</div>
              <span className="ml-2 text-brand-brown">Finaliser</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-brand-green mb-2">
            Choisissez votre livraison
          </h1>
          <p className="text-brand-brown">Étape 3 sur 4</p>
        </div>

        {/* Zone Selection */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-brand-green mb-4">Votre zone de livraison</h2>

          {/* Zone Map Placeholder */}
          <div className="bg-brand-cream rounded-lg p-8 mb-4 text-center">
            <div className="text-6xl mb-2">🗺️</div>
            <p className="text-brand-brown">Carte interactive des zones de livraison</p>
          </div>

          {/* Zone Options */}
          <div className="space-y-3">
            {zones.map((z) => (
              <button
                key={z.id}
                onClick={() => setZone(z.id)}
                className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                  zone === z.id
                    ? 'border-brand-green bg-brand-cream'
                    : 'border-brand-cream-dark hover:border-brand-green/50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    zone === z.id ? 'border-brand-green' : 'border-brand-cream-dark'
                  }`}>
                    {zone === z.id && <div className="w-3 h-3 rounded-full bg-brand-green" />}
                  </div>
                  <span className="font-medium text-brand-green">{z.name}</span>
                </div>
                <span className="text-brand-brown text-sm">
                  Livraison gratuite dès {z.freeThreshold} TND
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Delivery Day */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="font-semibold text-brand-green mb-4">Jour de livraison</h2>
          <div className="flex gap-4">
            {deliveryDays.map((day) => (
              <button
                key={day.id}
                onClick={() => setDeliveryDay(day.id)}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  deliveryDay === day.id
                    ? 'border-brand-green bg-brand-cream'
                    : 'border-brand-cream-dark hover:border-brand-green/50'
                }`}
              >
                <div className="font-medium text-brand-green">{day.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Slot */}
        <div className="bg-white rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-brand-green mb-4">Créneau horaire</h2>
          <div className="flex gap-4">
            {timeSlots.map((slot) => (
              <button
                key={slot.id}
                onClick={() => setTimeSlot(slot.id)}
                className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                  timeSlot === slot.id
                    ? 'border-brand-green bg-brand-cream'
                    : 'border-brand-cream-dark hover:border-brand-green/50'
                }`}
              >
                <div className="font-medium text-brand-green">{slot.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-brand-gold/10 border border-brand-gold rounded-lg p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-brand-green font-medium">Livraison prévue:</span>
              <span className="text-brand-brown ml-2">
                {deliveryDays.find(d => d.id === deliveryDay)?.label}, {timeSlots.find(s => s.id === timeSlot)?.label}
              </span>
            </div>
            <div className="text-brand-green font-semibold">
              {selectedZone?.fee === 0 ? 'Gratuit' : `${selectedZone?.fee} TND`}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Link
            href={`/get-started/customize?box=${boxType}&frequency=${frequency}`}
            className="text-brand-brown hover:text-brand-green transition-colors"
          >
            ← Retour
          </Link>
          <button
            onClick={handleContinue}
            className="px-8 py-4 bg-brand-green text-white rounded-lg font-semibold hover:bg-brand-green-dark transition-colors"
          >
            Continuer →
          </button>
        </div>
      </div>
    </main>
  )
}
```

### 1.4 Checkout Step Page

**File:** `frontend/src/app/get-started/checkout/page.tsx`

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'

interface FormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  address: string
  city: string
  postalCode: string
  paymentMethod: 'flouci' | 'cash'
  acceptTerms: boolean
}

const boxPrices: Record<string, number> = {
  trial: 33,
  essentiel: 45,
  famille: 75,
  gourmet: 120,
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()

  const boxType = searchParams.get('box') || 'essentiel'
  const frequency = searchParams.get('frequency') || 'weekly'

  const [customization, setCustomization] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<FormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'cash',
    acceptTerms: false,
  })

  useEffect(() => {
    const stored = sessionStorage.getItem('borgdanet-customization')
    if (stored) {
      setCustomization(JSON.parse(stored))
    }
  }, [])

  const boxPrice = boxPrices[boxType] || 45
  const zone = customization?.zone || 'ZONE_B'
  const deliveryFee = zone === 'ZONE_A' && boxPrice >= 80 ? 0 :
                      zone === 'ZONE_B' && boxPrice >= 120 ? 0 :
                      zone === 'ZONE_C' && boxPrice >= 150 ? 0 :
                      zone === 'ZONE_A' ? 5 :
                      zone === 'ZONE_B' ? 8 : 12
  const total = boxPrice + deliveryFee

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.acceptTerms) {
      setError('Veuillez accepter les conditions générales de vente')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Create subscription
      const response = await api.post('/subscriptions', {
        boxType,
        frequency,
        zone: customization?.zone,
        deliveryDay: customization?.deliveryDay,
        timeSlot: customization?.timeSlot,
        preferences: customization?.preferences,
        swaps: customization?.swaps,
        ...formData,
      })

      // Clear session storage
      sessionStorage.removeItem('borgdanet-customization')

      // Redirect to success
      router.push(`/get-started/success?id=${response.data.subscription.id}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-brand-cream py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Progress */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-sm">✓</div>
                </div>
                <div className="w-12 h-0.5 bg-brand-green" />
              </React.Fragment>
            ))}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-sm font-semibold">4</div>
              <span className="ml-2 text-brand-green font-medium">Finaliser</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl text-brand-green mb-2">
            Finalisez votre inscription
          </h1>
          <p className="text-brand-brown">Étape 4 sur 4</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="space-y-6">
              {/* Account Info */}
              {!user && (
                <div className="bg-white rounded-lg p-6">
                  <h2 className="font-semibold text-brand-green mb-4">Votre compte</h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-brand-brown text-sm mb-1">Prénom</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
                      />
                    </div>
                    <div>
                      <label className="block text-brand-brown text-sm mb-1">Nom</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-brand-brown text-sm mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-brand-brown text-sm mb-1">Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+216 XX XXX XXX"
                      required
                      className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-brown text-sm mb-1">Mot de passe</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
                    />
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="font-semibold text-brand-green mb-4">Adresse de livraison</h2>
                <div className="mb-4">
                  <label className="block text-brand-brown text-sm mb-1">Adresse</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-brand-brown text-sm mb-1">Ville</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-brown text-sm mb-1">Code postal</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="font-semibold text-brand-green mb-4">Paiement</h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border border-brand-cream-dark rounded-lg cursor-pointer hover:border-brand-green/50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="flouci"
                      checked={formData.paymentMethod === 'flouci'}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <span className="text-brand-brown">Flouci (Paiement en ligne)</span>
                  </label>
                  <label className="flex items-center p-4 border border-brand-cream-dark rounded-lg cursor-pointer hover:border-brand-green/50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={handleChange}
                      className="mr-3"
                    />
                    <span className="text-brand-brown">Espèces à la livraison</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div>
              <div className="bg-white rounded-lg p-6 sticky top-24">
                <h2 className="font-semibold text-brand-green mb-4">Récapitulatif</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-brand-brown">Box {boxType.charAt(0).toUpperCase() + boxType.slice(1)}</span>
                    <span className="font-medium text-brand-green">{boxPrice.toFixed(2)} TND</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-brown">Livraison ({zone.replace('_', ' ')})</span>
                    <span className="font-medium text-brand-green">
                      {deliveryFee === 0 ? 'Gratuit' : `${deliveryFee.toFixed(2)} TND`}
                    </span>
                  </div>
                  <hr className="border-brand-cream-dark" />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-brand-green">
                      Total {boxType === 'trial' ? '' : 'hebdomadaire'}
                    </span>
                    <span className="font-bold text-brand-green">{total.toFixed(2)} TND</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-brand-cream rounded-lg p-4 mb-6">
                  <p className="text-sm text-brand-brown">
                    <strong>Première livraison:</strong>
                    <br />
                    {customization?.deliveryDay === 'tuesday' ? 'Mardi' :
                     customization?.deliveryDay === 'thursday' ? 'Jeudi' : 'Samedi'},{' '}
                    {customization?.timeSlot === 'morning' ? '6h-9h' : '18h-21h'}
                  </p>
                </div>

                {/* Trust Indicators */}
                <div className="space-y-2 mb-6 text-sm text-brand-brown">
                  <p>✓ Modifiable à tout moment</p>
                  <p>✓ Annulation sans frais</p>
                  <p>✓ Satisfaction garantie</p>
                </div>

                {/* Terms */}
                <label className="flex items-start space-x-2 mb-6 cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <span className="text-sm text-brand-brown">
                    J'accepte les{' '}
                    <Link href="/terms" className="text-brand-green underline">
                      conditions générales de vente
                    </Link>
                  </span>
                </label>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-brand-green text-white rounded-lg font-semibold hover:bg-brand-green-dark transition-colors disabled:opacity-50"
                >
                  {loading ? 'Traitement...' : 'Confirmer mon abonnement'}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Back Link */}
        <div className="mt-8">
          <Link
            href={`/get-started/delivery?box=${boxType}&frequency=${frequency}`}
            className="text-brand-brown hover:text-brand-green transition-colors"
          >
            ← Retour
          </Link>
        </div>
      </div>
    </main>
  )
}
```

### 1.5 Success Page

**File:** `frontend/src/app/get-started/success/page.tsx`

```tsx
import Link from 'next/link'

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-brand-cream flex items-center justify-center py-12">
      <div className="container mx-auto px-4 max-w-lg text-center">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-display text-3xl text-brand-green mb-4">
            Bienvenue dans la famille Borgdanet!
          </h1>

          <p className="text-brand-brown mb-6">
            Votre abonnement est confirmé. Nos fermiers préparent déjà votre première box avec soin.
          </p>

          <div className="bg-brand-cream rounded-lg p-4 mb-6">
            <p className="text-sm text-brand-brown">
              Un email de confirmation a été envoyé à votre adresse.
              <br />
              Vous recevrez un SMS le jour de votre livraison.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/dashboard/subscriptions"
              className="block w-full py-3 bg-brand-green text-white rounded-lg font-semibold hover:bg-brand-green-dark transition-colors"
            >
              Voir mon abonnement
            </Link>
            <Link
              href="/farms"
              className="block w-full py-3 bg-brand-cream text-brand-green rounded-lg font-semibold hover:bg-brand-cream-dark transition-colors"
            >
              Découvrir nos fermes
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
```

---

## Step 2: Subscription Dashboard Components

### 2.1 Subscription Dashboard Page

**File:** `frontend/src/app/dashboard/subscriptions/page.tsx` (update existing)

```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { SubscriptionCard } from '@/components/subscription/SubscriptionCard'
import { UpcomingBox } from '@/components/subscription/UpcomingBox'

interface Subscription {
  id: string
  boxType: string
  status: string
  frequency: string
  nextDeliveryDate: string
  price: number
  farm?: { name: string }
}

export default function SubscriptionsDashboardPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await api.get('/subscriptions/my')
        setSubscriptions(response.data)
      } catch (error) {
        console.error('Failed to fetch subscriptions:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSubscriptions()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-brand-cream-dark rounded w-48" />
        <div className="h-64 bg-brand-cream-dark rounded" />
      </div>
    )
  }

  const activeSubscriptions = subscriptions.filter(s => s.status === 'ACTIVE')
  const pausedSubscriptions = subscriptions.filter(s => s.status === 'PAUSED')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl text-brand-green">
          Mes abonnements
        </h1>
        <Link
          href="/get-started"
          className="px-4 py-2 bg-brand-green text-white rounded-lg text-sm font-medium hover:bg-brand-green-dark transition-colors"
        >
          + Nouvel abonnement
        </Link>
      </div>

      {subscriptions.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="text-5xl mb-4">📦</div>
          <h2 className="font-display text-xl text-brand-green mb-2">
            Pas encore d'abonnement
          </h2>
          <p className="text-brand-brown mb-6">
            Découvrez nos formules et recevez le meilleur de nos fermes chaque semaine.
          </p>
          <Link
            href="/get-started"
            className="inline-flex px-6 py-3 bg-brand-green text-white rounded-lg font-semibold hover:bg-brand-green-dark transition-colors"
          >
            Commencer
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Subscriptions */}
          {activeSubscriptions.length > 0 && (
            <section>
              <h2 className="font-semibold text-brand-green mb-4">
                Abonnements actifs ({activeSubscriptions.length})
              </h2>
              <div className="space-y-4">
                {activeSubscriptions.map((sub) => (
                  <SubscriptionCard key={sub.id} subscription={sub} />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Box Preview */}
          {activeSubscriptions.length > 0 && (
            <section>
              <h2 className="font-semibold text-brand-green mb-4">
                Votre prochaine box
              </h2>
              <UpcomingBox subscriptionId={activeSubscriptions[0].id} />
            </section>
          )}

          {/* Paused Subscriptions */}
          {pausedSubscriptions.length > 0 && (
            <section>
              <h2 className="font-semibold text-brand-brown mb-4">
                Abonnements en pause ({pausedSubscriptions.length})
              </h2>
              <div className="space-y-4">
                {pausedSubscriptions.map((sub) => (
                  <SubscriptionCard key={sub.id} subscription={sub} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
```

### 2.2 Subscription Card Component

**File:** `frontend/src/components/subscription/SubscriptionCard.tsx`

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'

interface SubscriptionCardProps {
  subscription: {
    id: string
    boxType: string
    status: string
    frequency: string
    nextDeliveryDate: string
    price: number
    farm?: { name: string }
  }
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const [status, setStatus] = useState(subscription.status)
  const [loading, setLoading] = useState(false)

  const handlePause = async () => {
    setLoading(true)
    try {
      await api.post(`/subscriptions/${subscription.id}/pause`)
      setStatus('PAUSED')
    } catch (error) {
      console.error('Failed to pause subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResume = async () => {
    setLoading(true)
    try {
      await api.post(`/subscriptions/${subscription.id}/resume`)
      setStatus('ACTIVE')
    } catch (error) {
      console.error('Failed to resume subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    setLoading(true)
    try {
      await api.post(`/subscriptions/${subscription.id}/skip`)
      // Refresh or update UI
    } catch (error) {
      console.error('Failed to skip delivery:', error)
    } finally {
      setLoading(false)
    }
  }

  const nextDate = new Date(subscription.nextDeliveryDate)
  const formattedDate = nextDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="bg-white rounded-lg p-6 border border-brand-cream-dark">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-display text-xl text-brand-green">
              Box {subscription.boxType.charAt(0).toUpperCase() + subscription.boxType.slice(1)}
            </h3>
            <span className={`px-2 py-1 text-xs rounded-full ${
              status === 'ACTIVE'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {status === 'ACTIVE' ? 'Actif' : 'En pause'}
            </span>
          </div>
          <p className="text-brand-brown">
            {subscription.price} TND/{subscription.frequency === 'weekly' ? 'semaine' : '2 semaines'}
          </p>
          {status === 'ACTIVE' && (
            <p className="text-sm text-brand-brown mt-1">
              Prochaine livraison: <strong>{formattedDate}</strong>
            </p>
          )}
        </div>

        <div className="flex gap-2">
          {status === 'ACTIVE' ? (
            <>
              <button
                onClick={handleSkip}
                disabled={loading}
                className="px-4 py-2 text-sm text-brand-brown border border-brand-cream-dark rounded-lg hover:bg-brand-cream transition-colors disabled:opacity-50"
              >
                Passer cette semaine
              </button>
              <button
                onClick={handlePause}
                disabled={loading}
                className="px-4 py-2 text-sm text-brand-gold border border-brand-gold rounded-lg hover:bg-brand-gold/10 transition-colors disabled:opacity-50"
              >
                Pauser
              </button>
            </>
          ) : (
            <button
              onClick={handleResume}
              disabled={loading}
              className="px-4 py-2 text-sm text-white bg-brand-green rounded-lg hover:bg-brand-green-dark transition-colors disabled:opacity-50"
            >
              Reprendre
            </button>
          )}
          <Link
            href={`/dashboard/subscriptions/${subscription.id}`}
            className="px-4 py-2 text-sm text-brand-green border border-brand-green rounded-lg hover:bg-brand-green/10 transition-colors"
          >
            Modifier
          </Link>
        </div>
      </div>
    </div>
  )
}
```

### 2.3 Upcoming Box Component

**File:** `frontend/src/components/subscription/UpcomingBox.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { api } from '@/lib/api'

interface Product {
  id: string
  name: string
  quantity: string
  image: string | null
  farm: { name: string }
}

interface UpcomingBoxProps {
  subscriptionId: string
}

export function UpcomingBox({ subscriptionId }: UpcomingBoxProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deadline, setDeadline] = useState<string>('')

  useEffect(() => {
    const fetchUpcomingBox = async () => {
      try {
        const response = await api.get(`/subscriptions/${subscriptionId}/upcoming`)
        setProducts(response.data.products)
        setDeadline(response.data.modificationDeadline)
      } catch (error) {
        // Mock data
        setProducts([
          { id: '1', name: 'Tomates heirloom', quantity: '1kg', image: null, farm: { name: 'Ferme Ben Salah' } },
          { id: '2', name: 'Courgettes bio', quantity: '500g', image: null, farm: { name: 'Ferme Ben Salah' } },
          { id: '3', name: 'Oranges Hammamet', quantity: '2kg', image: null, farm: { name: 'Domaine Zaghouan' } },
        ])
        setDeadline('Mardi 13 Dec, 18h')
      } finally {
        setLoading(false)
      }
    }
    fetchUpcomingBox()
  }, [subscriptionId])

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-brand-cream-dark rounded w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-brand-cream-dark rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-brand-cream-dark">
      <div className="space-y-3 mb-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-3 bg-brand-cream rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                {product.image ? (
                  <Image src={product.image} alt={product.name} width={48} height={48} className="rounded-lg" />
                ) : (
                  <span className="text-2xl">🥬</span>
                )}
              </div>
              <div>
                <div className="font-medium text-brand-green">{product.name}</div>
                <div className="text-sm text-brand-brown">
                  {product.farm.name} • {product.quantity}
                </div>
              </div>
            </div>
            <button className="text-sm text-brand-green hover:underline">
              Échanger
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-brand-cream-dark">
        <p className="text-sm text-brand-brown">
          Date limite de modification: <strong>{deadline}</strong>
        </p>
        <button className="text-sm text-brand-green font-medium hover:underline">
          Voir tous les produits →
        </button>
      </div>
    </div>
  )
}
```

### 2.4 Export Subscription Components

**File:** `frontend/src/components/subscription/index.ts`

```typescript
export { SubscriptionCard } from './SubscriptionCard'
export { UpcomingBox } from './UpcomingBox'
```

---

## Step 3: Backend Subscription Enhancements

### 3.1 Enhanced Subscription Controller

**File:** `backend/src/controllers/subscription.controller.ts` (add to existing)

```typescript
// Add these methods to existing controller

export const pauseSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const subscription = await prisma.subscription.findFirst({
      where: { id, userId },
    })

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' })
    }

    // Check pause limit (4 per year)
    const yearStart = new Date()
    yearStart.setMonth(0, 1)
    yearStart.setHours(0, 0, 0, 0)

    const pauseCount = await prisma.subscriptionPause.count({
      where: {
        subscriptionId: id,
        createdAt: { gte: yearStart },
      },
    })

    if (pauseCount >= 4) {
      return res.status(400).json({
        error: 'Maximum 4 pauses per year reached',
      })
    }

    // Update subscription and create pause record
    const [updated] = await prisma.$transaction([
      prisma.subscription.update({
        where: { id },
        data: { status: 'PAUSED' },
      }),
      prisma.subscriptionPause.create({
        data: {
          subscriptionId: id,
          reason: req.body.reason || 'User requested pause',
        },
      }),
    ])

    res.json({ subscription: updated })
  } catch (error) {
    console.error('Error pausing subscription:', error)
    res.status(500).json({ error: 'Failed to pause subscription' })
  }
}

export const resumeSubscription = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const subscription = await prisma.subscription.update({
      where: { id, userId },
      data: { status: 'ACTIVE' },
    })

    res.json({ subscription })
  } catch (error) {
    console.error('Error resuming subscription:', error)
    res.status(500).json({ error: 'Failed to resume subscription' })
  }
}

export const skipDelivery = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    // Check skip limit (2 per month)
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const skipCount = await prisma.subscriptionSkip.count({
      where: {
        subscriptionId: id,
        createdAt: { gte: monthStart },
      },
    })

    if (skipCount >= 2) {
      return res.status(400).json({
        error: 'Maximum 2 skips per month reached',
      })
    }

    // Create skip record
    const skip = await prisma.subscriptionSkip.create({
      data: {
        subscriptionId: id,
        skipDate: new Date(), // Next delivery date
      },
    })

    res.json({ skip })
  } catch (error) {
    console.error('Error skipping delivery:', error)
    res.status(500).json({ error: 'Failed to skip delivery' })
  }
}

export const getUpcomingBox = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const subscription = await prisma.subscription.findFirst({
      where: { id, userId },
      include: { farm: true },
    })

    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' })
    }

    // Get products for the box based on type and season
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: { gt: 0 },
      },
      include: { farm: { select: { name: true } } },
      take: subscription.boxSize === 'SMALL' ? 8 :
            subscription.boxSize === 'MEDIUM' ? 12 : 15,
    })

    // Calculate modification deadline (2 days before delivery)
    const nextDelivery = new Date(subscription.nextDeliveryDate)
    const deadline = new Date(nextDelivery)
    deadline.setDate(deadline.getDate() - 2)

    res.json({
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        quantity: `${p.unit}`,
        image: p.image,
        farm: p.farm,
      })),
      modificationDeadline: deadline.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    })
  } catch (error) {
    console.error('Error fetching upcoming box:', error)
    res.status(500).json({ error: 'Failed to fetch upcoming box' })
  }
}

export const getBoxPreview = async (req: Request, res: Response) => {
  try {
    const { type } = req.query

    const productCount = type === 'essentiel' || type === 'trial' ? 8 :
                        type === 'famille' ? 15 : 20

    const included = await prisma.product.findMany({
      where: { isActive: true, stock: { gt: 0 } },
      include: { farm: { select: { name: true } } },
      take: productCount,
    })

    const alternatives = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: { gt: 0 },
        id: { notIn: included.map(p => p.id) },
      },
      include: { farm: { select: { name: true } } },
      take: 6,
    })

    res.json({
      included: included.map(p => ({
        id: p.id,
        name: p.name,
        image: p.image,
        farm: p.farm,
        unit: p.unit,
      })),
      alternatives: alternatives.map(p => ({
        id: p.id,
        name: p.name,
        image: p.image,
        farm: p.farm,
        unit: p.unit,
      })),
    })
  } catch (error) {
    console.error('Error fetching box preview:', error)
    res.status(500).json({ error: 'Failed to fetch box preview' })
  }
}
```

### 3.2 Updated Subscription Routes

**File:** `backend/src/routes/subscription.routes.ts` (add to existing)

```typescript
import { authMiddleware } from '../middleware/auth.middleware'
import {
  pauseSubscription,
  resumeSubscription,
  skipDelivery,
  getUpcomingBox,
  getBoxPreview,
} from '../controllers/subscription.controller'

// Add these routes
router.get('/box-preview', getBoxPreview)
router.post('/:id/pause', authMiddleware, pauseSubscription)
router.post('/:id/resume', authMiddleware, resumeSubscription)
router.post('/:id/skip', authMiddleware, skipDelivery)
router.get('/:id/upcoming', authMiddleware, getUpcomingBox)
```

### 3.3 Database Additions

**File:** `backend/prisma/schema.prisma` (add to existing)

```prisma
model SubscriptionPause {
  id              String       @id @default(cuid())
  subscriptionId  String
  subscription    Subscription @relation(fields: [subscriptionId], references: [id])
  reason          String?
  createdAt       DateTime     @default(now())
}

model SubscriptionSkip {
  id              String       @id @default(cuid())
  subscriptionId  String
  subscription    Subscription @relation(fields: [subscriptionId], references: [id])
  skipDate        DateTime
  createdAt       DateTime     @default(now())
}

// Add to Subscription model
model Subscription {
  // ... existing fields
  pauses          SubscriptionPause[]
  skips           SubscriptionSkip[]
}
```

---

## Step 4: Testing Checklist

### 4.1 Onboarding Flow
- [ ] Box selection works correctly
- [ ] Trial box shows discounted price
- [ ] Frequency selection appears for subscriptions only
- [ ] Customization page loads products
- [ ] Product swaps work correctly
- [ ] Dietary preferences save
- [ ] Delivery zone selection works
- [ ] Day and time slot selection work
- [ ] Checkout form validates correctly
- [ ] Subscription creates successfully
- [ ] Success page displays

### 4.2 Subscription Dashboard
- [ ] Subscriptions list loads
- [ ] Active/paused status displays correctly
- [ ] Pause button works (with limit check)
- [ ] Resume button works
- [ ] Skip button works (with limit check)
- [ ] Upcoming box displays products
- [ ] Modification deadline displays

### 4.3 API Endpoints
- [ ] GET /subscriptions/box-preview returns products
- [ ] POST /subscriptions creates subscription
- [ ] POST /subscriptions/:id/pause pauses
- [ ] POST /subscriptions/:id/resume resumes
- [ ] POST /subscriptions/:id/skip skips
- [ ] GET /subscriptions/:id/upcoming returns box contents

---

## Summary

Phase 2 creates a streamlined subscription onboarding experience and enhanced subscription management dashboard.

**Files Created:** ~12
**Files Modified:** ~8
**New API Endpoints:** 5

**Next Phase:** [Phase 3: Farm Experience](./03-PHASE-FARM-EXPERIENCE.md)
