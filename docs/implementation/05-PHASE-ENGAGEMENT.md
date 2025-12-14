# Phase 5: Engagement Features

> **Build loyalty program, referral system, impact dashboard, and quality feedback enhancements**

---

## Phase Overview

| Aspect | Details |
|--------|---------|
| **Priority** | Medium |
| **Dependencies** | Phase 1 (Brand), Phase 2 (Subscriptions) |
| **Files to Create** | ~12 new files |
| **Files to Modify** | ~8 existing files |

---

## Step 1: Loyalty Program UI

### 1.1 Loyalty Dashboard Component

**File:** `frontend/src/components/loyalty/LoyaltyDashboard.tsx` (create)

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'
import { LoyaltyTierCard } from './LoyaltyTierCard'
import { PointsHistory } from './PointsHistory'
import { RewardsGrid } from './RewardsGrid'

interface LoyaltyData {
  currentPoints: number
  lifetimePoints: number
  tier: 'GRAINE' | 'POUSSE' | 'FLEUR' | 'ARBRE'
  tierProgress: number
  nextTierPoints: number
  discountPercent: number
  history: PointTransaction[]
  availableRewards: Reward[]
}

interface PointTransaction {
  id: string
  points: number
  reason: string
  createdAt: string
}

interface Reward {
  id: string
  name: string
  pointsCost: number
  description: string
  available: boolean
}

const tierConfig = {
  GRAINE: {
    name: 'Graine',
    icon: '🌱',
    minPoints: 0,
    maxPoints: 499,
    discount: 0,
    color: 'bg-green-100 text-green-800',
    benefits: ['Accès aux produits frais', 'Newsletter saisonnière'],
  },
  POUSSE: {
    name: 'Pousse',
    icon: '🌿',
    minPoints: 500,
    maxPoints: 1499,
    discount: 5,
    color: 'bg-green-200 text-green-900',
    benefits: ['5% de réduction', 'Accès anticipé aux nouveautés', 'Recettes exclusives'],
  },
  FLEUR: {
    name: 'Fleur',
    icon: '🌸',
    minPoints: 1500,
    maxPoints: 2999,
    discount: 10,
    color: 'bg-pink-100 text-pink-800',
    benefits: ['10% de réduction', 'Livraison gratuite', 'Produits exclusifs'],
  },
  ARBRE: {
    name: 'Arbre',
    icon: '🌳',
    minPoints: 3000,
    maxPoints: Infinity,
    discount: 15,
    color: 'bg-amber-100 text-amber-800',
    benefits: ['15% de réduction', 'Livraison prioritaire', 'Invitations VIP', 'Box surprise annuelle'],
  },
}

export function LoyaltyDashboard() {
  const { user } = useAuthStore()
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'rewards'>('overview')

  useEffect(() => {
    fetchLoyaltyData()
  }, [])

  const fetchLoyaltyData = async () => {
    try {
      const response = await api.get('/loyalty/my')
      setLoyaltyData(response.data.data)
    } catch (error) {
      console.error('Failed to fetch loyalty data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-brand-cream rounded-lg" />
        <div className="h-64 bg-brand-cream rounded-lg" />
      </div>
    )
  }

  if (!loyaltyData) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <p className="text-brand-brown">Impossible de charger vos données de fidélité.</p>
      </div>
    )
  }

  const currentTier = tierConfig[loyaltyData.tier]
  const nextTier = loyaltyData.tier === 'ARBRE' ? null :
    Object.values(tierConfig).find(t => t.minPoints > currentTier.maxPoints)

  return (
    <div className="space-y-6">
      {/* Header with Current Tier */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl text-brand-green">
              Programme Fidélité
            </h2>
            <p className="text-brand-brown">
              Gagnez des points à chaque achat et débloquez des avantages exclusifs
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full ${currentTier.color} flex items-center gap-2`}>
            <span className="text-2xl">{currentTier.icon}</span>
            <span className="font-semibold">{currentTier.name}</span>
          </div>
        </div>

        {/* Points Display */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-brand-cream rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-brand-green">{loyaltyData.currentPoints}</p>
            <p className="text-sm text-brand-brown">Points disponibles</p>
          </div>
          <div className="bg-brand-cream rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-brand-green">{loyaltyData.lifetimePoints}</p>
            <p className="text-sm text-brand-brown">Points cumulés</p>
          </div>
          <div className="bg-brand-cream rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-brand-green">{currentTier.discount}%</p>
            <p className="text-sm text-brand-brown">Réduction actuelle</p>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-brand-brown">
                Prochain niveau: {nextTier.name} {nextTier.icon}
              </span>
              <span className="text-brand-green font-medium">
                {loyaltyData.nextTierPoints - loyaltyData.lifetimePoints} points restants
              </span>
            </div>
            <div className="h-3 bg-brand-cream rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-green rounded-full transition-all duration-500"
                style={{ width: `${loyaltyData.tierProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-brand-cream">
        {[
          { id: 'overview', label: 'Aperçu' },
          { id: 'history', label: 'Historique' },
          { id: 'rewards', label: 'Récompenses' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 font-medium transition-colors ${
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
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Tier Benefits */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-brand-green mb-4">
              Vos avantages {currentTier.name} {currentTier.icon}
            </h3>
            <ul className="space-y-2">
              {currentTier.benefits.map((benefit, index) => (
                <li key={index} className="flex items-center gap-2 text-brand-brown">
                  <span className="text-brand-green">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* How to Earn Points */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-brand-green mb-4">
              Comment gagner des points
            </h3>
            <ul className="space-y-3">
              <li className="flex items-center justify-between text-brand-brown">
                <span>1 TND dépensé</span>
                <span className="font-semibold text-brand-green">= 1 point</span>
              </li>
              <li className="flex items-center justify-between text-brand-brown">
                <span>Laisser un avis</span>
                <span className="font-semibold text-brand-green">= 50 points</span>
              </li>
              <li className="flex items-center justify-between text-brand-brown">
                <span>Parrainer un ami</span>
                <span className="font-semibold text-brand-green">= 200 points</span>
              </li>
              <li className="flex items-center justify-between text-brand-brown">
                <span>Enquête qualité</span>
                <span className="font-semibold text-brand-green">= 25 points</span>
              </li>
            </ul>
          </div>

          {/* All Tiers */}
          <div className="md:col-span-2 bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-brand-green mb-4">
              Tous les niveaux
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(tierConfig).map(([key, tier]) => (
                <LoyaltyTierCard
                  key={key}
                  tier={tier}
                  isCurrent={key === loyaltyData.tier}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <PointsHistory history={loyaltyData.history} />
      )}

      {activeTab === 'rewards' && (
        <RewardsGrid
          rewards={loyaltyData.availableRewards}
          currentPoints={loyaltyData.currentPoints}
          onRedeem={fetchLoyaltyData}
        />
      )}
    </div>
  )
}
```

### 1.2 Loyalty Tier Card Component

**File:** `frontend/src/components/loyalty/LoyaltyTierCard.tsx` (create)

```tsx
interface TierConfig {
  name: string
  icon: string
  minPoints: number
  maxPoints: number
  discount: number
  color: string
  benefits: string[]
}

interface LoyaltyTierCardProps {
  tier: TierConfig
  isCurrent: boolean
}

export function LoyaltyTierCard({ tier, isCurrent }: LoyaltyTierCardProps) {
  return (
    <div
      className={`relative p-4 rounded-lg border-2 transition-all ${
        isCurrent
          ? 'border-brand-green bg-brand-cream'
          : 'border-transparent bg-gray-50'
      }`}
    >
      {isCurrent && (
        <span className="absolute -top-2 -right-2 bg-brand-green text-white text-xs px-2 py-1 rounded-full">
          Actuel
        </span>
      )}

      <div className="text-center mb-3">
        <span className="text-3xl">{tier.icon}</span>
        <h4 className="font-semibold text-brand-green">{tier.name}</h4>
        <p className="text-sm text-brand-brown">
          {tier.maxPoints === Infinity
            ? `${tier.minPoints}+ points`
            : `${tier.minPoints} - ${tier.maxPoints} points`}
        </p>
      </div>

      <div className="text-center py-2 bg-white rounded-lg mb-3">
        <span className="text-2xl font-bold text-brand-green">{tier.discount}%</span>
        <p className="text-xs text-brand-brown">de réduction</p>
      </div>

      <ul className="text-xs space-y-1">
        {tier.benefits.slice(0, 3).map((benefit, index) => (
          <li key={index} className="text-brand-brown flex items-start gap-1">
            <span className="text-brand-green">•</span>
            {benefit}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### 1.3 Points History Component

**File:** `frontend/src/components/loyalty/PointsHistory.tsx` (create)

```tsx
interface PointTransaction {
  id: string
  points: number
  reason: string
  createdAt: string
}

interface PointsHistoryProps {
  history: PointTransaction[]
}

const reasonLabels: Record<string, string> = {
  PURCHASE: 'Achat',
  REVIEW: 'Avis laissé',
  REFERRAL: 'Parrainage',
  QUALITY_SURVEY: 'Enquête qualité',
  REWARD_REDEMPTION: 'Récompense échangée',
  BONUS: 'Bonus',
  EXPIRATION: 'Expiration',
}

export function PointsHistory({ history }: PointsHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <p className="text-brand-brown">Aucune transaction pour le moment.</p>
        <p className="text-sm text-brand-brown mt-2">
          Commencez à gagner des points en passant votre première commande !
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-brand-cream">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-brand-brown">Date</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-brand-brown">Activité</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-brand-brown">Points</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-cream">
          {history.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-brand-cream/30">
              <td className="px-4 py-3 text-sm text-brand-brown">
                {new Date(transaction.createdAt).toLocaleDateString('fr-TN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </td>
              <td className="px-4 py-3 text-sm text-brand-green">
                {reasonLabels[transaction.reason] || transaction.reason}
              </td>
              <td className={`px-4 py-3 text-sm text-right font-semibold ${
                transaction.points >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.points >= 0 ? '+' : ''}{transaction.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

### 1.4 Rewards Grid Component

**File:** `frontend/src/components/loyalty/RewardsGrid.tsx` (create)

```tsx
'use client'

import { useState } from 'react'
import api from '@/lib/api'

interface Reward {
  id: string
  name: string
  pointsCost: number
  description: string
  available: boolean
}

interface RewardsGridProps {
  rewards: Reward[]
  currentPoints: number
  onRedeem: () => void
}

export function RewardsGrid({ rewards, currentPoints, onRedeem }: RewardsGridProps) {
  const [redeeming, setRedeeming] = useState<string | null>(null)

  const handleRedeem = async (rewardId: string) => {
    if (redeeming) return

    setRedeeming(rewardId)
    try {
      await api.post(`/loyalty/rewards/${rewardId}/redeem`)
      onRedeem()
    } catch (error) {
      console.error('Failed to redeem reward:', error)
      alert('Échec de l\'échange. Veuillez réessayer.')
    } finally {
      setRedeeming(null)
    }
  }

  if (rewards.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <p className="text-brand-brown">Aucune récompense disponible pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {rewards.map((reward) => {
        const canRedeem = currentPoints >= reward.pointsCost && reward.available
        const isRedeeming = redeeming === reward.id

        return (
          <div
            key={reward.id}
            className={`bg-white rounded-xl p-6 shadow-sm border-2 transition-all ${
              canRedeem ? 'border-brand-green' : 'border-transparent opacity-60'
            }`}
          >
            <h4 className="font-semibold text-brand-green mb-2">{reward.name}</h4>
            <p className="text-sm text-brand-brown mb-4">{reward.description}</p>

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-brand-gold">
                {reward.pointsCost} pts
              </span>
              <button
                onClick={() => handleRedeem(reward.id)}
                disabled={!canRedeem || isRedeeming}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  canRedeem
                    ? 'bg-brand-green text-white hover:bg-brand-green-dark'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isRedeeming ? 'Échange...' : 'Échanger'}
              </button>
            </div>

            {!reward.available && (
              <p className="text-xs text-red-500 mt-2">Temporairement indisponible</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

### 1.5 Loyalty Dashboard Page

**File:** `frontend/src/app/dashboard/loyalty/page.tsx` (create)

```tsx
import { Metadata } from 'next'
import { LoyaltyDashboard } from '@/components/loyalty/LoyaltyDashboard'

export const metadata: Metadata = {
  title: 'Programme Fidélité - Borgdanet',
  description: 'Gérez vos points et récompenses fidélité',
}

export default function LoyaltyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-brand-green">Fidélité</h1>
        <p className="text-brand-brown">
          Gagnez des points et débloquez des avantages exclusifs
        </p>
      </div>

      <LoyaltyDashboard />
    </div>
  )
}
```

---

## Step 2: Referral Program

### 2.1 Referral Dashboard Component

**File:** `frontend/src/components/referral/ReferralDashboard.tsx` (create)

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'
import { ReferralLink } from './ReferralLink'
import { ReferralStats } from './ReferralStats'
import { ReferralHistory } from './ReferralHistory'

interface ReferralData {
  referralCode: string
  referralLink: string
  totalReferrals: number
  successfulReferrals: number
  pendingReferrals: number
  totalEarned: number
  referrals: ReferralRecord[]
}

interface ReferralRecord {
  id: string
  referredEmail: string
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED'
  creditEarned: number
  createdAt: string
  completedAt?: string
}

export function ReferralDashboard() {
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    try {
      const response = await api.get('/referrals/my')
      setReferralData(response.data.data)
    } catch (error) {
      console.error('Failed to fetch referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-48 bg-brand-cream rounded-lg" />
        <div className="h-32 bg-brand-cream rounded-lg" />
      </div>
    )
  }

  if (!referralData) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <p className="text-brand-brown">Impossible de charger vos données de parrainage.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand-green to-brand-green-dark rounded-xl p-8 text-white">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl mb-4">
            Parrainez vos amis, gagnez des crédits !
          </h2>
          <p className="text-white/90 mb-6">
            Offrez 20 TND à vos amis sur leur première commande et recevez 20 TND
            de crédit lorsqu'ils passent leur première commande.
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">20 TND</span>
              <p className="text-sm text-white/80">pour votre ami</p>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">20 TND</span>
              <p className="text-sm text-white/80">pour vous</p>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold">200</span>
              <p className="text-sm text-white/80">points fidélité</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <ReferralLink
        code={referralData.referralCode}
        link={referralData.referralLink}
      />

      {/* Stats */}
      <ReferralStats
        totalReferrals={referralData.totalReferrals}
        successfulReferrals={referralData.successfulReferrals}
        pendingReferrals={referralData.pendingReferrals}
        totalEarned={referralData.totalEarned}
      />

      {/* History */}
      <ReferralHistory referrals={referralData.referrals} />
    </div>
  )
}
```

### 2.2 Referral Link Component

**File:** `frontend/src/components/referral/ReferralLink.tsx` (create)

```tsx
'use client'

import { useState } from 'react'

interface ReferralLinkProps {
  code: string
  link: string
}

export function ReferralLink({ code, link }: ReferralLinkProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareViaWhatsApp = () => {
    const message = `Découvrez Borgdanet ! Utilisez mon code ${code} pour obtenir 20 TND de réduction sur votre première commande: ${link}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  const shareViaEmail = () => {
    const subject = 'Rejoignez Borgdanet et économisez 20 TND !'
    const body = `Bonjour,\n\nJe vous invite à découvrir Borgdanet, une plateforme de produits bio locaux en Tunisie.\n\nUtilisez mon code de parrainage: ${code}\n\nOu cliquez sur ce lien: ${link}\n\nVous recevrez 20 TND de réduction sur votre première commande !\n\nÀ bientôt !`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h3 className="font-semibold text-brand-green mb-4">
        Votre lien de parrainage
      </h3>

      {/* Link Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={link}
          readOnly
          className="flex-1 px-4 py-2 bg-brand-cream rounded-lg text-brand-brown text-sm"
        />
        <button
          onClick={() => copyToClipboard(link)}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-brand-green text-white hover:bg-brand-green-dark'
          }`}
        >
          {copied ? 'Copié !' : 'Copier'}
        </button>
      </div>

      {/* Code */}
      <div className="flex items-center gap-4 mb-6">
        <span className="text-brand-brown">Votre code:</span>
        <span className="font-mono font-bold text-xl text-brand-green bg-brand-cream px-4 py-2 rounded-lg">
          {code}
        </span>
        <button
          onClick={() => copyToClipboard(code)}
          className="text-sm text-brand-green hover:underline"
        >
          Copier le code
        </button>
      </div>

      {/* Share Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={shareViaWhatsApp}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          WhatsApp
        </button>

        <button
          onClick={shareViaEmail}
          className="flex items-center gap-2 px-4 py-2 bg-brand-brown text-white rounded-lg hover:bg-brand-brown/80 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email
        </button>

        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Rejoignez Borgdanet',
                text: `Utilisez mon code ${code} pour 20 TND de réduction !`,
                url: link,
              })
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-gold text-white rounded-lg hover:bg-brand-gold/80 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Partager
        </button>
      </div>
    </div>
  )
}
```

### 2.3 Referral Stats Component

**File:** `frontend/src/components/referral/ReferralStats.tsx` (create)

```tsx
interface ReferralStatsProps {
  totalReferrals: number
  successfulReferrals: number
  pendingReferrals: number
  totalEarned: number
}

export function ReferralStats({
  totalReferrals,
  successfulReferrals,
  pendingReferrals,
  totalEarned,
}: ReferralStatsProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl p-4 shadow-sm text-center">
        <p className="text-3xl font-bold text-brand-green">{totalReferrals}</p>
        <p className="text-sm text-brand-brown">Invitations envoyées</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm text-center">
        <p className="text-3xl font-bold text-green-600">{successfulReferrals}</p>
        <p className="text-sm text-brand-brown">Parrainages réussis</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm text-center">
        <p className="text-3xl font-bold text-brand-gold">{pendingReferrals}</p>
        <p className="text-sm text-brand-brown">En attente</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm text-center">
        <p className="text-3xl font-bold text-brand-green">{totalEarned} TND</p>
        <p className="text-sm text-brand-brown">Total gagné</p>
      </div>
    </div>
  )
}
```

### 2.4 Referral History Component

**File:** `frontend/src/components/referral/ReferralHistory.tsx` (create)

```tsx
interface ReferralRecord {
  id: string
  referredEmail: string
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED'
  creditEarned: number
  createdAt: string
  completedAt?: string
}

interface ReferralHistoryProps {
  referrals: ReferralRecord[]
}

const statusConfig = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  COMPLETED: { label: 'Réussi', color: 'bg-green-100 text-green-800' },
  EXPIRED: { label: 'Expiré', color: 'bg-gray-100 text-gray-600' },
}

export function ReferralHistory({ referrals }: ReferralHistoryProps) {
  if (referrals.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center">
        <p className="text-brand-brown">Aucun parrainage pour le moment.</p>
        <p className="text-sm text-brand-brown mt-2">
          Partagez votre lien pour commencer à parrainer vos amis !
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <h3 className="font-semibold text-brand-green p-4 border-b border-brand-cream">
        Historique des parrainages
      </h3>
      <table className="w-full">
        <thead className="bg-brand-cream">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-brand-brown">Ami invité</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-brand-brown">Date</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-brand-brown">Statut</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-brand-brown">Crédit</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-cream">
          {referrals.map((referral) => {
            const status = statusConfig[referral.status]
            return (
              <tr key={referral.id} className="hover:bg-brand-cream/30">
                <td className="px-4 py-3 text-sm text-brand-brown">
                  {referral.referredEmail}
                </td>
                <td className="px-4 py-3 text-sm text-brand-brown">
                  {new Date(referral.createdAt).toLocaleDateString('fr-TN')}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-right font-semibold text-brand-green">
                  {referral.status === 'COMPLETED' ? `+${referral.creditEarned} TND` : '-'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
```

### 2.5 Referral Page

**File:** `frontend/src/app/dashboard/referral/page.tsx` (create)

```tsx
import { Metadata } from 'next'
import { ReferralDashboard } from '@/components/referral/ReferralDashboard'

export const metadata: Metadata = {
  title: 'Parrainage - Borgdanet',
  description: 'Parrainez vos amis et gagnez des crédits',
}

export default function ReferralPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-brand-green">Parrainage</h1>
        <p className="text-brand-brown">
          Invitez vos amis et gagnez des crédits ensemble
        </p>
      </div>

      <ReferralDashboard />
    </div>
  )
}
```

---

## Step 3: Impact Dashboard

### 3.1 Personal Impact Dashboard Component

**File:** `frontend/src/components/impact/PersonalImpactDashboard.tsx` (create)

```tsx
'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { ImpactMetricCard } from './ImpactMetricCard'
import { ImpactChart } from './ImpactChart'
import { FarmSupportList } from './FarmSupportList'

interface PersonalImpactData {
  totalOrders: number
  totalSpent: number
  farmsSupported: number
  co2Avoided: number
  localKmSaved: number
  packagingReturned: number
  foodRescued: number
  monthlyData: {
    month: string
    orders: number
    spent: number
    co2: number
  }[]
  topFarms: {
    id: string
    name: string
    slug: string
    totalSpent: number
    orderCount: number
  }[]
}

export function PersonalImpactDashboard() {
  const [impactData, setImpactData] = useState<PersonalImpactData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchImpactData()
  }, [])

  const fetchImpactData = async () => {
    try {
      const response = await api.get('/impact/my')
      setImpactData(response.data.data)
    } catch (error) {
      console.error('Failed to fetch impact data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-brand-cream rounded-lg" />
          ))}
        </div>
        <div className="h-64 bg-brand-cream rounded-lg" />
      </div>
    )
  }

  if (!impactData) {
    return (
      <div className="text-center py-12 bg-white rounded-lg">
        <p className="text-brand-brown">Impossible de charger vos données d'impact.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-brand-green to-brand-green-dark rounded-xl p-8 text-white">
        <h2 className="font-display text-3xl mb-2">Votre impact positif</h2>
        <p className="text-white/90">
          Ensemble, nous construisons un système alimentaire plus durable.
          Voici votre contribution personnelle.
        </p>
      </div>

      {/* Main Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ImpactMetricCard
          icon="🌿"
          value={impactData.co2Avoided}
          unit="kg"
          label="CO2 évité"
          description="Grâce aux circuits courts"
          color="green"
        />
        <ImpactMetricCard
          icon="🌱"
          value={impactData.farmsSupported}
          label="Fermes soutenues"
          description="Familles d'agriculteurs"
          color="green"
        />
        <ImpactMetricCard
          icon="♻️"
          value={impactData.packagingReturned}
          unit="emballages"
          label="Consignes retournées"
          description="Réutilisation maximale"
          color="blue"
        />
        <ImpactMetricCard
          icon="🍎"
          value={impactData.foodRescued}
          unit="kg"
          label="Nourriture sauvée"
          description="Produits rescue achetés"
          color="orange"
        />
      </div>

      {/* Additional Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <p className="text-3xl font-bold text-brand-green">{impactData.totalOrders}</p>
          <p className="text-brand-brown">Commandes passées</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <p className="text-3xl font-bold text-brand-green">{impactData.totalSpent.toFixed(0)} TND</p>
          <p className="text-brand-brown">Investis dans le local</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm text-center">
          <p className="text-3xl font-bold text-brand-green">{impactData.localKmSaved}</p>
          <p className="text-brand-brown">km de transport évités</p>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-brand-green mb-4">Évolution de votre impact</h3>
        <ImpactChart data={impactData.monthlyData} />
      </div>

      {/* Farms Supported */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-brand-green mb-4">Fermes que vous soutenez</h3>
        <FarmSupportList farms={impactData.topFarms} />
      </div>

      {/* Share Impact */}
      <div className="bg-brand-cream rounded-xl p-6 text-center">
        <h3 className="font-semibold text-brand-green mb-2">
          Partagez votre impact !
        </h3>
        <p className="text-brand-brown mb-4">
          Inspirez vos proches en partageant votre contribution positive.
        </p>
        <button className="px-6 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors">
          Partager mon impact
        </button>
      </div>
    </div>
  )
}
```

### 3.2 Impact Metric Card

**File:** `frontend/src/components/impact/ImpactMetricCard.tsx` (create)

```tsx
interface ImpactMetricCardProps {
  icon: string
  value: number
  unit?: string
  label: string
  description: string
  color: 'green' | 'blue' | 'orange'
}

const colorClasses = {
  green: 'bg-green-50 border-green-200',
  blue: 'bg-blue-50 border-blue-200',
  orange: 'bg-orange-50 border-orange-200',
}

export function ImpactMetricCard({
  icon,
  value,
  unit,
  label,
  description,
  color,
}: ImpactMetricCardProps) {
  return (
    <div className={`rounded-xl p-6 border-2 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-brand-green">
        {value.toLocaleString('fr-TN')}
        {unit && <span className="text-lg font-normal text-brand-brown ml-1">{unit}</span>}
      </p>
      <p className="font-medium text-brand-green">{label}</p>
      <p className="text-sm text-brand-brown">{description}</p>
    </div>
  )
}
```

### 3.3 Impact Chart

**File:** `frontend/src/components/impact/ImpactChart.tsx` (create)

```tsx
'use client'

interface MonthlyData {
  month: string
  orders: number
  spent: number
  co2: number
}

interface ImpactChartProps {
  data: MonthlyData[]
}

export function ImpactChart({ data }: ImpactChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-brand-brown">
        Pas encore de données disponibles
      </div>
    )
  }

  const maxCo2 = Math.max(...data.map((d) => d.co2), 1)

  return (
    <div className="space-y-4">
      {/* Simple Bar Chart */}
      <div className="flex items-end gap-2 h-48">
        {data.map((item, index) => {
          const height = (item.co2 / maxCo2) * 100
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-brand-green rounded-t-lg transition-all duration-300 hover:bg-brand-green-dark"
                style={{ height: `${height}%`, minHeight: item.co2 > 0 ? '8px' : '0' }}
                title={`${item.co2} kg CO2 évité`}
              />
              <span className="text-xs text-brand-brown mt-2 truncate w-full text-center">
                {item.month}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-brand-green rounded" />
          <span className="text-brand-brown">kg CO2 évité par mois</span>
        </div>
      </div>
    </div>
  )
}
```

### 3.4 Farm Support List

**File:** `frontend/src/components/impact/FarmSupportList.tsx` (create)

```tsx
import Link from 'next/link'

interface Farm {
  id: string
  name: string
  slug: string
  totalSpent: number
  orderCount: number
}

interface FarmSupportListProps {
  farms: Farm[]
}

export function FarmSupportList({ farms }: FarmSupportListProps) {
  if (farms.length === 0) {
    return (
      <p className="text-brand-brown text-center py-4">
        Vous n'avez pas encore passé de commande.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {farms.map((farm, index) => (
        <div
          key={farm.id}
          className="flex items-center justify-between p-4 bg-brand-cream rounded-lg"
        >
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-brand-green/30">
              #{index + 1}
            </span>
            <div>
              <Link
                href={`/farms/${farm.slug}`}
                className="font-medium text-brand-green hover:underline"
              >
                {farm.name}
              </Link>
              <p className="text-sm text-brand-brown">
                {farm.orderCount} commande{farm.orderCount > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-brand-green">
              {farm.totalSpent.toFixed(0)} TND
            </p>
            <p className="text-xs text-brand-brown">Total dépensé</p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### 3.5 Impact Dashboard Page

**File:** `frontend/src/app/dashboard/impact/page.tsx` (create)

```tsx
import { Metadata } from 'next'
import { PersonalImpactDashboard } from '@/components/impact/PersonalImpactDashboard'

export const metadata: Metadata = {
  title: 'Mon Impact - Borgdanet',
  description: 'Découvrez votre impact positif sur l\'environnement et les communautés locales',
}

export default function ImpactPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-brand-green">Mon Impact</h1>
        <p className="text-brand-brown">
          Votre contribution à un système alimentaire plus durable
        </p>
      </div>

      <PersonalImpactDashboard />
    </div>
  )
}
```

---

## Step 4: Quality Feedback Enhancements

### 4.1 Enhanced Quality Report Form

**File:** `frontend/src/components/quality/QualityReportForm.tsx` (create)

```tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '@/lib/api'

const qualityReportSchema = z.object({
  orderId: z.string().min(1, 'Sélectionnez une commande'),
  productId: z.string().optional(),
  issueType: z.enum([
    'DAMAGED',
    'NOT_FRESH',
    'WRONG_ITEM',
    'MISSING_ITEM',
    'QUANTITY_SHORT',
    'TASTE_QUALITY',
    'OTHER',
  ]),
  description: z.string().min(10, 'Décrivez le problème (minimum 10 caractères)'),
})

type QualityReportFormData = z.infer<typeof qualityReportSchema>

interface Order {
  id: string
  orderNumber: string
  createdAt: string
  items: {
    id: string
    productId: string
    productName: string
  }[]
}

interface QualityReportFormProps {
  orders: Order[]
  onSuccess: () => void
}

const issueTypes = {
  DAMAGED: { label: 'Produit endommagé', icon: '📦' },
  NOT_FRESH: { label: 'Pas frais', icon: '🥬' },
  WRONG_ITEM: { label: 'Mauvais produit', icon: '❌' },
  MISSING_ITEM: { label: 'Produit manquant', icon: '❓' },
  QUANTITY_SHORT: { label: 'Quantité insuffisante', icon: '⚖️' },
  TASTE_QUALITY: { label: 'Problème de goût', icon: '👅' },
  OTHER: { label: 'Autre', icon: '📝' },
}

export function QualityReportForm({ orders, onSuccess }: QualityReportFormProps) {
  const [photos, setPhotos] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QualityReportFormData>({
    resolver: zodResolver(qualityReportSchema),
  })

  const selectedOrderId = watch('orderId')
  const selectedOrder = orders.find((o) => o.id === selectedOrderId)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).slice(0, 3) // Max 3 photos
      setPhotos(newPhotos)
    }
  }

  const onSubmit = async (data: QualityReportFormData) => {
    setSubmitError(null)

    try {
      // Upload photos first if any
      let photoUrls: string[] = []
      if (photos.length > 0) {
        setUploading(true)
        const formData = new FormData()
        photos.forEach((photo) => formData.append('photos', photo))

        const uploadResponse = await api.post('/upload/quality-photos', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        photoUrls = uploadResponse.data.urls
        setUploading(false)
      }

      // Submit report
      await api.post('/quality/reports', {
        ...data,
        photoUrls,
      })

      onSuccess()
    } catch (error: any) {
      setSubmitError(error.response?.data?.error?.message || 'Échec de l\'envoi du signalement')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Order Selection */}
      <div>
        <label className="block text-sm font-medium text-brand-brown mb-2">
          Commande concernée
        </label>
        <select
          {...register('orderId')}
          className="w-full px-4 py-2 border border-brand-cream rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
        >
          <option value="">Sélectionnez une commande</option>
          {orders.map((order) => (
            <option key={order.id} value={order.id}>
              {order.orderNumber} - {new Date(order.createdAt).toLocaleDateString('fr-TN')}
            </option>
          ))}
        </select>
        {errors.orderId && (
          <p className="text-red-500 text-sm mt-1">{errors.orderId.message}</p>
        )}
      </div>

      {/* Product Selection (optional) */}
      {selectedOrder && (
        <div>
          <label className="block text-sm font-medium text-brand-brown mb-2">
            Produit concerné (optionnel)
          </label>
          <select
            {...register('productId')}
            className="w-full px-4 py-2 border border-brand-cream rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
          >
            <option value="">Tous les produits / Général</option>
            {selectedOrder.items.map((item) => (
              <option key={item.id} value={item.productId}>
                {item.productName}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Issue Type */}
      <div>
        <label className="block text-sm font-medium text-brand-brown mb-2">
          Type de problème
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.entries(issueTypes).map(([key, { label, icon }]) => (
            <label
              key={key}
              className="flex items-center gap-2 p-3 border border-brand-cream rounded-lg cursor-pointer hover:bg-brand-cream transition-colors has-[:checked]:border-brand-green has-[:checked]:bg-brand-cream"
            >
              <input
                type="radio"
                value={key}
                {...register('issueType')}
                className="sr-only"
              />
              <span>{icon}</span>
              <span className="text-sm">{label}</span>
            </label>
          ))}
        </div>
        {errors.issueType && (
          <p className="text-red-500 text-sm mt-1">{errors.issueType.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-brand-brown mb-2">
          Description du problème
        </label>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Décrivez le problème en détail..."
          className="w-full px-4 py-2 border border-brand-cream rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent resize-none"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-brand-brown mb-2">
          Photos (optionnel, max 3)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handlePhotoChange}
          className="w-full px-4 py-2 border border-brand-cream rounded-lg"
        />
        {photos.length > 0 && (
          <div className="flex gap-2 mt-2">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="w-20 h-20 rounded-lg overflow-hidden bg-brand-cream"
              >
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {submitError}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || uploading}
        className="w-full py-3 bg-brand-green text-white rounded-lg font-medium hover:bg-brand-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {uploading
          ? 'Téléchargement des photos...'
          : isSubmitting
          ? 'Envoi en cours...'
          : 'Envoyer le signalement'}
      </button>

      {/* Info Text */}
      <p className="text-sm text-brand-brown text-center">
        Un crédit sera automatiquement appliqué à votre compte si applicable.
        Notre équipe vous contactera si nécessaire.
      </p>
    </form>
  )
}
```

### 4.2 Quality Reports List

**File:** `frontend/src/components/quality/QualityReportsList.tsx` (create)

```tsx
'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

interface QualityReport {
  id: string
  orderNumber: string
  productName?: string
  issueType: string
  description: string
  status: 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED'
  creditAmount?: number
  resolution?: string
  createdAt: string
  resolvedAt?: string
}

const statusConfig = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  REVIEWING: { label: 'En cours', color: 'bg-blue-100 text-blue-800' },
  RESOLVED: { label: 'Résolu', color: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Rejeté', color: 'bg-red-100 text-red-800' },
}

const issueLabels: Record<string, string> = {
  DAMAGED: 'Produit endommagé',
  NOT_FRESH: 'Pas frais',
  WRONG_ITEM: 'Mauvais produit',
  MISSING_ITEM: 'Produit manquant',
  QUANTITY_SHORT: 'Quantité insuffisante',
  TASTE_QUALITY: 'Problème de goût',
  OTHER: 'Autre',
}

export function QualityReportsList() {
  const [reports, setReports] = useState<QualityReport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const response = await api.get('/quality/reports/my')
      setReports(response.data.data)
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-brand-cream rounded-lg" />
        ))}
      </div>
    )
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-xl">
        <p className="text-brand-brown">Vous n'avez aucun signalement.</p>
        <p className="text-sm text-brand-brown mt-2">
          C'est bon signe ! Nous espérons que tout se passe bien.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => {
        const status = statusConfig[report.status]

        return (
          <div key={report.id} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-brand-green">
                  Commande {report.orderNumber}
                </p>
                {report.productName && (
                  <p className="text-sm text-brand-brown">{report.productName}</p>
                )}
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>

            <div className="mb-2">
              <span className="inline-block px-2 py-1 bg-brand-cream rounded text-xs text-brand-brown">
                {issueLabels[report.issueType]}
              </span>
            </div>

            <p className="text-sm text-brand-brown mb-2">{report.description}</p>

            <div className="flex items-center justify-between text-sm">
              <span className="text-brand-brown/60">
                {new Date(report.createdAt).toLocaleDateString('fr-TN')}
              </span>

              {report.status === 'RESOLVED' && report.creditAmount && (
                <span className="text-green-600 font-medium">
                  +{report.creditAmount} TND crédité
                </span>
              )}

              {report.status === 'RESOLVED' && report.resolution && (
                <span className="text-brand-green">{report.resolution}</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

### 4.3 Quality Dashboard Page

**File:** `frontend/src/app/dashboard/quality/page.tsx` (update)

```tsx
'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'
import { QualityReportForm } from '@/components/quality/QualityReportForm'
import { QualityReportsList } from '@/components/quality/QualityReportsList'

interface Order {
  id: string
  orderNumber: string
  createdAt: string
  items: {
    id: string
    productId: string
    productName: string
  }[]
}

export default function QualityPage() {
  const [activeTab, setActiveTab] = useState<'report' | 'history'>('report')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetchRecentOrders()
  }, [])

  const fetchRecentOrders = async () => {
    try {
      const response = await api.get('/orders/my?status=DELIVERED&limit=10')
      setOrders(response.data.data)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReportSuccess = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 5000)
    setActiveTab('history')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-brand-green">Qualité & Retours</h1>
        <p className="text-brand-brown">
          Un problème avec votre commande ? Nous sommes là pour vous aider.
        </p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
          <span>✓</span>
          Votre signalement a été envoyé. Un crédit sera appliqué automatiquement si applicable.
        </div>
      )}

      {/* Guarantee Banner */}
      <div className="bg-gradient-to-r from-brand-green to-brand-green-dark rounded-xl p-6 text-white">
        <h2 className="font-display text-2xl mb-2">Notre garantie qualité</h2>
        <p className="text-white/90 mb-4">
          Si vous n'êtes pas 100% satisfait de la fraîcheur ou de la qualité de vos produits,
          nous vous remboursons immédiatement sous forme de crédit.
        </p>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="bg-white/20 px-3 py-1 rounded-full">✓ Remboursement automatique</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">✓ Crédit instantané</span>
          <span className="bg-white/20 px-3 py-1 rounded-full">✓ Sans conditions</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-brand-cream">
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'report'
              ? 'text-brand-green border-b-2 border-brand-green'
              : 'text-brand-brown hover:text-brand-green'
          }`}
        >
          Nouveau signalement
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'history'
              ? 'text-brand-green border-b-2 border-brand-green'
              : 'text-brand-brown hover:text-brand-green'
          }`}
        >
          Mes signalements
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        {activeTab === 'report' ? (
          loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-brand-cream rounded" />
              <div className="h-12 bg-brand-cream rounded" />
              <div className="h-24 bg-brand-cream rounded" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-brand-brown">Aucune commande récente à signaler.</p>
            </div>
          ) : (
            <QualityReportForm orders={orders} onSuccess={handleReportSuccess} />
          )
        ) : (
          <QualityReportsList />
        )}
      </div>
    </div>
  )
}
```

---

## Step 5: Backend API Endpoints

### 5.1 Loyalty Controller

**File:** `backend/src/controllers/loyalty.controller.ts` (create)

```typescript
import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'

const prisma = new PrismaClient()

const tierThresholds = {
  GRAINE: { min: 0, max: 499, discount: 0 },
  POUSSE: { min: 500, max: 1499, discount: 5 },
  FLEUR: { min: 1500, max: 2999, discount: 10 },
  ARBRE: { min: 3000, max: Infinity, discount: 15 },
}

function calculateTier(lifetimePoints: number): keyof typeof tierThresholds {
  if (lifetimePoints >= 3000) return 'ARBRE'
  if (lifetimePoints >= 1500) return 'FLEUR'
  if (lifetimePoints >= 500) return 'POUSSE'
  return 'GRAINE'
}

export const getMyLoyalty = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!.id

    // Get or create loyalty record
    let loyalty = await prisma.customerLoyalty.findUnique({
      where: { customerId },
    })

    if (!loyalty) {
      loyalty = await prisma.customerLoyalty.create({
        data: {
          customerId,
          currentPoints: 0,
          lifetimePoints: 0,
          tier: 'GRAINE',
        },
      })
    }

    // Get points history
    const history = await prisma.loyaltyTransaction.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    // Get available rewards
    const rewards = await prisma.loyaltyReward.findMany({
      where: { active: true },
      orderBy: { pointsCost: 'asc' },
    })

    // Calculate tier progress
    const currentTier = calculateTier(loyalty.lifetimePoints)
    const tierConfig = tierThresholds[currentTier]
    const nextTierPoints = currentTier === 'ARBRE' ? null : tierThresholds[
      currentTier === 'GRAINE' ? 'POUSSE' : currentTier === 'POUSSE' ? 'FLEUR' : 'ARBRE'
    ].min

    const tierProgress = nextTierPoints
      ? ((loyalty.lifetimePoints - tierConfig.min) / (nextTierPoints - tierConfig.min)) * 100
      : 100

    res.json({
      success: true,
      data: {
        currentPoints: loyalty.currentPoints,
        lifetimePoints: loyalty.lifetimePoints,
        tier: currentTier,
        tierProgress: Math.min(tierProgress, 100),
        nextTierPoints,
        discountPercent: tierConfig.discount,
        history: history.map((t) => ({
          id: t.id,
          points: t.points,
          reason: t.reason,
          createdAt: t.createdAt,
        })),
        availableRewards: rewards.map((r) => ({
          id: r.id,
          name: r.name,
          pointsCost: r.pointsCost,
          description: r.description,
          available: loyalty!.currentPoints >= r.pointsCost,
        })),
      },
    })
  } catch (error) {
    console.error('Get loyalty error:', error)
    res.status(500).json({ success: false, error: { message: 'Failed to fetch loyalty data' } })
  }
}

export const redeemReward = async (req: AuthRequest, res: Response) => {
  try {
    const { rewardId } = req.params
    const customerId = req.user!.id

    // Get reward
    const reward = await prisma.loyaltyReward.findUnique({
      where: { id: rewardId },
    })

    if (!reward || !reward.active) {
      return res.status(404).json({
        success: false,
        error: { message: 'Reward not found or unavailable' },
      })
    }

    // Get loyalty record
    const loyalty = await prisma.customerLoyalty.findUnique({
      where: { customerId },
    })

    if (!loyalty || loyalty.currentPoints < reward.pointsCost) {
      return res.status(400).json({
        success: false,
        error: { message: 'Insufficient points' },
      })
    }

    // Deduct points and create transaction
    await prisma.$transaction([
      prisma.customerLoyalty.update({
        where: { customerId },
        data: { currentPoints: { decrement: reward.pointsCost } },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          customerId,
          points: -reward.pointsCost,
          reason: 'REWARD_REDEMPTION',
          referenceId: rewardId,
        },
      }),
      // If reward gives credit, create customer credit
      ...(reward.creditValue
        ? [
            prisma.customerCredit.create({
              data: {
                customerId,
                amount: reward.creditValue,
                reason: 'LOYALTY',
                referenceId: rewardId,
                expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
              },
            }),
          ]
        : []),
    ])

    res.json({
      success: true,
      data: { message: 'Reward redeemed successfully' },
    })
  } catch (error) {
    console.error('Redeem reward error:', error)
    res.status(500).json({ success: false, error: { message: 'Failed to redeem reward' } })
  }
}
```

### 5.2 Referral Controller

**File:** `backend/src/controllers/referral.controller.ts` (create)

```typescript
import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'
import crypto from 'crypto'

const prisma = new PrismaClient()

const REFERRAL_CREDIT = 20 // TND
const REFERRAL_POINTS = 200

export const getMyReferrals = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!.id

    // Get or create referral code
    let referral = await prisma.referralCode.findUnique({
      where: { userId: customerId },
    })

    if (!referral) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase()
      referral = await prisma.referralCode.create({
        data: {
          userId: customerId,
          code,
        },
      })
    }

    // Get referral stats
    const referrals = await prisma.referral.findMany({
      where: { referrerId: customerId },
      orderBy: { createdAt: 'desc' },
    })

    const successfulReferrals = referrals.filter((r) => r.status === 'COMPLETED')
    const pendingReferrals = referrals.filter((r) => r.status === 'PENDING')

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

    res.json({
      success: true,
      data: {
        referralCode: referral.code,
        referralLink: `${baseUrl}/register?ref=${referral.code}`,
        totalReferrals: referrals.length,
        successfulReferrals: successfulReferrals.length,
        pendingReferrals: pendingReferrals.length,
        totalEarned: successfulReferrals.length * REFERRAL_CREDIT,
        referrals: referrals.map((r) => ({
          id: r.id,
          referredEmail: r.referredEmail,
          status: r.status,
          creditEarned: r.status === 'COMPLETED' ? REFERRAL_CREDIT : 0,
          createdAt: r.createdAt,
          completedAt: r.completedAt,
        })),
      },
    })
  } catch (error) {
    console.error('Get referrals error:', error)
    res.status(500).json({ success: false, error: { message: 'Failed to fetch referral data' } })
  }
}

export const validateReferralCode = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.params

    const referralCode = await prisma.referralCode.findUnique({
      where: { code: code.toUpperCase() },
      include: { user: { select: { firstName: true } } },
    })

    if (!referralCode) {
      return res.status(404).json({
        success: false,
        error: { message: 'Invalid referral code' },
      })
    }

    res.json({
      success: true,
      data: {
        valid: true,
        referrerName: referralCode.user.firstName,
        discount: REFERRAL_CREDIT,
      },
    })
  } catch (error) {
    console.error('Validate referral error:', error)
    res.status(500).json({ success: false, error: { message: 'Failed to validate code' } })
  }
}

export const completeReferral = async (referredUserId: string, referralCode: string) => {
  try {
    const code = await prisma.referralCode.findUnique({
      where: { code: referralCode.toUpperCase() },
    })

    if (!code || code.userId === referredUserId) return

    // Check if referral already exists
    const existing = await prisma.referral.findFirst({
      where: { referredId: referredUserId },
    })

    if (existing) return

    // Create referral record
    const referred = await prisma.user.findUnique({
      where: { id: referredUserId },
      select: { email: true },
    })

    await prisma.referral.create({
      data: {
        referrerId: code.userId,
        referredId: referredUserId,
        referredEmail: referred?.email || '',
        status: 'PENDING',
      },
    })
  } catch (error) {
    console.error('Complete referral error:', error)
  }
}
```

### 5.3 Impact Controller

**File:** `backend/src/controllers/impact.controller.ts` (create)

```typescript
import { Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { AuthRequest } from '../middleware/auth.middleware'

const prisma = new PrismaClient()

// Average kg CO2 saved per local purchase vs imported
const CO2_PER_ORDER = 2.5

export const getMyImpact = async (req: AuthRequest, res: Response) => {
  try {
    const customerId = req.user!.id

    // Get all orders
    const orders = await prisma.order.findMany({
      where: { customerId, status: 'DELIVERED' },
      include: {
        items: {
          include: {
            product: { include: { farm: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Calculate metrics
    const totalOrders = orders.length
    const totalSpent = orders.reduce((sum, o) => sum + o.total, 0)
    const co2Avoided = totalOrders * CO2_PER_ORDER

    // Unique farms supported
    const farmIds = new Set<string>()
    orders.forEach((o) => {
      o.items.forEach((i) => {
        if (i.product?.farmId) farmIds.add(i.product.farmId)
      })
    })

    // Get rescue purchases
    const rescueItems = orders.flatMap((o) =>
      o.items.filter((i) => i.product?.isRescue)
    )
    const foodRescued = rescueItems.reduce((sum, i) => sum + (i.quantity * 0.5), 0) // Estimate 0.5kg per item

    // Monthly data (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyOrders = orders.filter((o) => o.createdAt >= sixMonthsAgo)
    const monthlyData: { month: string; orders: number; spent: number; co2: number }[] = []

    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const month = date.toLocaleDateString('fr-TN', { month: 'short' })

      const monthOrders = monthlyOrders.filter((o) => {
        const orderMonth = o.createdAt.getMonth()
        const orderYear = o.createdAt.getFullYear()
        return orderMonth === date.getMonth() && orderYear === date.getFullYear()
      })

      monthlyData.push({
        month,
        orders: monthOrders.length,
        spent: monthOrders.reduce((sum, o) => sum + o.total, 0),
        co2: monthOrders.length * CO2_PER_ORDER,
      })
    }

    // Top farms
    const farmSpending: Record<string, { name: string; slug: string; spent: number; orders: number }> = {}
    orders.forEach((o) => {
      o.items.forEach((i) => {
        if (i.product?.farm) {
          const farmId = i.product.farmId
          if (!farmSpending[farmId]) {
            farmSpending[farmId] = {
              name: i.product.farm.name,
              slug: i.product.farm.slug,
              spent: 0,
              orders: 0,
            }
          }
          farmSpending[farmId].spent += i.price * i.quantity
          farmSpending[farmId].orders++
        }
      })
    })

    const topFarms = Object.entries(farmSpending)
      .map(([id, data]) => ({ id, ...data, totalSpent: data.spent, orderCount: data.orders }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)

    // Get packaging returns
    const packagingReturns = await prisma.packagingReturn.count({
      where: { customerId },
    })

    res.json({
      success: true,
      data: {
        totalOrders,
        totalSpent,
        farmsSupported: farmIds.size,
        co2Avoided: Math.round(co2Avoided * 10) / 10,
        localKmSaved: totalOrders * 150, // Estimate 150km saved per local order
        packagingReturned: packagingReturns,
        foodRescued: Math.round(foodRescued * 10) / 10,
        monthlyData,
        topFarms,
      },
    })
  } catch (error) {
    console.error('Get impact error:', error)
    res.status(500).json({ success: false, error: { message: 'Failed to fetch impact data' } })
  }
}
```

### 5.4 Routes Setup

**File:** `backend/src/routes/loyalty.routes.ts` (create)

```typescript
import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { getMyLoyalty, redeemReward } from '../controllers/loyalty.controller'

const router = Router()

router.use(authenticate)

router.get('/my', getMyLoyalty)
router.post('/rewards/:rewardId/redeem', redeemReward)

export default router
```

**File:** `backend/src/routes/referral.routes.ts` (create)

```typescript
import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { getMyReferrals, validateReferralCode } from '../controllers/referral.controller'

const router = Router()

router.get('/validate/:code', validateReferralCode)

router.use(authenticate)
router.get('/my', getMyReferrals)

export default router
```

**File:** `backend/src/routes/impact.routes.ts` (create)

```typescript
import { Router } from 'express'
import { authenticate } from '../middleware/auth.middleware'
import { getMyImpact } from '../controllers/impact.controller'

const router = Router()

router.use(authenticate)

router.get('/my', getMyImpact)

export default router
```

### 5.5 Register Routes

**File:** `backend/src/routes/index.ts` (update)

```typescript
// Add imports
import loyaltyRoutes from './loyalty.routes'
import referralRoutes from './referral.routes'
import impactRoutes from './impact.routes'

// Add routes
router.use('/loyalty', loyaltyRoutes)
router.use('/referrals', referralRoutes)
router.use('/impact', impactRoutes)
```

---

## Step 6: Database Schema Updates

### 6.1 Prisma Schema Additions

**File:** `backend/prisma/schema.prisma` (add models)

```prisma
// Loyalty Program
model CustomerLoyalty {
  id             String   @id @default(cuid())
  customerId     String   @unique
  customer       User     @relation(fields: [customerId], references: [id])
  currentPoints  Int      @default(0)
  lifetimePoints Int      @default(0)
  tier           LoyaltyTier @default(GRAINE)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model LoyaltyTransaction {
  id          String   @id @default(cuid())
  customerId  String
  customer    User     @relation(fields: [customerId], references: [id])
  points      Int
  reason      LoyaltyReason
  referenceId String?
  createdAt   DateTime @default(now())

  @@index([customerId])
}

model LoyaltyReward {
  id          String   @id @default(cuid())
  name        String
  description String
  pointsCost  Int
  creditValue Float?
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
}

enum LoyaltyTier {
  GRAINE
  POUSSE
  FLEUR
  ARBRE
}

enum LoyaltyReason {
  PURCHASE
  REVIEW
  REFERRAL
  QUALITY_SURVEY
  REWARD_REDEMPTION
  BONUS
  EXPIRATION
}

// Referral Program
model ReferralCode {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  code      String   @unique
  createdAt DateTime @default(now())
}

model Referral {
  id            String         @id @default(cuid())
  referrerId    String
  referrer      User           @relation("ReferralsMade", fields: [referrerId], references: [id])
  referredId    String
  referred      User           @relation("ReferralsReceived", fields: [referredId], references: [id])
  referredEmail String
  status        ReferralStatus @default(PENDING)
  createdAt     DateTime       @default(now())
  completedAt   DateTime?

  @@index([referrerId])
  @@index([referredId])
}

enum ReferralStatus {
  PENDING
  COMPLETED
  EXPIRED
}

// Packaging Returns (for impact tracking)
model PackagingReturn {
  id         String   @id @default(cuid())
  customerId String
  customer   User     @relation(fields: [customerId], references: [id])
  quantity   Int
  returnedAt DateTime @default(now())

  @@index([customerId])
}
```

### 6.2 Run Migration

```bash
cd backend
npx prisma migrate dev --name add_engagement_features
npx prisma generate
```

---

## Acceptance Criteria

### Loyalty Program
- [ ] Users can view their current points and tier
- [ ] Points history shows all transactions
- [ ] Users can redeem rewards when they have enough points
- [ ] Tier progress bar updates correctly

### Referral Program
- [ ] Users have a unique referral code and link
- [ ] Sharing via WhatsApp, Email, and native share works
- [ ] Referral history shows all invited friends
- [ ] Stats display correctly

### Impact Dashboard
- [ ] CO2, farms supported, and other metrics display
- [ ] Monthly chart shows trend data
- [ ] Top farms list shows correctly
- [ ] Share impact button works

### Quality Feedback
- [ ] Users can select order and product
- [ ] Issue type selection works
- [ ] Photo upload works (max 3)
- [ ] Reports appear in history with status

---

## Next Phase

Continue to [Phase 6: New Features & PWA](./06-PHASE-NEW-FEATURES.md) for agritourism booking, educational content, and PWA implementation.
