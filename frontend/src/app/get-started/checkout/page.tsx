'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: 'flouci' | 'cash';
  acceptTerms: boolean;
}

const boxPrices: Record<string, number> = {
  trial: 33,
  essentiel: 45,
  famille: 75,
  gourmet: 120,
};

const deliveryFees: Record<string, { fee: number; freeThreshold: number }> = {
  ZONE_A: { fee: 5, freeThreshold: 80 },
  ZONE_B: { fee: 8, freeThreshold: 120 },
  ZONE_C: { fee: 12, freeThreshold: 150 },
};

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();

  const boxType = searchParams.get('box') || 'essentiel';
  const frequency = searchParams.get('frequency') || 'weekly';

  const [customization, setCustomization] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    city: '',
    postalCode: '',
    paymentMethod: 'cash',
    acceptTerms: false,
  });

  useEffect(() => {
    const stored = sessionStorage.getItem('borgdanet-customization');
    if (stored) {
      setCustomization(JSON.parse(stored));
    }

    // Pre-fill form if user is logged in
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email || '',
      }));
    }
  }, [user]);

  const boxPrice = boxPrices[boxType] || 45;
  const zone = (customization?.zone as string) || 'ZONE_B';
  const zoneConfig = deliveryFees[zone] || deliveryFees.ZONE_B;
  const deliveryFee = boxPrice >= zoneConfig.freeThreshold ? 0 : zoneConfig.fee;
  const total = boxPrice + deliveryFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptTerms) {
      setError('Veuillez accepter les conditions générales de vente');
      return;
    }

    setLoading(true);
    setError('');

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
      });

      // Clear session storage
      sessionStorage.removeItem('borgdanet-customization');

      // Redirect to success
      router.push(`/get-started/success?id=${response.data.subscription?.id || 'new'}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deliveryDayLabels: Record<string, string> = {
    tuesday: 'Mardi',
    thursday: 'Jeudi',
    saturday: 'Samedi',
  };

  const timeSlotLabels: Record<string, string> = {
    morning: '6h-9h',
    evening: '18h-21h',
  };

  return (
    <main className="min-h-screen bg-brand-cream py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Progress */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto pb-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-sm">✓</div>
                {step < 3 && <div className="w-8 sm:w-12 h-0.5 bg-brand-green ml-2" />}
              </div>
            ))}
            <div className="w-8 sm:w-12 h-0.5 bg-brand-green" />
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-brand-green text-white flex items-center justify-center text-sm font-semibold">4</div>
              <span className="ml-2 text-brand-green font-medium hidden sm:inline">Finaliser</span>
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
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="space-y-6">
              {/* Account Info */}
              {!isAuthenticated && (
                <div className="bg-white rounded-xl p-6">
                  <h2 className="font-semibold text-brand-green mb-4">Votre compte</h2>
                  <p className="text-sm text-brand-brown mb-4">
                    Déjà client? <Link href="/login" className="text-brand-green hover:underline">Connectez-vous</Link>
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-brand-brown text-sm mb-1">Prénom *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                      />
                    </div>
                    <div>
                      <label className="block text-brand-brown text-sm mb-1">Nom *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-brand-brown text-sm mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-brand-brown text-sm mb-1">Téléphone *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+216 XX XXX XXX"
                      required
                      className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-brown text-sm mb-1">Mot de passe *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      placeholder="Minimum 8 caractères"
                      className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                    />
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              <div className="bg-white rounded-xl p-6">
                <h2 className="font-semibold text-brand-green mb-4">Adresse de livraison</h2>
                <div className="mb-4">
                  <label className="block text-brand-brown text-sm mb-1">Adresse *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Numéro et nom de rue"
                    required
                    className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-brand-brown text-sm mb-1">Ville *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                    />
                  </div>
                  <div>
                    <label className="block text-brand-brown text-sm mb-1">Code postal *</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green focus:ring-2 focus:ring-brand-green/20"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl p-6">
                <h2 className="font-semibold text-brand-green mb-4">Mode de paiement</h2>
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    formData.paymentMethod === 'cash'
                      ? 'border-brand-green bg-brand-cream'
                      : 'border-brand-cream-dark hover:border-brand-green/50'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cash"
                      checked={formData.paymentMethod === 'cash'}
                      onChange={handleChange}
                      className="mr-3 text-brand-green focus:ring-brand-green"
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💵</span>
                      <div>
                        <span className="text-brand-brown font-medium">Espèces à la livraison</span>
                        <p className="text-sm text-brand-brown/70">Payez en cash à la réception</p>
                      </div>
                    </div>
                  </label>
                  <label className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    formData.paymentMethod === 'flouci'
                      ? 'border-brand-green bg-brand-cream'
                      : 'border-brand-cream-dark hover:border-brand-green/50'
                  }`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="flouci"
                      checked={formData.paymentMethod === 'flouci'}
                      onChange={handleChange}
                      className="mr-3 text-brand-green focus:ring-brand-green"
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">💳</span>
                      <div>
                        <span className="text-brand-brown font-medium">Flouci (Paiement en ligne)</span>
                        <p className="text-sm text-brand-brown/70">Paiement sécurisé par carte</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div>
              <div className="bg-white rounded-xl p-6 sticky top-24">
                <h2 className="font-semibold text-brand-green mb-4">Récapitulatif</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-brand-brown">Box {boxType.charAt(0).toUpperCase() + boxType.slice(1)}</span>
                    <span className="font-medium text-brand-green">{boxPrice.toFixed(2)} TND</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-brown">Livraison ({zone.replace('_', ' ')})</span>
                    <span className={`font-medium ${deliveryFee === 0 ? 'text-brand-green' : 'text-brand-brown'}`}>
                      {deliveryFee === 0 ? 'Gratuit' : `${deliveryFee.toFixed(2)} TND`}
                    </span>
                  </div>
                  <hr className="border-brand-cream-dark" />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-brand-green">
                      Total {boxType === 'trial' ? '' : frequency === 'weekly' ? 'hebdomadaire' : 'bi-mensuel'}
                    </span>
                    <span className="font-bold text-brand-green">{total.toFixed(2)} TND</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-brand-cream rounded-xl p-4 mb-6">
                  <p className="text-sm text-brand-brown">
                    <strong className="text-brand-green">Première livraison:</strong>
                    <br />
                    {deliveryDayLabels[customization?.deliveryDay as string] || 'Jeudi'},{' '}
                    {timeSlotLabels[customization?.timeSlot as string] || '18h-21h'}
                  </p>
                </div>

                {/* Trust Indicators */}
                <div className="space-y-2 mb-6 text-sm text-brand-brown">
                  <p className="flex items-center gap-2">
                    <span className="text-brand-green">✓</span>
                    Modifiable à tout moment
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-brand-green">✓</span>
                    Annulation sans frais
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-brand-green">✓</span>
                    Satisfaction garantie 100%
                  </p>
                </div>

                {/* Terms */}
                <label className="flex items-start space-x-3 mb-6 cursor-pointer">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 rounded border-brand-cream-dark text-brand-green focus:ring-brand-green"
                  />
                  <span className="text-sm text-brand-brown">
                    J&apos;accepte les{' '}
                    <Link href="/terms" className="text-brand-green hover:underline">
                      conditions générales de vente
                    </Link>{' '}
                    et la{' '}
                    <Link href="/privacy" className="text-brand-green hover:underline">
                      politique de confidentialité
                    </Link>
                  </span>
                </label>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || !formData.acceptTerms}
                  className="w-full py-4 bg-brand-green text-white rounded-lg font-semibold hover:bg-brand-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Traitement...
                    </span>
                  ) : (
                    `Confirmer - ${total.toFixed(2)} TND`
                  )}
                </button>

                <p className="text-xs text-center text-brand-brown/70 mt-4">
                  🔒 Paiement sécurisé - Vos données sont protégées
                </p>
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
  );
}
