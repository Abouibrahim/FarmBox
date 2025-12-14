'use client';

import { CartItem, getItemDisplayName } from '@/store/cart';

interface CheckoutSummaryProps {
  itemsByFarm: Record<string, CartItem[]>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryType: 'delivery' | 'pickup';
  zone: string;
  loading: boolean;
  error: string;
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
  const farmCount = Object.keys(itemsByFarm).length;
  const itemCount = Object.values(itemsByFarm).flat().length;

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

        <div className="space-y-4 max-h-60 overflow-y-auto">
          {Object.entries(itemsByFarm).map(([farmId, items]) => (
            <div key={farmId}>
              <p className="text-xs text-brand-brown font-medium mb-1">
                🌱 {items[0].farmName}
              </p>
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm py-1">
                  <span className="text-brand-brown">
                    {getItemDisplayName(item)} x{item.quantity}
                  </span>
                  <span className="text-brand-green font-medium">
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
        className="w-full py-4 bg-brand-green text-white rounded-lg font-semibold hover:bg-brand-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Traitement...' : 'Confirmer ma commande'}
      </button>
    </div>
  );
}
