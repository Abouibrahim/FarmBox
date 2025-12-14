# Phase 4: Shopping Experience

> **Redesign cart, optimize checkout, and enhance order tracking**

---

## Phase Overview

| Aspect | Details |
|--------|---------|
| **Priority** | High |
| **Dependencies** | Phase 1 (Brand) |
| **Files to Create** | ~6 new files |
| **Files to Modify** | ~8 existing files |

---

## Step 1: Cart Redesign

### 1.1 Enhanced Cart Page

**File:** `frontend/src/app/cart/page.tsx` (update existing)

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore, CartItem } from '@/store/cart'
import { EmptyCart } from '@/components/cart/EmptyCart'
import { CartSummary } from '@/components/cart/CartSummary'

const deliveryFees: Record<string, { fee: number; freeThreshold: number }> = {
  ZONE_A: { fee: 5, freeThreshold: 80 },
  ZONE_B: { fee: 8, freeThreshold: 120 },
  ZONE_C: { fee: 12, freeThreshold: 150 },
}

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    getSubtotal,
    getItemsByFarm,
    clearCart,
  } = useCartStore()

  const [selectedZone, setSelectedZone] = useState<string>('ZONE_B')

  const subtotal = getSubtotal()
  const zoneConfig = deliveryFees[selectedZone]
  const deliveryFee = subtotal >= zoneConfig.freeThreshold ? 0 : zoneConfig.fee
  const total = subtotal + deliveryFee
  const amountForFreeDelivery = zoneConfig.freeThreshold - subtotal

  const itemsByFarm = getItemsByFarm()
  const farmIds = Object.keys(itemsByFarm)

  if (items.length === 0) {
    return <EmptyCart />
  }

  return (
    <main className="min-h-screen bg-brand-cream py-8">
      <div className="container mx-auto px-4">
        <h1 className="font-display text-3xl text-brand-green mb-8">
          Votre panier ({items.length} article{items.length > 1 ? 's' : ''})
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {farmIds.map((farmId) => {
              const farmItems = itemsByFarm[farmId]
              const farmName = farmItems[0]?.farmName || 'Ferme'

              return (
                <div
                  key={farmId}
                  className="bg-white rounded-lg overflow-hidden shadow-sm"
                >
                  {/* Farm Header */}
                  <div className="bg-brand-cream px-4 py-3 flex items-center gap-2">
                    <span className="text-xl">🌱</span>
                    <Link
                      href={`/farms/${farmId}`}
                      className="font-semibold text-brand-green hover:underline"
                    >
                      {farmName}
                    </Link>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-brand-cream">
                    {farmItems.map((item) => (
                      <CartItemRow
                        key={item.productId}
                        item={item}
                        onUpdateQuantity={(qty) => updateQuantity(item.productId, qty)}
                        onRemove={() => removeItem(item.productId)}
                      />
                    ))}
                  </div>

                  {/* Farm Subtotal */}
                  <div className="px-4 py-3 bg-brand-cream/50 text-right">
                    <span className="text-brand-brown">Sous-total: </span>
                    <span className="font-semibold text-brand-green">
                      {farmItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)} TND
                    </span>
                  </div>
                </div>
              )
            })}

            {/* Clear Cart */}
            <button
              onClick={clearCart}
              className="text-sm text-brand-brown hover:text-red-600 transition-colors"
            >
              Vider le panier
            </button>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <CartSummary
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              total={total}
              selectedZone={selectedZone}
              onZoneChange={setSelectedZone}
              amountForFreeDelivery={amountForFreeDelivery}
            />
          </div>
        </div>
      </div>
    </main>
  )
}

// Cart Item Row Component
function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem
  onUpdateQuantity: (qty: number) => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-4 p-4">
      {/* Product Image */}
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-brand-cream flex-shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            width={80}
            height={80}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            🥬
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-brand-green truncate">{item.name}</h3>
        <p className="text-sm text-brand-brown">
          {item.price.toFixed(2)} TND / {item.unit}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
          className="w-8 h-8 rounded-full bg-brand-cream text-brand-green flex items-center justify-center hover:bg-brand-cream-dark transition-colors"
        >
          -
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.quantity + 1)}
          className="w-8 h-8 rounded-full bg-brand-cream text-brand-green flex items-center justify-center hover:bg-brand-cream-dark transition-colors"
        >
          +
        </button>
      </div>

      {/* Item Total */}
      <div className="w-24 text-right">
        <span className="font-semibold text-brand-green">
          {(item.price * item.quantity).toFixed(2)} TND
        </span>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
```

### 1.2 Empty Cart Component

**File:** `frontend/src/components/cart/EmptyCart.tsx`

```tsx
import Link from 'next/link'

export function EmptyCart() {
  return (
    <main className="min-h-screen bg-brand-cream flex items-center justify-center py-12">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="font-display text-2xl text-brand-green mb-4">
          Votre panier est vide
        </h1>
        <p className="text-brand-brown mb-8">
          Votre panier attend les trésors de nos fermes.
          Commençons par découvrir nos produits de saison!
        </p>
        <div className="space-y-3">
          <Link
            href="/shop"
            className="block w-full py-3 bg-brand-green text-white rounded-lg font-semibold hover:bg-brand-green-dark transition-colors"
          >
            Découvrir les produits
          </Link>
          <Link
            href="/farms"
            className="block w-full py-3 bg-brand-cream text-brand-green rounded-lg font-semibold hover:bg-brand-cream-dark transition-colors"
          >
            Explorer les fermes
          </Link>
        </div>
      </div>
    </main>
  )
}
```

### 1.3 Cart Summary Component

**File:** `frontend/src/components/cart/CartSummary.tsx`

```tsx
import Link from 'next/link'

interface CartSummaryProps {
  subtotal: number
  deliveryFee: number
  total: number
  selectedZone: string
  onZoneChange: (zone: string) => void
  amountForFreeDelivery: number
}

const zones = [
  { id: 'ZONE_A', label: 'Zone A - Tunis centre', freeAt: 80 },
  { id: 'ZONE_B', label: 'Zone B - Banlieue', freeAt: 120 },
  { id: 'ZONE_C', label: 'Zone C - Périphérie', freeAt: 150 },
]

export function CartSummary({
  subtotal,
  deliveryFee,
  total,
  selectedZone,
  onZoneChange,
  amountForFreeDelivery,
}: CartSummaryProps) {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm sticky top-24">
      <h2 className="font-display text-xl text-brand-green mb-6">
        Récapitulatif
      </h2>

      {/* Zone Selection */}
      <div className="mb-6">
        <label className="block text-sm text-brand-brown mb-2">
          Zone de livraison
        </label>
        <select
          value={selectedZone}
          onChange={(e) => onZoneChange(e.target.value)}
          className="w-full px-4 py-2 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
        >
          {zones.map((zone) => (
            <option key={zone.id} value={zone.id}>
              {zone.label}
            </option>
          ))}
        </select>
      </div>

      {/* Totals */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-brand-brown">
          <span>Sous-total produits</span>
          <span>{subtotal.toFixed(2)} TND</span>
        </div>
        <div className="flex justify-between text-brand-brown">
          <span>Livraison</span>
          <span className={deliveryFee === 0 ? 'text-brand-green font-medium' : ''}>
            {deliveryFee === 0 ? 'Gratuit' : `${deliveryFee.toFixed(2)} TND`}
          </span>
        </div>
        <hr className="border-brand-cream-dark" />
        <div className="flex justify-between text-lg">
          <span className="font-semibold text-brand-green">Total</span>
          <span className="font-bold text-brand-green">{total.toFixed(2)} TND</span>
        </div>
      </div>

      {/* Free Delivery Progress */}
      {amountForFreeDelivery > 0 && (
        <div className="mb-6 p-4 bg-brand-gold/10 rounded-lg">
          <p className="text-sm text-brand-brown">
            💡 Ajoutez <strong>{amountForFreeDelivery.toFixed(2)} TND</strong> pour
            la livraison gratuite!
          </p>
          <div className="mt-2 h-2 bg-brand-cream rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-gold transition-all"
              style={{
                width: `${Math.min(100, (subtotal / (subtotal + amountForFreeDelivery)) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Checkout Button */}
      <Link
        href={`/checkout?zone=${selectedZone}`}
        className="block w-full py-4 bg-brand-green text-white text-center rounded-lg font-semibold hover:bg-brand-green-dark transition-colors"
      >
        Commander
      </Link>

      {/* Trust Indicators */}
      <div className="mt-6 space-y-2 text-xs text-brand-brown">
        <p>✓ Paiement sécurisé</p>
        <p>✓ Livraison fraîcheur garantie</p>
        <p>✓ Satisfaction garantie 100%</p>
      </div>
    </div>
  )
}
```

---

## Step 2: Checkout Optimization

### 2.1 Streamlined Checkout Page

**File:** `frontend/src/app/checkout/page.tsx` (update existing)

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth'
import { useCartStore } from '@/store/cart'
import { api } from '@/lib/api'
import { CheckoutDelivery } from '@/components/checkout/CheckoutDelivery'
import { CheckoutPayment } from '@/components/checkout/CheckoutPayment'
import { CheckoutSummary } from '@/components/checkout/CheckoutSummary'

type DeliveryType = 'delivery' | 'pickup'
type PaymentMethod = 'flouci' | 'cash'

const deliveryFees: Record<string, { fee: number; freeThreshold: number }> = {
  ZONE_A: { fee: 5, freeThreshold: 80 },
  ZONE_B: { fee: 8, freeThreshold: 120 },
  ZONE_C: { fee: 12, freeThreshold: 150 },
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()
  const { items, getSubtotal, getItemsByFarm, clearCart } = useCartStore()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery')
  const [zone, setZone] = useState(searchParams.get('zone') || 'ZONE_B')
  const [deliveryDay, setDeliveryDay] = useState('thursday')
  const [timeSlot, setTimeSlot] = useState('evening')
  const [pickupPointId, setPickupPointId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Address form (for non-logged users or new address)
  const [address, setAddress] = useState({
    street: user?.address || '',
    city: user?.city || '',
    postalCode: user?.postalCode || '',
    phone: user?.phone || '',
  })

  const subtotal = getSubtotal()
  const zoneConfig = deliveryFees[zone]
  const deliveryFee = deliveryType === 'pickup' ? 0 :
    (subtotal >= zoneConfig.freeThreshold ? 0 : zoneConfig.fee)
  const total = subtotal + deliveryFee

  const itemsByFarm = getItemsByFarm()

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart')
    }
  }, [items, router])

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push(`/login?redirect=/checkout?zone=${zone}`)
    }
  }, [user, router, zone])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptTerms) {
      setError('Veuillez accepter les conditions générales de vente')
      return
    }

    setLoading(true)
    setError('')

    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        deliveryType,
        zone: deliveryType === 'delivery' ? zone : undefined,
        deliveryDay,
        timeSlot,
        pickupPointId: deliveryType === 'pickup' ? pickupPointId : undefined,
        paymentMethod,
        address: deliveryType === 'delivery' ? address : undefined,
        deliveryFee,
        subtotal,
        total,
      }

      const response = await api.post('/orders/unified', orderData)

      // Clear cart and redirect to confirmation
      clearCart()
      router.push(`/orders/${response.data.order.id}/confirmation`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  if (!user || items.length === 0) {
    return null
  }

  return (
    <main className="min-h-screen bg-brand-cream py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="font-display text-3xl text-brand-green mb-8">
          Finaliser ma commande
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Section */}
              <CheckoutDelivery
                deliveryType={deliveryType}
                onDeliveryTypeChange={setDeliveryType}
                zone={zone}
                onZoneChange={setZone}
                deliveryDay={deliveryDay}
                onDeliveryDayChange={setDeliveryDay}
                timeSlot={timeSlot}
                onTimeSlotChange={setTimeSlot}
                pickupPointId={pickupPointId}
                onPickupPointChange={setPickupPointId}
                address={address}
                onAddressChange={setAddress}
              />

              {/* Payment Section */}
              <CheckoutPayment
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
              />

              {/* Terms */}
              <div className="bg-white rounded-lg p-6">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1"
                  />
                  <span className="text-sm text-brand-brown">
                    J'accepte les{' '}
                    <Link href="/terms" className="text-brand-green underline">
                      conditions générales de vente
                    </Link>{' '}
                    et la{' '}
                    <Link href="/privacy" className="text-brand-green underline">
                      politique de confidentialité
                    </Link>
                  </span>
                </label>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <CheckoutSummary
                itemsByFarm={itemsByFarm}
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                total={total}
                deliveryType={deliveryType}
                zone={zone}
                loading={loading}
                error={error}
              />
            </div>
          </div>
        </form>
      </div>
    </main>
  )
}
```

### 2.2 Checkout Delivery Component

**File:** `frontend/src/components/checkout/CheckoutDelivery.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface PickupPoint {
  id: string
  name: string
  address: string
  zone: string
}

interface CheckoutDeliveryProps {
  deliveryType: 'delivery' | 'pickup'
  onDeliveryTypeChange: (type: 'delivery' | 'pickup') => void
  zone: string
  onZoneChange: (zone: string) => void
  deliveryDay: string
  onDeliveryDayChange: (day: string) => void
  timeSlot: string
  onTimeSlotChange: (slot: string) => void
  pickupPointId: string
  onPickupPointChange: (id: string) => void
  address: {
    street: string
    city: string
    postalCode: string
    phone: string
  }
  onAddressChange: (address: any) => void
}

const zones = [
  { id: 'ZONE_A', label: 'Zone A - Tunis centre' },
  { id: 'ZONE_B', label: 'Zone B - Banlieue' },
  { id: 'ZONE_C', label: 'Zone C - Périphérie' },
]

const deliveryDays = [
  { id: 'tuesday', label: 'Mardi' },
  { id: 'thursday', label: 'Jeudi' },
  { id: 'saturday', label: 'Samedi' },
]

const timeSlots = [
  { id: 'morning', label: 'Matin (6h-9h)' },
  { id: 'evening', label: 'Soir (18h-21h)' },
]

export function CheckoutDelivery({
  deliveryType,
  onDeliveryTypeChange,
  zone,
  onZoneChange,
  deliveryDay,
  onDeliveryDayChange,
  timeSlot,
  onTimeSlotChange,
  pickupPointId,
  onPickupPointChange,
  address,
  onAddressChange,
}: CheckoutDeliveryProps) {
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([])

  useEffect(() => {
    if (deliveryType === 'pickup') {
      const fetchPickupPoints = async () => {
        try {
          const response = await api.get('/pickup-points')
          setPickupPoints(response.data)
        } catch (error) {
          console.error('Failed to fetch pickup points:', error)
        }
      }
      fetchPickupPoints()
    }
  }, [deliveryType])

  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="font-display text-xl text-brand-green mb-6">
        1. Livraison
      </h2>

      {/* Delivery Type Selection */}
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => onDeliveryTypeChange('delivery')}
          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
            deliveryType === 'delivery'
              ? 'border-brand-green bg-brand-cream'
              : 'border-brand-cream-dark hover:border-brand-green/50'
          }`}
        >
          <div className="font-semibold text-brand-green">🚚 Livraison à domicile</div>
          <div className="text-sm text-brand-brown">Recevez chez vous</div>
        </button>
        <button
          type="button"
          onClick={() => onDeliveryTypeChange('pickup')}
          className={`flex-1 p-4 rounded-lg border-2 transition-all ${
            deliveryType === 'pickup'
              ? 'border-brand-green bg-brand-cream'
              : 'border-brand-cream-dark hover:border-brand-green/50'
          }`}
        >
          <div className="font-semibold text-brand-green">📍 Point de retrait</div>
          <div className="text-sm text-brand-brown">Livraison gratuite</div>
        </button>
      </div>

      {deliveryType === 'delivery' ? (
        <>
          {/* Zone Selection */}
          <div className="mb-4">
            <label className="block text-brand-brown text-sm mb-2">Zone</label>
            <select
              value={zone}
              onChange={(e) => onZoneChange(e.target.value)}
              className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.label}</option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="col-span-2">
              <label className="block text-brand-brown text-sm mb-2">Adresse</label>
              <input
                type="text"
                value={address.street}
                onChange={(e) => onAddressChange({ ...address, street: e.target.value })}
                required
                className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
              />
            </div>
            <div>
              <label className="block text-brand-brown text-sm mb-2">Ville</label>
              <input
                type="text"
                value={address.city}
                onChange={(e) => onAddressChange({ ...address, city: e.target.value })}
                required
                className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
              />
            </div>
            <div>
              <label className="block text-brand-brown text-sm mb-2">Code postal</label>
              <input
                type="text"
                value={address.postalCode}
                onChange={(e) => onAddressChange({ ...address, postalCode: e.target.value })}
                required
                className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-brand-brown text-sm mb-2">Téléphone</label>
              <input
                type="tel"
                value={address.phone}
                onChange={(e) => onAddressChange({ ...address, phone: e.target.value })}
                required
                placeholder="+216 XX XXX XXX"
                className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
              />
            </div>
          </div>
        </>
      ) : (
        <div className="mb-4">
          <label className="block text-brand-brown text-sm mb-2">Point de retrait</label>
          <select
            value={pickupPointId}
            onChange={(e) => onPickupPointChange(e.target.value)}
            required
            className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
          >
            <option value="">Sélectionner un point</option>
            {pickupPoints.map((point) => (
              <option key={point.id} value={point.id}>
                {point.name} - {point.address}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Delivery Schedule */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-brand-brown text-sm mb-2">Jour</label>
          <select
            value={deliveryDay}
            onChange={(e) => onDeliveryDayChange(e.target.value)}
            className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
          >
            {deliveryDays.map((day) => (
              <option key={day.id} value={day.id}>{day.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-brand-brown text-sm mb-2">Créneau</label>
          <select
            value={timeSlot}
            onChange={(e) => onTimeSlotChange(e.target.value)}
            className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green"
          >
            {timeSlots.map((slot) => (
              <option key={slot.id} value={slot.id}>{slot.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
```

### 2.3 Checkout Summary Component

**File:** `frontend/src/components/checkout/CheckoutSummary.tsx`

```tsx
import Image from 'next/image'
import { CartItem } from '@/store/cart'

interface CheckoutSummaryProps {
  itemsByFarm: Record<string, CartItem[]>
  subtotal: number
  deliveryFee: number
  total: number
  deliveryType: 'delivery' | 'pickup'
  zone: string
  loading: boolean
  error: string
}

export function CheckoutSummary({
  itemsByFarm,
  subtotal,
  deliveryFee,
  total,
  deliveryType,
  zone,
  loading,
  error,
}: CheckoutSummaryProps) {
  const farmCount = Object.keys(itemsByFarm).length
  const itemCount = Object.values(itemsByFarm).flat().length

  return (
    <div className="bg-white rounded-lg p-6 sticky top-24">
      <h2 className="font-display text-xl text-brand-green mb-6">
        Récapitulatif
      </h2>

      {/* Items Summary */}
      <div className="mb-6">
        <p className="text-sm text-brand-brown mb-3">
          {itemCount} article{itemCount > 1 ? 's' : ''} de {farmCount} ferme{farmCount > 1 ? 's' : ''}
        </p>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {Object.entries(itemsByFarm).map(([farmId, items]) => (
            <div key={farmId}>
              <p className="text-xs text-brand-brown font-medium">
                {items[0].farmName}
              </p>
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm py-1">
                  <span className="text-brand-brown">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="text-brand-green">
                    {(item.price * item.quantity).toFixed(2)} TND
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="space-y-3 mb-6 pt-4 border-t border-brand-cream-dark">
        <div className="flex justify-between text-brand-brown">
          <span>Sous-total</span>
          <span>{subtotal.toFixed(2)} TND</span>
        </div>
        <div className="flex justify-between text-brand-brown">
          <span>
            Livraison
            {deliveryType === 'delivery' && (
              <span className="text-xs ml-1">({zone.replace('_', ' ')})</span>
            )}
          </span>
          <span className={deliveryFee === 0 ? 'text-brand-green font-medium' : ''}>
            {deliveryFee === 0 ? 'Gratuit' : `${deliveryFee.toFixed(2)} TND`}
          </span>
        </div>
        <hr className="border-brand-cream-dark" />
        <div className="flex justify-between text-lg">
          <span className="font-semibold text-brand-green">Total</span>
          <span className="font-bold text-brand-green">{total.toFixed(2)} TND</span>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="space-y-2 mb-6 text-sm text-brand-brown">
        <p>✓ Satisfaction garantie</p>
        <p>✓ Fraîcheur garantie</p>
        <p>✓ Support client réactif</p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-4 bg-brand-green text-white rounded-lg font-semibold hover:bg-brand-green-dark transition-colors disabled:opacity-50"
      >
        {loading ? 'Traitement...' : 'Confirmer ma commande'}
      </button>
    </div>
  )
}
```

---

## Step 3: Order Tracking

### 3.1 Order Confirmation Page

**File:** `frontend/src/app/orders/[id]/confirmation/page.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

interface Order {
  id: string
  status: string
  totalAmount: number
  deliveryDate: string
  deliveryTimeSlot: string
  items: {
    product: { name: string }
    quantity: number
  }[]
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${params.id}`)
        setOrder(response.data)
      } catch (error) {
        console.error('Failed to fetch order:', error)
      }
    }
    fetchOrder()
  }, [params.id])

  if (!order) {
    return (
      <main className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="animate-pulse">Chargement...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-brand-cream py-12">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="bg-white rounded-lg p-8 text-center shadow-lg">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-display text-3xl text-brand-green mb-4">
            Merci pour votre commande!
          </h1>

          <p className="text-brand-brown mb-6">
            Votre commande #{order.id.slice(-8).toUpperCase()} a été confirmée.
            Nos fermiers préparent vos produits avec soin.
          </p>

          {/* Order Details */}
          <div className="bg-brand-cream rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-brand-green mb-2">Détails</h3>
            <p className="text-sm text-brand-brown">
              <strong>Livraison:</strong> {new Date(order.deliveryDate).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}, {order.deliveryTimeSlot === 'morning' ? '6h-9h' : '18h-21h'}
            </p>
            <p className="text-sm text-brand-brown">
              <strong>Total:</strong> {Number(order.totalAmount).toFixed(2)} TND
            </p>
            <p className="text-sm text-brand-brown">
              <strong>Articles:</strong> {order.items.length}
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href={`/orders/${order.id}`}
              className="block w-full py-3 bg-brand-green text-white rounded-lg font-semibold hover:bg-brand-green-dark transition-colors"
            >
              Suivre ma commande
            </Link>
            <Link
              href="/dashboard/orders"
              className="block w-full py-3 bg-brand-cream text-brand-green rounded-lg font-semibold hover:bg-brand-cream-dark transition-colors"
            >
              Voir mes commandes
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
```

### 3.2 Order Tracking Page

**File:** `frontend/src/app/orders/[id]/page.tsx`

```tsx
'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'

const statusSteps = [
  { id: 'CONFIRMED', label: 'Confirmée', icon: '✓' },
  { id: 'PREPARING', label: 'En préparation', icon: '📦' },
  { id: 'OUT_FOR_DELIVERY', label: 'En route', icon: '🚚' },
  { id: 'DELIVERED', label: 'Livrée', icon: '🎉' },
]

interface Order {
  id: string
  status: string
  totalAmount: number
  deliveryDate: string
  deliveryTimeSlot: string
  zone: string
  items: {
    id: string
    quantity: number
    product: {
      name: string
      price: number
      farm: { name: string }
    }
  }[]
}

export default function OrderTrackingPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${params.id}`)
        setOrder(response.data)
      } catch (error) {
        console.error('Failed to fetch order:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [params.id])

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-cream py-8">
        <div className="container mx-auto px-4 animate-pulse">
          <div className="h-8 bg-brand-cream-dark rounded w-64 mb-8" />
          <div className="h-64 bg-brand-cream-dark rounded" />
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl text-brand-green mb-4">
            Commande non trouvée
          </h1>
          <Link href="/dashboard/orders" className="text-brand-green hover:underline">
            Retour aux commandes
          </Link>
        </div>
      </main>
    )
  }

  const currentStepIndex = statusSteps.findIndex((s) => s.id === order.status)

  return (
    <main className="min-h-screen bg-brand-cream py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <Link
          href="/dashboard/orders"
          className="text-brand-brown hover:text-brand-green transition-colors mb-6 inline-flex items-center"
        >
          ← Retour aux commandes
        </Link>

        <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm">
          <h1 className="font-display text-2xl text-brand-green mb-2">
            Commande #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-brand-brown mb-8">
            Livraison prévue: {new Date(order.deliveryDate).toLocaleDateString('fr-FR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}, {order.deliveryTimeSlot === 'morning' ? '6h-9h' : '18h-21h'}
          </p>

          {/* Status Tracker */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              {/* Progress Line */}
              <div className="absolute top-5 left-0 right-0 h-1 bg-brand-cream-dark" />
              <div
                className="absolute top-5 left-0 h-1 bg-brand-green transition-all"
                style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
              />

              {statusSteps.map((step, index) => {
                const isCompleted = index <= currentStepIndex
                const isCurrent = index === currentStepIndex

                return (
                  <div
                    key={step.id}
                    className="relative z-10 flex flex-col items-center"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        isCompleted
                          ? 'bg-brand-green text-white'
                          : 'bg-brand-cream-dark text-brand-brown'
                      } ${isCurrent ? 'ring-4 ring-brand-green/30' : ''}`}
                    >
                      {step.icon}
                    </div>
                    <span
                      className={`mt-2 text-xs ${
                        isCompleted ? 'text-brand-green font-medium' : 'text-brand-brown'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Current Status Message */}
          <div className="bg-brand-cream rounded-lg p-4 mb-8">
            {order.status === 'CONFIRMED' && (
              <p className="text-brand-brown">
                ✓ Votre commande a été confirmée. Nos fermiers préparent vos produits.
              </p>
            )}
            {order.status === 'PREPARING' && (
              <p className="text-brand-brown">
                📦 Vos produits sont en cours de préparation dans nos fermes partenaires.
              </p>
            )}
            {order.status === 'OUT_FOR_DELIVERY' && (
              <p className="text-brand-brown">
                🚚 Votre commande est en route! Notre livreur arrivera bientôt.
              </p>
            )}
            {order.status === 'DELIVERED' && (
              <p className="text-brand-brown">
                🎉 Votre commande a été livrée. Bon appétit!
              </p>
            )}
          </div>

          {/* Order Items */}
          <h2 className="font-semibold text-brand-green mb-4">Articles commandés</h2>
          <div className="space-y-3 mb-6">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3 bg-brand-cream rounded-lg"
              >
                <div>
                  <div className="font-medium text-brand-green">{item.product.name}</div>
                  <div className="text-sm text-brand-brown">
                    {item.product.farm.name} • x{item.quantity}
                  </div>
                </div>
                <div className="font-medium text-brand-green">
                  {(Number(item.product.price) * item.quantity).toFixed(2)} TND
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-4 border-t border-brand-cream-dark">
            <span className="font-semibold text-brand-green">Total</span>
            <span className="text-xl font-bold text-brand-green">
              {Number(order.totalAmount).toFixed(2)} TND
            </span>
          </div>

          {/* Actions */}
          {order.status === 'DELIVERED' && (
            <div className="mt-6 pt-6 border-t border-brand-cream-dark">
              <Link
                href={`/dashboard/quality/survey/${order.id}`}
                className="block w-full py-3 bg-brand-green text-white text-center rounded-lg font-semibold hover:bg-brand-green-dark transition-colors"
              >
                Donner mon avis
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
```

---

## Step 4: Testing Checklist

### 4.1 Cart
- [ ] Items grouped by farm
- [ ] Quantity updates work
- [ ] Item removal works
- [ ] Clear cart works
- [ ] Subtotal calculates correctly
- [ ] Delivery fee based on zone
- [ ] Free delivery threshold progress
- [ ] Empty cart state displays

### 4.2 Checkout
- [ ] Delivery type selection works
- [ ] Zone selection updates delivery fee
- [ ] Address form validates
- [ ] Pickup point selection works
- [ ] Payment method selection works
- [ ] Terms checkbox required
- [ ] Order submission works
- [ ] Redirect to confirmation

### 4.3 Order Tracking
- [ ] Confirmation page displays order details
- [ ] Tracking page shows status progress
- [ ] Status messages appropriate
- [ ] Items list displays correctly
- [ ] Survey link appears for delivered orders

---

## Summary

Phase 4 redesigns the shopping experience with an improved cart, streamlined checkout, and order tracking.

**Files Created:** ~6
**Files Modified:** ~8
**New Components:** 6

**Next Phase:** [Phase 5: Engagement Features](./05-PHASE-ENGAGEMENT.md)
