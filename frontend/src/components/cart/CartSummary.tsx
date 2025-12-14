import Link from 'next/link';

interface CartSummaryProps {
  subtotal: number;
  deliveryFee: number;
  total: number;
  selectedZone: string;
  onZoneChange: (zone: string) => void;
  amountForFreeDelivery: number;
}

const zones = [
  { id: 'ZONE_A', label: 'Zone A - Tunis centre', freeAt: 80 },
  { id: 'ZONE_B', label: 'Zone B - Banlieue', freeAt: 120 },
  { id: 'ZONE_C', label: 'Zone C - Périphérie', freeAt: 150 },
];

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
  );
}
