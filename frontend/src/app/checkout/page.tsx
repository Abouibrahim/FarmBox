'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { ordersApi } from '@/lib/api';
import { DELIVERY_ZONES, DeliveryZone } from '@/types';
import { formatPrice, getDeliveryFee, getNextDeliveryDate, getDayName } from '@/lib/utils';
import {
  MapPin,
  Calendar,
  Truck,
  Store,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getFarmIds, getItemsByFarm, clearFarmItems } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdOrders, setCreatedOrders] = useState<any[]>([]);

  const [deliveryType, setDeliveryType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>(
    (user?.zone as DeliveryZone) || 'ZONE_A'
  );
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [deliveryWindow, setDeliveryWindow] = useState('6:00-9:00');
  const [customerNotes, setCustomerNotes] = useState('');

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  if (items.length === 0 && !success) {
    router.push('/cart');
    return null;
  }

  const farmIds = getFarmIds();
  const subtotal = getSubtotal();
  const deliveryFee = deliveryType === 'DELIVERY' ? getDeliveryFee(deliveryZone, subtotal) : 0;
  const total = subtotal + deliveryFee * farmIds.length;
  const nextDeliveryDate = getNextDeliveryDate(deliveryZone);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (deliveryType === 'DELIVERY' && !deliveryAddress) {
      setError('Veuillez entrer une adresse de livraison');
      return;
    }

    setLoading(true);

    try {
      const orders = [];

      // Create an order for each farm
      for (const farmId of farmIds) {
        const farmItems = getItemsByFarm(farmId);
        const orderData = {
          farmId,
          items: farmItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          deliveryType,
          deliveryDate: nextDeliveryDate.toISOString(),
          deliveryWindow,
          deliveryAddress: deliveryType === 'DELIVERY' ? deliveryAddress : undefined,
          deliveryZone: deliveryType === 'DELIVERY' ? deliveryZone : undefined,
          customerNotes,
        };

        const response = await ordersApi.create(orderData);
        orders.push(response.data);

        // Clear this farm's items from cart
        clearFarmItems(farmId);
      }

      setCreatedOrders(orders);
      setSuccess(true);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(
        err.response?.data?.error || 'Erreur lors de la commande. Veuillez reessayer.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Commande confirmee!
        </h1>
        <p className="text-gray-600 mb-6">
          Merci pour votre commande. Vous recevrez une confirmation par email.
        </p>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 text-left">
          <h2 className="font-semibold mb-4">Details de la commande</h2>
          {createdOrders.map((order) => (
            <div key={order.id} className="border-b last:border-0 pb-4 mb-4 last:mb-0 last:pb-0">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">N° de commande:</span>
                <span className="font-medium">{order.orderNumber}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Ferme:</span>
                <span className="font-medium">{order.farm.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-semibold text-primary-600">
                  {formatPrice(Number(order.total))}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard/orders"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition"
          >
            Voir mes commandes
          </Link>
          <Link
            href="/farms"
            className="bg-white text-primary-600 px-6 py-3 rounded-lg font-medium border-2 border-primary-600 hover:bg-primary-50 transition"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/cart"
          className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au panier
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Finaliser la commande</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
        {/* Delivery Options */}
        <div className="md:col-span-2 space-y-6">
          {/* Delivery Type */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Mode de livraison</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <label
                className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                  deliveryType === 'DELIVERY'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  value="DELIVERY"
                  checked={deliveryType === 'DELIVERY'}
                  onChange={(e) => setDeliveryType('DELIVERY')}
                  className="sr-only"
                />
                <Truck className="h-6 w-6 text-primary-600 mb-2" />
                <p className="font-medium">Livraison a domicile</p>
                <p className="text-sm text-gray-500">
                  {deliveryFee > 0
                    ? `${deliveryFee} TND par ferme`
                    : 'Gratuite pour cette commande'}
                </p>
              </label>

              <label
                className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                  deliveryType === 'PICKUP'
                    ? 'border-primary-600 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  value="PICKUP"
                  checked={deliveryType === 'PICKUP'}
                  onChange={(e) => setDeliveryType('PICKUP')}
                  className="sr-only"
                />
                <Store className="h-6 w-6 text-primary-600 mb-2" />
                <p className="font-medium">Retrait a la ferme</p>
                <p className="text-sm text-gray-500">Gratuit</p>
              </label>
            </div>
          </div>

          {/* Delivery Details */}
          {deliveryType === 'DELIVERY' && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4">Adresse de livraison</h2>

              {/* Zone */}
              <div className="mb-4">
                <label className="label block mb-1">Zone de livraison</label>
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

              {/* Address */}
              <div className="mb-4">
                <label className="label block mb-1">Adresse complete</label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="input w-full h-24 resize-none"
                  placeholder="Numero, rue, quartier, code postal..."
                  required
                />
              </div>

              {/* Time Window */}
              <div>
                <label className="label block mb-1">Creneau horaire</label>
                <select
                  value={deliveryWindow}
                  onChange={(e) => setDeliveryWindow(e.target.value)}
                  className="input w-full"
                >
                  <option value="6:00-9:00">Matin (6h - 9h)</option>
                  <option value="18:00-21:00">Soir (18h - 21h)</option>
                </select>
              </div>
            </div>
          )}

          {/* Delivery Date */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Date de livraison</h2>
            <div className="flex items-center text-gray-600">
              <Calendar className="h-5 w-5 mr-2" />
              <span>
                {getDayName(nextDeliveryDate.getDay())}{' '}
                {nextDeliveryDate.toLocaleDateString('fr-TN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Commandez avant dimanche soir pour la prochaine livraison
            </p>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4">Notes (optionnel)</h2>
            <textarea
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              className="input w-full h-24 resize-none"
              placeholder="Instructions speciales, allergies, preferences..."
            />
          </div>
        </div>

        {/* Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Resume</h2>

            {/* Items */}
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.productName} x{item.quantity}
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Sous-total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Livraison</span>
                <span>
                  {deliveryFee > 0
                    ? formatPrice(deliveryFee * farmIds.length)
                    : 'Gratuite'}
                </span>
              </div>
            </div>

            <div className="border-t mt-4 pt-4">
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary-600">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Traitement...
                </>
              ) : (
                'Confirmer la commande'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Paiement a la livraison (especes)
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
