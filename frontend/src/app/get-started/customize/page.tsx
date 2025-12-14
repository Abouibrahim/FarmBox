'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Product {
  id: string;
  name: string;
  image: string | null;
  farm: { name: string };
  unit: string;
}

interface BoxContents {
  included: Product[];
  alternatives: Product[];
}

const CATEGORY_EMOJIS: Record<string, string> = {
  vegetables: '🥬',
  fruits: '🍎',
  herbs: '🌿',
  eggs: '🥚',
  honey: '🍯',
  'olive-oil': '🫒',
  dairy: '🧀',
  default: '📦',
};

export default function CustomizePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const boxType = searchParams.get('box') || 'essentiel';
  const frequency = searchParams.get('frequency') || 'weekly';

  const [contents, setContents] = useState<BoxContents | null>(null);
  const [swaps, setSwaps] = useState<Record<string, string>>({});
  const [preferences, setPreferences] = useState({
    glutenFree: false,
    vegetarian: false,
    lactoseFree: false,
    avoidItems: '',
  });
  const [loading, setLoading] = useState(true);

  const fetchBoxContents = useCallback(async () => {
    try {
      const response = await api.get(`/subscriptions/box-preview?type=${boxType}`);
      setContents(response.data);
    } catch {
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
      });
    } finally {
      setLoading(false);
    }
  }, [boxType]);

  useEffect(() => {
    fetchBoxContents();
  }, [fetchBoxContents]);

  const handleSwap = (originalId: string, newId: string) => {
    if (newId === '') {
      const newSwaps = { ...swaps };
      delete newSwaps[originalId];
      setSwaps(newSwaps);
    } else {
      setSwaps(prev => ({ ...prev, [originalId]: newId }));
    }
  };

  const handleContinue = () => {
    // Store customization in session storage
    sessionStorage.setItem('borgdanet-customization', JSON.stringify({
      boxType,
      frequency,
      swaps,
      preferences,
    }));
    router.push(`/get-started/delivery?box=${boxType}&frequency=${frequency}`);
  };

  const swapCount = Object.keys(swaps).length;

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
    );
  }

  return (
    <main className="min-h-screen bg-brand-cream py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto pb-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-sm">✓</div>
              <span className="ml-2 text-brand-green hidden sm:inline">Formule</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-brand-green" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-sm font-semibold">2</div>
              <span className="ml-2 text-brand-green font-medium hidden sm:inline">Personnaliser</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-brand-cream-dark" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-cream-dark text-brand-brown flex items-center justify-center text-sm">3</div>
              <span className="ml-2 text-brand-brown hidden sm:inline">Livraison</span>
            </div>
            <div className="w-8 sm:w-12 h-0.5 bg-brand-cream-dark" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-cream-dark text-brand-brown flex items-center justify-center text-sm">4</div>
              <span className="ml-2 text-brand-brown hidden sm:inline">Finaliser</span>
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
        <div className="bg-white rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-brand-green">
              Votre box {boxType.charAt(0).toUpperCase() + boxType.slice(1)} contient:
            </h2>
            <span className="text-sm text-brand-brown">
              {swapCount}/3 échanges utilisés
            </span>
          </div>
          <div className="space-y-3">
            {contents?.included.map((product) => {
              const swappedProduct = swaps[product.id]
                ? contents.alternatives.find(a => a.id === swaps[product.id])
                : null;
              const displayProduct = swappedProduct || product;

              return (
                <div
                  key={product.id}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                    swappedProduct ? 'border-brand-gold bg-brand-gold/5' : 'border-brand-cream-dark'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-brand-cream rounded-lg flex items-center justify-center">
                      {displayProduct.image ? (
                        <img
                          src={displayProduct.image}
                          alt={displayProduct.name}
                          className="w-full h-full rounded-lg object-cover"
                        />
                      ) : (
                        <span className="text-2xl">{CATEGORY_EMOJIS.default}</span>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-brand-green">
                        {displayProduct.name}
                        {swappedProduct && (
                          <span className="ml-2 text-xs text-brand-gold">(échangé)</span>
                        )}
                      </div>
                      <div className="text-sm text-brand-brown">
                        {displayProduct.farm.name} • {displayProduct.unit}
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <select
                      value={swaps[product.id] || ''}
                      onChange={(e) => handleSwap(product.id, e.target.value)}
                      disabled={swapCount >= 3 && !swaps[product.id]}
                      className="appearance-none bg-brand-cream px-4 py-2 pr-8 rounded-lg text-sm text-brand-green cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">Garder</option>
                      {contents?.alternatives.map((alt) => (
                        <option key={alt.id} value={alt.id}>
                          Échanger: {alt.name}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-brand-brown">
                      ▼
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-brand-brown mt-4 flex items-center gap-2">
            <span className="text-lg">💡</span>
            Vous pouvez échanger jusqu&apos;à 3 produits par livraison
          </p>
        </div>

        {/* Dietary Preferences */}
        <div className="bg-white rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-brand-green mb-4">Préférences alimentaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            {[
              { key: 'glutenFree', label: 'Sans gluten', emoji: '🌾' },
              { key: 'vegetarian', label: 'Végétarien', emoji: '🥗' },
              { key: 'lactoseFree', label: 'Sans lactose', emoji: '🥛' },
            ].map(({ key, label, emoji }) => (
              <label
                key={key}
                className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                  preferences[key as keyof typeof preferences]
                    ? 'border-brand-green bg-brand-cream'
                    : 'border-brand-cream-dark hover:border-brand-green/50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={preferences[key as keyof typeof preferences] as boolean}
                  onChange={(e) => setPreferences(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="w-5 h-5 rounded border-brand-cream-dark text-brand-green focus:ring-brand-green"
                />
                <span className="text-lg">{emoji}</span>
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
              className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Link
            href={`/get-started?box=${boxType}`}
            className="text-brand-brown hover:text-brand-green transition-colors"
          >
            ← Retour
          </Link>
          <button
            onClick={handleContinue}
            className="w-full sm:w-auto px-8 py-4 bg-brand-green text-white rounded-lg font-semibold hover:bg-brand-green-dark transition-colors"
          >
            Continuer →
          </button>
        </div>
      </div>
    </main>
  );
}
