'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  MapPin,
  Leaf,
  Calendar,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { productsApi, productDiscoveryApi } from '@/lib/api';
import { useCartStore } from '@/store/cart';

interface Product {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  price: number;
  unit: string;
  minQuantity: number;
  category: string;
  subcategory?: string;
  isAvailable: boolean;
  seasonStart?: number;
  seasonEnd?: number;
  images: string[];
  farm: {
    id: string;
    name: string;
    slug: string;
    phone?: string;
    whatsapp?: string;
    city?: string;
  };
}

const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun',
  'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [farmProducts, setFarmProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    setLoading(true);
    try {
      const response = await productsApi.getById(id as string);
      setProduct(response.data);

      // Record view for analytics
      productDiscoveryApi.recordView(id as string).catch(() => {});

      // Load similar products and farm products
      const [similarRes, farmRes] = await Promise.all([
        productDiscoveryApi.getSimilar(id as string, 4),
        productDiscoveryApi.getByFarm(response.data.farm.id, { excludeId: id as string, limit: 4 }),
      ]);
      setSimilarProducts(similarRes.data);
      setFarmProducts(farmRes.data);
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      farmId: product.farm.id,
      farmName: product.farm.name,
      image: product.images[0],
    }, quantity);

    // Track cart add for analytics
    try {
      await productDiscoveryApi.recordCartAdd(product.id);
    } catch (error) {
      // Silent fail for analytics
    }

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const isInSeason = () => {
    if (!product?.seasonStart || !product?.seasonEnd) return true;
    const currentMonth = new Date().getMonth() + 1;
    if (product.seasonStart <= product.seasonEnd) {
      return currentMonth >= product.seasonStart && currentMonth <= product.seasonEnd;
    }
    return currentMonth >= product.seasonStart || currentMonth <= product.seasonEnd;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Produit non trouve</h1>
        <Link href="/products" className="text-primary-600 hover:text-primary-700">
          Retour aux produits
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">
          Accueil
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/products" className="hover:text-gray-700">
          Produits
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href={`/products?category=${product.category}`} className="hover:text-gray-700 capitalize">
          {product.category}
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-900 truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Retour
      </button>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div>
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            {product.images[selectedImage] ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl">
                  {product.category === 'vegetables' ? '🥬' :
                   product.category === 'fruits' ? '🍎' :
                   product.category === 'herbs' ? '🌿' :
                   product.category === 'eggs' ? '🥚' :
                   product.category === 'honey' ? '🍯' :
                   product.category === 'olive-oil' ? '🫒' :
                   product.category === 'dairy' ? '🧀' : '📦'}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === i ? 'border-primary-600' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          {/* Farm Badge */}
          <Link
            href={`/farms/${product.farm.slug}`}
            className="inline-flex items-center bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-primary-100 transition mb-4"
          >
            <MapPin className="h-4 w-4 mr-1" />
            {product.farm.name}
            {product.farm.city && ` - ${product.farm.city}`}
          </Link>

          {/* Name */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          {product.nameAr && (
            <p className="text-xl text-gray-600 mb-4 font-arabic">{product.nameAr}</p>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-3xl font-bold text-primary-600">
              {Number(product.price).toFixed(3)} TND
            </span>
            <span className="text-gray-500">/ {product.unit}</span>
          </div>

          {/* Availability */}
          <div className="flex items-center gap-4 mb-6">
            {product.isAvailable ? (
              <span className="inline-flex items-center text-green-600 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                En stock
              </span>
            ) : (
              <span className="inline-flex items-center text-red-600 text-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                Indisponible
              </span>
            )}

            {product.seasonStart && product.seasonEnd && (
              <span className={`inline-flex items-center text-sm ${isInSeason() ? 'text-green-600' : 'text-orange-600'}`}>
                <Calendar className="h-4 w-4 mr-1" />
                {isInSeason() ? 'Produit de saison' : `Saison: ${MONTHS[product.seasonStart - 1]} - ${MONTHS[product.seasonEnd - 1]}`}
              </span>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantite ({product.unit})
            </label>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(product.minQuantity, quantity - 1))}
                  className="p-3 hover:bg-gray-100 rounded-l-lg"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(product.minQuantity, Number(e.target.value)))}
                  min={product.minQuantity}
                  step={product.minQuantity}
                  className="w-20 text-center border-x border-gray-300 py-3 focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-100 rounded-r-lg"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <span className="text-gray-600">
                = {(Number(product.price) * quantity).toFixed(3)} TND
              </span>
            </div>
            {product.minQuantity > 1 && (
              <p className="text-sm text-gray-500 mt-1">
                Quantite minimum: {product.minQuantity} {product.unit}
              </p>
            )}
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!product.isAvailable}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-lg text-lg font-semibold transition ${
              addedToCart
                ? 'bg-green-600 text-white'
                : product.isAvailable
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {addedToCart ? (
              'Ajoute au panier!'
            ) : (
              <>
                <ShoppingCart className="h-5 w-5" />
                Ajouter au panier
              </>
            )}
          </button>

          {/* View Cart Link */}
          {addedToCart && (
            <Link
              href="/cart"
              className="block text-center text-primary-600 hover:text-primary-700 mt-4 font-medium"
            >
              Voir le panier
            </Link>
          )}
        </div>
      </div>

      {/* Similar Products */}
      {similarProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Produits similaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* From Same Farm */}
      {farmProducts.length > 0 && (
        <section className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Aussi de {product.farm.name}
            </h2>
            <Link
              href={`/farms/${product.farm.slug}`}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Voir la ferme
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {farmProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/products/${product.id}`}
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
    >
      <div className="aspect-square bg-gray-100">
        {product.images[0] && !imageError ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">
              {product.category === 'vegetables' ? '🥬' :
               product.category === 'fruits' ? '🍎' :
               product.category === 'herbs' ? '🌿' : '📦'}
            </span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
          {product.name}
        </h3>
        <p className="text-primary-600 font-bold text-sm">
          {Number(product.price).toFixed(3)} TND
        </p>
      </div>
    </Link>
  );
}
