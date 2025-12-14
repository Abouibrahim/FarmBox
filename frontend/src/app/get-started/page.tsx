'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type BoxType = 'trial' | 'essentiel' | 'famille' | 'gourmet';
type Frequency = 'weekly' | 'biweekly';

const boxes = [
  {
    id: 'trial' as BoxType,
    name: 'Box Essai',
    badge: '-25%',
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
    badge: 'Populaire',
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
];

export default function GetStartedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialPlan = searchParams.get('plan') as BoxType | null;
  const initialBox = initialPlan ||
                     (searchParams.get('trial') === 'true' ? 'trial' : null);

  const [selectedBox, setSelectedBox] = useState<BoxType | null>(initialBox);
  const [frequency, setFrequency] = useState<Frequency>('weekly');

  const handleContinue = () => {
    if (!selectedBox) return;

    const box = boxes.find(b => b.id === selectedBox);
    if (box?.isSubscription) {
      router.push(`/get-started/customize?box=${selectedBox}&frequency=${frequency}`);
    } else {
      router.push(`/get-started/customize?box=${selectedBox}`);
    }
  };

  return (
    <main className="min-h-screen bg-brand-cream py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Progress */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto pb-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-sm font-semibold">
                1
              </div>
              <span className="ml-2 text-brand-green font-medium hidden sm:inline">Formule</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-brand-cream-dark" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-cream-dark text-brand-brown flex items-center justify-center text-sm">
                2
              </div>
              <span className="ml-2 text-brand-brown hidden sm:inline">Personnaliser</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-brand-cream-dark" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-cream-dark text-brand-brown flex items-center justify-center text-sm">
                3
              </div>
              <span className="ml-2 text-brand-brown hidden sm:inline">Livraison</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-brand-cream-dark" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-cream-dark text-brand-brown flex items-center justify-center text-sm">
                4
              </div>
              <span className="ml-2 text-brand-brown hidden sm:inline">Finaliser</span>
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {boxes.map((box) => (
            <button
              key={box.id}
              onClick={() => setSelectedBox(box.id)}
              className={`relative text-left p-6 rounded-xl border-2 transition-all ${
                selectedBox === box.id
                  ? 'border-brand-green bg-white shadow-lg'
                  : 'border-brand-cream-dark bg-white hover:border-brand-green/50'
              } ${box.popular ? 'ring-2 ring-brand-green ring-offset-2' : ''}`}
            >
              {/* Badge */}
              {box.badge && (
                <span className={`absolute -top-3 left-4 px-3 py-1 text-xs font-semibold rounded-full ${
                  box.id === 'trial' ? 'bg-brand-gold text-brand-brown' : 'bg-brand-green text-white'
                }`}>
                  {box.id === 'trial' ? '🎁 ' : '⭐ '}{box.badge}
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
          <div className="bg-white rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-brand-green mb-4">Fréquence de livraison</h3>
            <div className="flex flex-col sm:flex-row gap-4">
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

        {/* Why Subscribe */}
        <div className="bg-white rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-brand-green mb-4">Pourquoi choisir Borgdanet?</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-xl">🌱</span>
              <div>
                <div className="font-medium text-brand-green">100% Bio</div>
                <div className="text-brand-brown">Produits certifiés</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🚚</span>
              <div>
                <div className="font-medium text-brand-green">Livraison fraîche</div>
                <div className="text-brand-brown">Dans les 24h de la récolte</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🔄</span>
              <div>
                <div className="font-medium text-brand-green">Sans engagement</div>
                <div className="text-brand-brown">Pausez ou annulez à tout moment</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🤝</span>
              <div>
                <div className="font-medium text-brand-green">Prix justes</div>
                <div className="text-brand-brown">70%+ aux fermiers</div>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link
            href="/"
            className="text-brand-brown hover:text-brand-green transition-colors"
          >
            ← Retour à l&apos;accueil
          </Link>
          <button
            onClick={handleContinue}
            disabled={!selectedBox}
            className={`w-full sm:w-auto px-8 py-4 rounded-lg font-semibold transition-colors ${
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
  );
}
