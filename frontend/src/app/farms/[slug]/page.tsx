'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { farmsApi } from '@/lib/api';
import { useCartStore } from '@/store/cart';
import { Farm, Product, PRODUCT_CATEGORIES, DELIVERY_ZONES } from '@/types';
import { formatPrice } from '@/lib/utils';
import {
  MapPin,
  Star,
  Phone,
  Mail,
  CheckCircle,
  Plus,
  Minus,
  ShoppingCart,
  ArrowLeft,
  Truck,
} from 'lucide-react';

export default function FarmDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { addItem, getItemCount, getItemsByFarm } = useCartStore();
  const cartItemCount = getItemCount();

  useEffect(() => {
    if (slug) {
      loadFarm();
    }
  }, [slug]);

  const loadFarm = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await farmsApi.getBySlug(slug);
      setFarm(response.data);
    } catch (err: any) {
      console.error('Failed to load farm:', err);
      if (err.response?.status === 404) {
        setError('Ferme non trouvee');
      } else {
        setError('Impossible de charger la ferme');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[productId] || 1;
      const newQty = Math.max(1, current + delta);
      return { ...prev, [productId]: newQty };
    });
  };

  const handleAddToCart = (product: Product) => {
    const quantity = quantities[product.id] || 1;
    addItem(
      {
        productId: product.id,
        productName: product.name,
        productNameAr: product.nameAr,
        farmId: farm!.id,
        farmName: farm!.name,
        farmSlug: farm!.slug,
        price: Number(product.price),
        unit: product.unit,
        image: product.images?.[0],
      },
      quantity
    );
    // Reset quantity after adding
    setQuantities((prev) => ({ ...prev, [product.id]: 1 }));
  };

  const filteredProducts = farm?.products?.filter((p) =>
    selectedCategory ? p.category === selectedCategory : true
  );

  const categories = farm?.products
    ? [...new Set(farm.products.map((p) => p.category))]
    : [];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-xl mb-8" />
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !farm) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{error}</h1>
        <Link href="/farms" className="text-primary-600 font-medium hover:underline">
          ← Retour aux fermes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        href="/farms"
        className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour aux fermes
      </Link>

      {/* Farm Header */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        {/* Cover Image */}
        <div className="h-64 bg-gradient-to-br from-primary-100 to-primary-200 relative">
          {farm.coverImage ? (
            <img
              src={farm.coverImage}
              alt={farm.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl">🌾</span>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{farm.name}</h1>
                {farm.isVerified && (
                  <span className="bg-primary-100 text-primary-600 text-sm px-3 py-1 rounded-full flex items-center font-medium">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Verifie
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {farm.city}
                </span>
                {farm.averageRating && farm.averageRating > 0 && (
                  <span className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    {farm.averageRating.toFixed(1)} ({farm._count?.reviews || 0} avis)
                  </span>
                )}
              </div>

              {farm.description && (
                <p className="text-gray-600 mb-4">{farm.description}</p>
              )}

              {/* Contact Info */}
              <div className="flex flex-wrap gap-4">
                {farm.phone && (
                  <a
                    href={`tel:${farm.phone}`}
                    className="flex items-center text-sm text-gray-600 hover:text-primary-600"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    {farm.phone}
                  </a>
                )}
                {farm.email && (
                  <a
                    href={`mailto:${farm.email}`}
                    className="flex items-center text-sm text-gray-600 hover:text-primary-600"
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    {farm.email}
                  </a>
                )}
              </div>
            </div>

            {/* Delivery Zones */}
            <div className="mt-6 md:mt-0 md:ml-8 bg-gray-50 rounded-lg p-4 min-w-[200px]">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Truck className="h-4 w-4 mr-2" />
                Zones de livraison
              </h3>
              <div className="space-y-1">
                {farm.deliveryZones.map((zone) => (
                  <div key={zone} className="text-sm text-gray-600">
                    {DELIVERY_ZONES[zone]?.nameFr || zone}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      {farm.story && (
        <div className="bg-primary-50 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Notre histoire</h2>
          <p className="text-gray-700 whitespace-pre-line">{farm.story}</p>
        </div>
      )}

      {/* Products Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
            Nos produits ({farm.products?.length || 0})
          </h2>

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  selectedCategory === ''
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              {categories.map((cat) => {
                const category = PRODUCT_CATEGORIES.find((c) => c.id === cat);
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      selectedCategory === cat
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category?.icon} {category?.name || cat}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={quantities[product.id] || 1}
                onQuantityChange={(delta) => handleQuantityChange(product.id, delta)}
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">Aucun produit disponible dans cette categorie</p>
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <Link
            href="/cart"
            className="bg-primary-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-primary-700 transition flex items-center font-medium"
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Voir le panier ({cartItemCount})
          </Link>
        </div>
      )}

      {/* Reviews Section */}
      {farm.reviews && farm.reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Avis clients ({farm.reviews.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {farm.reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{review.customer.name}</span>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  quantity,
  onQuantityChange,
  onAddToCart,
}: {
  product: Product;
  quantity: number;
  onQuantityChange: (delta: number) => void;
  onAddToCart: () => void;
}) {
  const category = PRODUCT_CATEGORIES.find((c) => c.id === product.category);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
      {/* Image */}
      <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 relative">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            {category?.icon || '🌱'}
          </div>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
              Indisponible
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-1">
          <span className="text-xs text-gray-500">{category?.name}</span>
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
        {product.nameAr && (
          <p className="text-sm text-gray-500 mb-2" dir="rtl">
            {product.nameAr}
          </p>
        )}
        <p className="text-primary-600 font-bold mb-3">
          {formatPrice(Number(product.price))} / {product.unit}
        </p>

        {product.isAvailable && (
          <div className="flex items-center gap-2">
            {/* Quantity Selector */}
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => onQuantityChange(-1)}
                className="p-2 hover:bg-gray-100 transition"
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="px-3 font-medium">{quantity}</span>
              <button
                onClick={() => onQuantityChange(1)}
                className="p-2 hover:bg-gray-100 transition"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={onAddToCart}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition flex items-center justify-center font-medium"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
