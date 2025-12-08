'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore, CartItem } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { DELIVERY_ZONES, DeliveryZone } from '@/types';
import { formatPrice, getDeliveryFee } from '@/lib/utils';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, clearCart, getSubtotal, getFarmIds } =
    useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const farmIds = getFarmIds();

  // Group items by farm
  const itemsByFarm: Record<string, CartItem[]> = {};
  items.forEach((item) => {
    if (!itemsByFarm[item.farmId]) {
      itemsByFarm[item.farmId] = [];
    }
    itemsByFarm[item.farmId].push(item);
  });

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      router.push('/login?redirect=/checkout');
    } else {
      router.push('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="h-10 w-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Votre panier est vide</h1>
        <p className="text-gray-600 mb-8">
          Decouvrez nos fermes partenaires et ajoutez des produits a votre panier
        </p>
        <Link
          href="/farms"
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition inline-flex items-center"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voir les fermes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mon Panier</h1>
        <button
          onClick={() => clearCart()}
          className="text-red-600 text-sm hover:underline flex items-center"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Vider le panier
        </button>
      </div>

      {/* Multiple Farms Warning */}
      {farmIds.length > 1 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">
              Produits de plusieurs fermes
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Vous avez des produits de {farmIds.length} fermes differentes.
              Chaque ferme aura sa propre commande et livraison.
            </p>
          </div>
        </div>
      )}

      {/* Cart Items by Farm */}
      <div className="space-y-8 mb-8">
        {Object.entries(itemsByFarm).map(([farmId, farmItems]) => {
          const farmSubtotal = farmItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );

          return (
            <div key={farmId} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Farm Header */}
              <div className="bg-gray-50 px-4 py-3 border-b">
                <Link
                  href={`/farms/${farmItems[0].farmSlug}`}
                  className="font-semibold text-gray-900 hover:text-primary-600"
                >
                  {farmItems[0].farmName}
                </Link>
              </div>

              {/* Items */}
              <div className="divide-y">
                {farmItems.map((item) => (
                  <CartItemRow
                    key={item.productId}
                    item={item}
                    onQuantityChange={(qty) => updateQuantity(item.productId, qty)}
                    onRemove={() => removeItem(item.productId)}
                  />
                ))}
              </div>

              {/* Farm Subtotal */}
              <div className="bg-gray-50 px-4 py-3 flex justify-between items-center">
                <span className="text-gray-600">Sous-total ({farmItems[0].farmName})</span>
                <span className="font-semibold">{formatPrice(farmSubtotal)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="font-semibold text-lg mb-4">Resume de la commande</h2>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Sous-total</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Frais de livraison</span>
            <span>Calcule a l&apos;etape suivante</span>
          </div>
        </div>

        <div className="border-t pt-4 mb-6">
          <div className="flex justify-between text-lg">
            <span className="font-semibold">Total estime</span>
            <span className="font-bold text-primary-600">{formatPrice(subtotal)}</span>
          </div>
        </div>

        <button
          onClick={handleProceedToCheckout}
          className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition flex items-center justify-center"
        >
          {isAuthenticated ? 'Passer la commande' : 'Se connecter pour commander'}
          <ArrowRight className="h-5 w-5 ml-2" />
        </button>

        <Link
          href="/farms"
          className="block text-center mt-4 text-primary-600 hover:underline"
        >
          Continuer vos achats
        </Link>
      </div>
    </div>
  );
}

function CartItemRow({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: CartItem;
  onQuantityChange: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="p-4 flex items-center gap-4">
      {/* Image */}
      <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            🌱
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">{item.productName}</h3>
        <p className="text-sm text-gray-500">
          {formatPrice(item.price)} / {item.unit}
        </p>
      </div>

      {/* Quantity */}
      <div className="flex items-center border rounded-lg">
        <button
          onClick={() => onQuantityChange(item.quantity - 1)}
          className="p-2 hover:bg-gray-100 transition"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="px-3 font-medium min-w-[40px] text-center">{item.quantity}</span>
        <button
          onClick={() => onQuantityChange(item.quantity + 1)}
          className="p-2 hover:bg-gray-100 transition"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Total */}
      <div className="text-right min-w-[80px]">
        <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="p-2 text-gray-400 hover:text-red-600 transition"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
}
