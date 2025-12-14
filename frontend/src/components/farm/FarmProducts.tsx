'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cart';

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string | null;
  isInSeason?: boolean;
  isRescue?: boolean;
}

interface FarmProductsProps {
  products: Product[];
  farmSlug: string;
  farmName?: string;
}

export function FarmProducts({ products, farmSlug, farmName = '' }: FarmProductsProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image: product.image || undefined,
      farmId: farmSlug,
      farmName: farmName,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-brand-green">
          Nos produits ({products.length})
        </h2>
        <Link
          href={`/products?farm=${farmSlug}`}
          className="text-brand-green font-medium hover:underline"
        >
          Voir tout →
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🥬</div>
          <p className="text-brand-brown">
            Aucun produit disponible pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.slice(0, 8).map((product) => (
            <div key={product.id} className="bg-brand-cream rounded-lg p-4">
              {/* Product Image */}
              <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-brand-cream-dark flex items-center justify-center">
                    <span className="text-3xl">🥬</span>
                  </div>
                )}
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.isInSeason && (
                    <span className="bg-brand-green text-white text-xs px-2 py-1 rounded">
                      Saison
                    </span>
                  )}
                  {product.isRescue && (
                    <span className="bg-brand-terracotta text-white text-xs px-2 py-1 rounded">
                      -30% Rescue
                    </span>
                  )}
                </div>
              </div>

              {/* Product Info */}
              <h3 className="font-medium text-brand-green mb-1 line-clamp-1">{product.name}</h3>
              <p className="text-brand-brown text-sm mb-3">
                {product.price.toFixed(2)} TND / {product.unit}
              </p>

              {/* Add to Cart */}
              <button
                onClick={() => handleAddToCart(product)}
                className="w-full py-2 bg-brand-green text-white text-sm rounded-lg hover:bg-brand-green-dark transition-colors"
              >
                Ajouter
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
