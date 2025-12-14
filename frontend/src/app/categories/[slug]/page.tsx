'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronDown,
  Loader2,
  Plus,
  ArrowLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { productDiscoveryApi, productsApi } from '@/lib/api';
import { useCartStore } from '@/store/cart';

interface Product {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  price: number;
  unit: string;
  category: string;
  images: string[];
  isAvailable: boolean;
  seasonStart?: number;
  seasonEnd?: number;
  farm: {
    id: string;
    name: string;
    slug: string;
    city?: string;
  };
}

interface Category {
  id: string;
  name: string;
  nameAr: string;
}

const CATEGORY_INFO: Record<string, { name: string; nameAr: string; emoji: string; description: string }> = {
  vegetables: {
    name: 'Legumes',
    nameAr: 'خضروات',
    emoji: '🥬',
    description: 'Legumes frais et bio de nos fermes tunisiennes',
  },
  fruits: {
    name: 'Fruits',
    nameAr: 'فواكه',
    emoji: '🍎',
    description: 'Fruits de saison cueillis a maturite',
  },
  herbs: {
    name: 'Herbes aromatiques',
    nameAr: 'أعشاب',
    emoji: '🌿',
    description: 'Herbes fraiches pour sublimer vos plats',
  },
  eggs: {
    name: 'Oeufs',
    nameAr: 'بيض',
    emoji: '🥚',
    description: 'Oeufs frais de poules elevees en plein air',
  },
  honey: {
    name: 'Miel',
    nameAr: 'عسل',
    emoji: '🍯',
    description: 'Miel artisanal 100% tunisien',
  },
  'olive-oil': {
    name: "Huile d'olive",
    nameAr: 'زيت زيتون',
    emoji: '🫒',
    description: 'Huile d\'olive extra vierge de Tunisie',
  },
  dairy: {
    name: 'Produits laitiers',
    nameAr: 'منتجات الألبان',
    emoji: '🧀',
    description: 'Fromages et produits laitiers artisanaux',
  },
  other: {
    name: 'Autres',
    nameAr: 'أخرى',
    emoji: '📦',
    description: 'Autres produits de nos fermes',
  },
};

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Populaires' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix decroissant' },
  { value: 'newest', label: 'Nouveautes' },
];

export default function CategoryPage() {
  const { slug } = useParams();
  const router = useRouter();
  const { addItem } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popularity');
  const [pagination, setPagination] = useState({ total: 0, hasMore: false });

  const categoryInfo = CATEGORY_INFO[slug as string] || CATEGORY_INFO.other;

  useEffect(() => {
    if (slug) {
      loadProducts();
    }
  }, [slug, sortBy]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productDiscoveryApi.getByCategory(slug as string, {
        sort: sortBy,
        limit: 20,
      });
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      farmId: product.farm.id,
      farmName: product.farm.name,
      image: product.images[0],
    }, 1);

    try {
      await productDiscoveryApi.recordCartAdd(product.id);
    } catch (error) {
      // Silent fail
    }
  };

  const isInSeason = (product: Product) => {
    if (!product.seasonStart || !product.seasonEnd) return true;
    const currentMonth = new Date().getMonth() + 1;
    if (product.seasonStart <= product.seasonEnd) {
      return currentMonth >= product.seasonStart && currentMonth <= product.seasonEnd;
    }
    return currentMonth >= product.seasonStart || currentMonth <= product.seasonEnd;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-700">
          Accueil
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/categories" className="hover:text-gray-700">
          Categories
        </Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-900">{categoryInfo.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-8 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{categoryInfo.emoji}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{categoryInfo.name}</h1>
            <p className="text-gray-600 font-arabic">{categoryInfo.nameAr}</p>
          </div>
        </div>
        <p className="text-gray-600 mb-6">{categoryInfo.description}</p>

        {/* Subscribe CTA */}
        <Link
          href={`/subscriptions/category?category=${slug}`}
          className="inline-flex items-center bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
        >
          <Calendar className="h-5 w-5 mr-2" />
          S&apos;abonner a une box {categoryInfo.name}
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          {pagination.total} produit{pagination.total !== 1 ? 's' : ''}
        </p>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-6xl mb-4 block">{categoryInfo.emoji}</span>
          <p className="text-gray-500 text-lg mb-4">
            Aucun produit dans cette categorie pour le moment
          </p>
          <Link
            href="/products"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Voir tous les produits
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isInSeason={isInSeason(product)}
              onAddToCart={() => handleAddToCart(product)}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {pagination.hasMore && (
        <div className="mt-8 text-center">
          <button className="bg-white border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition">
            Voir plus de produits
          </button>
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  isInSeason,
  onAddToCart,
}: {
  product: Product;
  isInSeason: boolean;
  onAddToCart: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group hover:shadow-md transition">
      {/* Image */}
      <Link href={`/products/${product.id}`} className="block relative aspect-square">
        {product.images[0] && !imageError ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-4xl">
              {CATEGORY_INFO[product.category]?.emoji || '📦'}
            </span>
          </div>
        )}

        {/* Season Badge */}
        {!isInSeason && (
          <span className="absolute top-2 right-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
            Hors saison
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link
          href={`/farms/${product.farm.slug}`}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium mb-1 block"
        >
          {product.farm.name}
        </Link>

        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-primary-600 transition">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-lg font-bold text-gray-900">
              {Number(product.price).toFixed(3)} TND
            </span>
            <span className="text-sm text-gray-500 ml-1">/ {product.unit}</span>
          </div>
        </div>

        <button
          onClick={onAddToCart}
          disabled={!product.isAvailable}
          className={`mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition ${
            product.isAvailable
              ? 'bg-primary-600 text-white hover:bg-primary-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {product.isAvailable ? (
            <>
              <Plus className="h-4 w-4" />
              Ajouter
            </>
          ) : (
            'Indisponible'
          )}
        </button>
      </div>
    </div>
  );
}
