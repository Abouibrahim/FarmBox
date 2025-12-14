'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { unifiedOrdersApi } from '@/lib/api';
import { CheckoutDelivery } from '@/components/checkout/CheckoutDelivery';
import { CheckoutPayment } from '@/components/checkout/CheckoutPayment';
import { CheckoutSummary } from '@/components/checkout/CheckoutSummary';

type DeliveryType = 'delivery' | 'pickup';
type PaymentMethod = 'flouci' | 'cash';

const deliveryFees: Record<string, { fee: number; freeThreshold: number }> = {
  ZONE_A: { fee: 5, freeThreshold: 80 },
  ZONE_B: { fee: 8, freeThreshold: 120 },
  ZONE_C: { fee: 12, freeThreshold: 150 },
};

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const { items, getSubtotal, getItemsGroupedByFarm, clearCart } = useCartStore();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [zone, setZone] = useState(searchParams.get('zone') || 'ZONE_B');
  const [deliveryDay, setDeliveryDay] = useState('thursday');
  const [timeSlot, setTimeSlot] = useState('evening');
  const [pickupPointId, setPickupPointId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [address, setAddress] = useState({
    street: '',
    city: '',
    postalCode: '',
    phone: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push(`/login?redirect=/checkout?zone=${zone}`);
    }
  }, [mounted, isAuthenticated, router, zone]);

  useEffect(() => {
    if (mounted && items.length === 0) {
      router.push('/cart');
    }
  }, [mounted, items, router]);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-brand-cream py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="animate-pulse">
            <div className="h-8 bg-brand-cream-dark rounded w-64 mb-8" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-white rounded-lg" />
                <div className="h-48 bg-white rounded-lg" />
              </div>
              <div className="h-96 bg-white rounded-lg" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || items.length === 0) {
    return null;
  }

  const subtotal = getSubtotal();
  const zoneConfig = deliveryFees[zone];
  const deliveryFee = deliveryType === 'pickup' ? 0 :
    (subtotal >= zoneConfig.freeThreshold ? 0 : zoneConfig.fee);
  const total = subtotal + deliveryFee;

  const itemsByFarm = getItemsGroupedByFarm();

  // Calculate next delivery date based on selected day
  const getNextDeliveryDate = () => {
    const dayMap: Record<string, number> = { tuesday: 2, thursday: 4, saturday: 6 };
    const targetDay = dayMap[deliveryDay];
    const today = new Date();
    const daysUntilDelivery = (targetDay - today.getDay() + 7) % 7 || 7;
    const deliveryDate = new Date(today);
    deliveryDate.setDate(today.getDate() + daysUntilDelivery);
    return deliveryDate;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      setError('Veuillez accepter les conditions générales de vente');
      return;
    }

    if (deliveryType === 'delivery' && (!address.street || !address.city || !address.phone)) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (deliveryType === 'pickup' && !pickupPointId) {
      setError('Veuillez sélectionner un point de retrait');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const deliveryDate = getNextDeliveryDate();
      const deliveryWindow = timeSlot === 'morning' ? '6:00-9:00' : '18:00-21:00';

      const orderData = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        deliveryType: deliveryType === 'delivery' ? 'DELIVERY' : 'PICKUP',
        deliveryDate: deliveryDate.toISOString(),
        deliveryWindow,
        deliveryAddress: deliveryType === 'delivery'
          ? `${address.street}, ${address.postalCode} ${address.city}`
          : undefined,
        deliveryZone: deliveryType === 'delivery' ? zone : undefined,
        customerNotes: `Tel: ${address.phone}`,
      };

      const response = await unifiedOrdersApi.create(orderData);

      clearCart();
      router.push(`/orders/${response.data.id}/confirmation`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-brand-cream py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/cart"
            className="text-brand-brown hover:text-brand-green transition-colors inline-flex items-center mb-4"
          >
            ← Retour au panier
          </Link>
          <h1 className="font-display text-3xl text-brand-green">
            Finaliser ma commande
          </h1>
        </div>

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
                    className="mt-1 w-5 h-5 rounded border-brand-cream-dark text-brand-green focus:ring-brand-green"
                  />
                  <span className="text-sm text-brand-brown">
                    J&apos;accepte les{' '}
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
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-brand-cream py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="animate-pulse">
            <div className="h-8 bg-brand-cream-dark rounded w-64 mb-8" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-white rounded-lg" />
                <div className="h-48 bg-white rounded-lg" />
              </div>
              <div className="h-96 bg-white rounded-lg" />
            </div>
          </div>
        </div>
      </main>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
