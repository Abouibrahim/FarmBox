'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { categorySubscriptionsApi, unifiedOrdersApi, productDiscoveryApi } from '@/lib/api';
import { DELIVERY_ZONES, DeliveryZone } from '@/types';
import { formatPrice } from '@/lib/utils';
import {
  Package,
  Calendar,
  Loader2,
  CheckCircle,
  ArrowRight,
  Leaf,
  ChevronRight,
  ShoppingBag,
  Repeat,
  AlertCircle,
  Info,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'vegetables', name: 'Legumes', nameAr: 'خضروات', emoji: '🥬', description: 'Legumes frais et de saison' },
  { id: 'fruits', name: 'Fruits', nameAr: 'فواكه', emoji: '🍎', description: 'Fruits murs et delicieux' },
  { id: 'herbs', name: 'Herbes aromatiques', nameAr: 'أعشاب', emoji: '🌿', description: 'Herbes fraiches pour vos plats' },
  { id: 'eggs', name: 'Oeufs', nameAr: 'بيض', emoji: '🥚', description: 'Oeufs de poules elevees en plein air' },
  { id: 'honey', name: 'Miel', nameAr: 'عسل', emoji: '🍯', description: 'Miel artisanal 100% tunisien' },
  { id: 'olive-oil', name: "Huile d'olive", nameAr: 'زيت زيتون', emoji: '🫒', description: 'Huile d\'olive extra vierge' },
  { id: 'dairy', name: 'Produits laitiers', nameAr: 'منتجات الألبان', emoji: '🧀', description: 'Fromages et yaourts artisanaux' },
  { id: 'mixed', name: 'Box Mixte', nameAr: 'صندوق متنوع', emoji: '📦', description: 'Un peu de tout!' },
];

const BOX_SIZES = [
  { id: 'SMALL', name: 'Petite Box', price: 25, description: 'Ideal pour 1-2 personnes', items: '4-6 produits' },
  { id: 'MEDIUM', name: 'Box Moyenne', price: 45, description: 'Parfait pour une famille', items: '8-10 produits' },
  { id: 'LARGE', name: 'Grande Box', price: 75, description: 'Pour les gourmands!', items: '12-15 produits' },
];

const FREQUENCIES = [
  { id: 'ONCE', name: 'Achat unique', discount: 0, isOneTime: true },
  { id: 'WEEKLY', name: 'Chaque semaine', discount: 0, isOneTime: false },
  { id: 'BIWEEKLY', name: 'Toutes les 2 semaines', discount: 0, isOneTime: false },
];

const DELIVERY_DAYS = [
  { id: 2, name: 'Mardi' },
  { id: 3, name: 'Mercredi' },
  { id: 5, name: 'Vendredi' },
  { id: 6, name: 'Samedi' },
];

export default function CategorySubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuthStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdSubscription, setCreatedSubscription] = useState<any>(null);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [duplicateSubscription, setDuplicateSubscription] = useState<any>(null);

  // Form state
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedBoxSize, setSelectedBoxSize] = useState('MEDIUM');
  const [selectedFrequency, setSelectedFrequency] = useState('ONCE');
  const [selectedDeliveryDay, setSelectedDeliveryDay] = useState(5); // Friday
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>(
    (user?.zone as DeliveryZone) || 'ZONE_A'
  );
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [preferences, setPreferences] = useState({
    excludeItems: '',
    notes: '',
  });
  const [categoryProductCounts, setCategoryProductCounts] = useState<Record<string, number>>({});

  const selectedBox = BOX_SIZES.find(b => b.id === selectedBoxSize)!;
  const isOneTimePurchase = selectedFrequency === 'ONCE';

  // Fetch product counts for each category
  useEffect(() => {
    const fetchCounts = async () => {
      const counts: Record<string, number> = {};
      for (const cat of CATEGORIES) {
        try {
          const response = await productDiscoveryApi.getByCategory(cat.id, { limit: 1 });
          counts[cat.id] = response.data.pagination?.total || 0;
        } catch {
          counts[cat.id] = 0;
        }
      }
      setCategoryProductCounts(counts);
    };
    fetchCounts();
  }, []);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/subscriptions/category');
      return;
    }

    if (!deliveryAddress) {
      setError('Veuillez entrer une adresse de livraison');
      return;
    }

    setLoading(true);
    setError('');
    setDuplicateSubscription(null);

    try {
      if (isOneTimePurchase) {
        // One-time purchase: fetch products and create a unified order
        const productsResponse = await productDiscoveryApi.getByCategory(selectedCategory, { limit: 10 });
        const products = productsResponse.data.products || productsResponse.data || [];

        if (products.length === 0) {
          const categoryName = CATEGORIES.find(c => c.id === selectedCategory)?.name || selectedCategory;
          setError(`Aucun produit disponible dans la categorie "${categoryName}" pour le moment. Veuillez choisir une autre categorie.`);
          setLoading(false);
          return;
        }

        // Calculate how many items to include based on box size
        const itemCounts: Record<string, number> = { SMALL: 4, MEDIUM: 6, LARGE: 8 };
        const itemCount = itemCounts[selectedBoxSize] || 6;
        const selectedProducts = products.slice(0, itemCount);

        // Calculate delivery date (next selected day)
        const deliveryDate = calculateNextDeliveryDay(selectedDeliveryDay);

        const orderData = {
          items: selectedProducts.map((p: any) => ({
            productId: p.id,
            quantity: 1,
          })),
          deliveryType: 'DELIVERY' as const,
          deliveryDate: deliveryDate.toISOString().split('T')[0],
          deliveryAddress,
          deliveryZone,
          customerNotes: preferences.notes || `Box ${CATEGORIES.find(c => c.id === selectedCategory)?.name} - Achat unique`,
        };

        const response = await unifiedOrdersApi.create(orderData);
        setCreatedOrder(response.data);
        setSuccess(true);
      } else {
        // Subscription: create category subscription
        const data = {
          category: selectedCategory,
          boxSize: selectedBoxSize as 'SMALL' | 'MEDIUM' | 'LARGE' | 'FAMILY',
          frequency: selectedFrequency as 'WEEKLY' | 'BIWEEKLY',
          deliveryDay: selectedDeliveryDay,
          deliveryZone: deliveryZone as string,
          deliveryAddress,
          preferences: {
            excludeItems: preferences.excludeItems.split(',').map(s => s.trim()).filter(Boolean),
            notes: preferences.notes,
          },
        };

        const response = await categorySubscriptionsApi.create(data);
        setCreatedSubscription(response.data);
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Error:', err);
      console.error('Error message:', err.message);
      console.error('Error code:', err.code);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      console.error('Error request:', err.request);

      // Handle different error types with specific messages
      if (err.code === 'ECONNABORTED') {
        setError('La requete a expire. Veuillez reessayer.');
        setLoading(false);
        return;
      }

      if (err.message === 'Network Error') {
        setError('Erreur reseau. Veuillez verifier votre connexion internet et reessayer.');
        setLoading(false);
        return;
      }

      if (!err.response) {
        setError(`Erreur de connexion: ${err.message || 'Impossible de joindre le serveur'}. Veuillez reessayer.`);
        setLoading(false);
        return;
      }

      const errorMessage = err.response?.data?.error || err.message || '';

      // Check if it's a duplicate subscription error
      if (errorMessage.includes('already have an active subscription')) {
        setDuplicateSubscription({
          category: selectedCategory,
          categoryName: CATEGORIES.find(c => c.id === selectedCategory)?.name,
        });
      } else if (err.response?.status === 401) {
        setError('Vous devez etre connecte(e) pour creer un abonnement. Veuillez vous connecter.');
      } else {
        setError(errorMessage || 'Erreur lors de la creation. Veuillez reessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate next delivery day
  const calculateNextDeliveryDay = (dayOfWeek: number): Date => {
    const today = new Date();
    const currentDay = today.getDay();
    let daysUntil = dayOfWeek - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysUntil);
    return nextDate;
  };

  // Success screen for one-time order
  if (success && createdOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Commande confirmee!
        </h1>
        <p className="text-gray-600 mb-2">
          Votre box sera livree le prochain {DELIVERY_DAYS.find(d => d.id === selectedDeliveryDay)?.name}.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Numero de commande: <span className="font-mono font-semibold">{createdOrder.orderNumber}</span>
        </p>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 text-left">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{CATEGORIES.find(c => c.id === selectedCategory)?.emoji}</span>
            <div>
              <h2 className="font-semibold text-lg">
                Box {CATEGORIES.find(c => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-gray-500">{selectedBox.name} - Achat unique</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-semibold text-primary-600">{formatPrice(Number(createdOrder.total))}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard/orders"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
          >
            Voir mes commandes
          </Link>
          <Link
            href="/subscriptions/category"
            onClick={(e) => { e.preventDefault(); setSuccess(false); setCreatedOrder(null); }}
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium border-2 border-primary-600 hover:bg-primary-50 transition"
          >
            Commander une autre box
          </Link>
        </div>

        {/* Subscription CTA */}
        <div className="mt-8 p-4 bg-primary-50 rounded-lg">
          <p className="text-sm text-gray-700 mb-2">
            Vous avez aime cette box? Abonnez-vous pour la recevoir regulierement!
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setCreatedOrder(null);
              setSelectedFrequency('WEEKLY');
            }}
            className="text-primary-600 font-medium hover:underline text-sm"
          >
            Passer a l&apos;abonnement
          </button>
        </div>
      </div>
    );
  }

  // Success screen for subscription
  if (success && createdSubscription) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Abonnement cree avec succes!
        </h1>
        <p className="text-gray-600 mb-8">
          Votre premiere box sera livree le prochain {DELIVERY_DAYS.find(d => d.id === selectedDeliveryDay)?.name}.
        </p>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 text-left">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-4xl">{CATEGORIES.find(c => c.id === selectedCategory)?.emoji}</span>
            <div>
              <h2 className="font-semibold text-lg">
                Box {CATEGORIES.find(c => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-gray-500">{selectedBox.name} - {selectedBox.items}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Frequence:</span>
              <span>{FREQUENCIES.find(f => f.id === selectedFrequency)?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Jour de livraison:</span>
              <span>{DELIVERY_DAYS.find(d => d.id === selectedDeliveryDay)?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Prix:</span>
              <span className="font-semibold text-primary-600">{formatPrice(selectedBox.price)} / box</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard/subscriptions"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
          >
            Gerer mes abonnements
          </Link>
          <Link
            href="/products"
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium border-2 border-primary-600 hover:bg-primary-50 transition"
          >
            Voir les produits
          </Link>
        </div>
      </div>
    );
  }

  // Duplicate subscription message
  if (duplicateSubscription) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Info className="h-10 w-10 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Vous avez deja un abonnement actif!
        </h1>
        <p className="text-gray-600 mb-8">
          Vous etes deja abonne a la categorie <strong>{duplicateSubscription.categoryName}</strong>.
          Vous pouvez gerer votre abonnement existant ou commander une box unique.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard/subscriptions"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
          >
            Gerer mon abonnement
          </Link>
          <button
            onClick={() => {
              setDuplicateSubscription(null);
              setSelectedFrequency('ONCE');
            }}
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium border-2 border-primary-600 hover:bg-primary-50 transition"
          >
            Commander une box unique
          </button>
        </div>

        <div className="mt-8">
          <button
            onClick={() => {
              setDuplicateSubscription(null);
              setStep(1);
              setSelectedCategory('');
            }}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Choisir une autre categorie
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">Accueil</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-900">Abonnement par categorie</span>
      </nav>

      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="h-8 w-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Abonnement Box par Categorie
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Recevez chaque semaine une selection de produits frais de votre categorie preferee,
          provenant de plusieurs fermes partenaires.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <button
              onClick={() => s < step && setStep(s)}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                s <= step
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s}
            </button>
            {s < 3 && (
              <div className={`w-20 h-1 mx-2 ${s < step ? 'bg-primary-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Step 1: Category Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-center mb-6">
            1. Choisissez votre categorie
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat) => {
              const productCount = categoryProductCounts[cat.id] ?? -1;
              const hasProducts = productCount > 0;
              const isLoading = productCount === -1;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-4 rounded-xl border-2 text-center transition relative ${
                    selectedCategory === cat.id
                      ? 'border-primary-600 bg-primary-50'
                      : hasProducts || isLoading
                        ? 'border-gray-200 hover:border-gray-300'
                        : 'border-gray-100 bg-gray-50 opacity-60'
                  }`}
                >
                  <span className="text-4xl block mb-2">{cat.emoji}</span>
                  <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
                  {!isLoading && (
                    <p className={`text-xs mt-2 ${hasProducts ? 'text-green-600' : 'text-orange-500'}`}>
                      {hasProducts ? `${productCount} produit${productCount > 1 ? 's' : ''}` : 'Bientot disponible'}
                    </p>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={() => selectedCategory && setStep(2)}
              disabled={!selectedCategory}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              Continuer
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Box Size & Frequency */}
      {step === 2 && (
        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-center mb-6">
            2. Taille et frequence
          </h2>

          {/* Box Size */}
          <div>
            <h3 className="font-medium text-gray-700 mb-4">Taille de la box</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {BOX_SIZES.map((box) => (
                <button
                  key={box.id}
                  onClick={() => setSelectedBoxSize(box.id)}
                  className={`p-6 rounded-xl border-2 text-left transition ${
                    selectedBoxSize === box.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Package className={`h-6 w-6 ${selectedBoxSize === box.id ? 'text-primary-600' : 'text-gray-400'}`} />
                    {selectedBoxSize === box.id && (
                      <CheckCircle className="h-5 w-5 text-primary-600" />
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900">{box.name}</h4>
                  <p className="text-sm text-gray-500">{box.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{box.items}</p>
                  <p className="text-2xl font-bold text-primary-600 mt-3">
                    {formatPrice(box.price)}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div>
            <h3 className="font-medium text-gray-700 mb-4">Type de commande</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {FREQUENCIES.map((freq) => (
                <button
                  key={freq.id}
                  onClick={() => setSelectedFrequency(freq.id)}
                  className={`p-4 rounded-xl border-2 text-center transition ${
                    selectedFrequency === freq.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {freq.isOneTime ? (
                    <ShoppingBag className={`h-6 w-6 mx-auto mb-2 ${selectedFrequency === freq.id ? 'text-primary-600' : 'text-gray-400'}`} />
                  ) : (
                    <Repeat className={`h-6 w-6 mx-auto mb-2 ${selectedFrequency === freq.id ? 'text-primary-600' : 'text-gray-400'}`} />
                  )}
                  <h4 className="font-semibold text-gray-900">{freq.name}</h4>
                  {freq.isOneTime && (
                    <p className="text-xs text-gray-500 mt-1">Sans engagement</p>
                  )}
                </button>
              ))}
            </div>
            {isOneTimePurchase && (
              <p className="text-sm text-gray-500 mt-3 flex items-center justify-center">
                <Info className="h-4 w-4 mr-1" />
                Commandez une box sans engagement, payez a la livraison
              </p>
            )}
            {isOneTimePurchase && categoryProductCounts[selectedCategory] === 0 && (
              <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-700 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Cette categorie n&apos;a pas encore de produits. L&apos;achat unique n&apos;est pas disponible.
                </p>
              </div>
            )}
          </div>

          {/* Delivery Day */}
          <div>
            <h3 className="font-medium text-gray-700 mb-4">Jour de livraison prefere</h3>
            <div className="grid grid-cols-4 gap-4">
              {DELIVERY_DAYS.map((day) => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDeliveryDay(day.id)}
                  className={`p-3 rounded-lg border-2 text-center transition ${
                    selectedDeliveryDay === day.id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {day.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(1)}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Retour
            </button>
            <button
              onClick={() => setStep(3)}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center"
            >
              Continuer
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Delivery & Preferences */}
      {step === 3 && (
        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-center mb-6">
            3. Livraison et preferences
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4">Adresse de livraison</h3>

              <div className="space-y-4">
                <div>
                  <label className="label block mb-1">Zone</label>
                  <select
                    value={deliveryZone}
                    onChange={(e) => setDeliveryZone(e.target.value as DeliveryZone)}
                    className="input w-full"
                  >
                    {Object.entries(DELIVERY_ZONES).map(([key, zone]) => (
                      <option key={key} value={key}>
                        {zone.nameFr} - {zone.cities.join(', ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label block mb-1">Adresse complete</label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="input w-full h-24 resize-none"
                    placeholder="Numero, rue, quartier, code postal..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4">Preferences (optionnel)</h3>

              <div className="space-y-4">
                <div>
                  <label className="label block mb-1">Produits a exclure</label>
                  <input
                    type="text"
                    value={preferences.excludeItems}
                    onChange={(e) => setPreferences({ ...preferences, excludeItems: e.target.value })}
                    className="input w-full"
                    placeholder="Ex: tomates, courgettes (separees par des virgules)"
                  />
                </div>

                <div>
                  <label className="label block mb-1">Notes speciales</label>
                  <textarea
                    value={preferences.notes}
                    onChange={(e) => setPreferences({ ...preferences, notes: e.target.value })}
                    className="input w-full h-20 resize-none"
                    placeholder="Allergies, preferences, instructions speciales..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-primary-50 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4">
              {isOneTimePurchase ? 'Resume de votre commande' : 'Resume de votre abonnement'}
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{CATEGORIES.find(c => c.id === selectedCategory)?.emoji}</span>
                  <div>
                    <p className="font-medium">Box {CATEGORIES.find(c => c.id === selectedCategory)?.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedBox.name} - {isOneTimePurchase ? 'Achat unique' : selectedBox.items}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="flex items-center">
                    {isOneTimePurchase ? (
                      <><ShoppingBag className="h-4 w-4 mr-1" /> Achat unique</>
                    ) : (
                      <><Repeat className="h-4 w-4 mr-1" /> {FREQUENCIES.find(f => f.id === selectedFrequency)?.name}</>
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jour:</span>
                  <span>{DELIVERY_DAYS.find(d => d.id === selectedDeliveryDay)?.name}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold mt-2 pt-2 border-t border-primary-200">
                  <span>{isOneTimePurchase ? 'Prix:' : 'Prix par box:'}</span>
                  <span className="text-primary-600">{formatPrice(selectedBox.price)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(2)}
              className="text-gray-600 hover:text-gray-900 font-medium"
            >
              Retour
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !deliveryAddress}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {isOneTimePurchase ? 'Commande en cours...' : 'Creation en cours...'}
                </>
              ) : (
                <>
                  {isAuthenticated
                    ? (isOneTimePurchase ? 'Commander ma box' : 'Confirmer l\'abonnement')
                    : 'Se connecter pour continuer'}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Features */}
      <div className="mt-16 border-t pt-12">
        <h2 className="text-xl font-semibold text-center mb-8">Pourquoi s&apos;abonner?</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Produits ultra-frais</h3>
            <p className="text-sm text-gray-600">
              Cueillis quelques heures avant la livraison
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Variete garantie</h3>
            <p className="text-sm text-gray-600">
              Selection de plusieurs fermes partenaires
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Flexible</h3>
            <p className="text-sm text-gray-600">
              Pausez ou annulez a tout moment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
