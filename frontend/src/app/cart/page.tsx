'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore, CartItem, getItemDisplayName } from '@/store/cart';
import { EmptyCart } from '@/components/cart/EmptyCart';
import { CartSummary } from '@/components/cart/CartSummary';

const deliveryFees: Record<string, { fee: number; freeThreshold: number }> = {
  ZONE_A: { fee: 5, freeThreshold: 80 },
  ZONE_B: { fee: 8, freeThreshold: 120 },
  ZONE_C: { fee: 12, freeThreshold: 150 },
};

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    getSubtotal,
    getItemsGroupedByFarm,
    clearCart,
  } = useCartStore();

  const [selectedZone, setSelectedZone] = useState<string>('ZONE_B');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen bg-brand-cream py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-brand-cream-dark rounded w-64 mb-8" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-white rounded-lg" />
                ))}
              </div>
              <div className="h-96 bg-white rounded-lg" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  const subtotal = getSubtotal();
  const zoneConfig = deliveryFees[selectedZone];
  const deliveryFee = subtotal >= zoneConfig.freeThreshold ? 0 : zoneConfig.fee;
  const total = subtotal + deliveryFee;
  const amountForFreeDelivery = Math.max(0, zoneConfig.freeThreshold - subtotal);

  const itemsByFarm = getItemsGroupedByFarm();
  const farmIds = Object.keys(itemsByFarm);

  if (items.length === 0) {
    return <EmptyCart />;
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
              const farmItems = itemsByFarm[farmId];
              const farmName = farmItems[0]?.farmName || 'Ferme';

              return (
                <div
                  key={farmId}
                  className="bg-white rounded-lg overflow-hidden shadow-sm"
                >
                  {/* Farm Header */}
                  <div className="bg-brand-cream px-4 py-3 flex items-center gap-2">
                    <span className="text-xl">🌱</span>
                    <Link
                      href={`/farms/${farmItems[0]?.farmSlug || farmId}`}
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
              );
            })}

            {/* Actions */}
            <div className="flex justify-between items-center">
              <button
                onClick={clearCart}
                className="text-sm text-brand-brown hover:text-red-600 transition-colors"
              >
                🗑️ Vider le panier
              </button>
              <Link
                href="/products"
                className="text-sm text-brand-green hover:underline"
              >
                ← Continuer mes achats
              </Link>
            </div>
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
  );
}

// Cart Item Row Component
function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (qty: number) => void;
  onRemove: () => void;
}) {
  const displayName = getItemDisplayName(item);

  return (
    <div className="flex items-center gap-4 p-4">
      {/* Product Image */}
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-brand-cream flex-shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={displayName}
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
        <Link href={`/products/${item.productId}`}>
          <h3 className="font-medium text-brand-green truncate hover:underline">
            {displayName}
          </h3>
        </Link>
        <p className="text-sm text-brand-brown">
          {item.price.toFixed(2)} TND / {item.unit}
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdateQuantity(Math.max(1, item.quantity - 1))}
          className="w-8 h-8 rounded-full bg-brand-cream text-brand-green flex items-center justify-center hover:bg-brand-cream-dark transition-colors font-bold"
        >
          -
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.quantity + 1)}
          className="w-8 h-8 rounded-full bg-brand-cream text-brand-green flex items-center justify-center hover:bg-brand-cream-dark transition-colors font-bold"
        >
          +
        </button>
      </div>

      {/* Item Total */}
      <div className="w-24 text-right hidden sm:block">
        <span className="font-semibold text-brand-green">
          {(item.price * item.quantity).toFixed(2)} TND
        </span>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
        aria-label="Supprimer"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
