'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Filter, ChevronDown, X, Loader2, ShoppingCart, Plus } from 'lucide-react';
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
  farm: {
    id: string;
    name: string;
    slug: string;
    city?: string;
  };
  popularity?: {
    score: number;
  };
}

interface Category {
  id: string;
  name: string;
  nameAr: string;
}

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Populaires' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix decroissant' },
  { value: 'newest', label: 'Nouveautes' },
];

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'popularity');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, hasMore: false });

  const { addItem } = useCartStore();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, sortBy]);

  const loadCategories = async () => {
    try {
      const response = await productsApi.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productDiscoveryApi.search({
        q: searchQuery || undefined,
        category: selectedCategory || undefined,
        sort: sortBy as any,
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
    // Update URL params
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortBy) params.set('sort', sortBy);
    router.push(`/products?${params.toString()}`);
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

    // Track cart add for analytics
    try {
      await productDiscoveryApi.recordCartAdd(product.id);
    } catch (error) {
      // Silent fail for analytics
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('popularity');
    router.push('/products');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nos Produits</h1>
        <p className="text-gray-600">
          Decouvrez notre selection de produits frais et bio de nos fermes partenaires
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Toutes les categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort */}
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

          {/* Search Button */}
          <button
            type="submit"
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition flex items-center justify-center"
          >
            <Search className="h-5 w-5 mr-2" />
            Rechercher
          </button>
        </form>

        {/* Active Filters */}
        {(searchQuery || selectedCategory) && (
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500">Filtres actifs:</span>
            {searchQuery && (
              <span className="inline-flex items-center bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">
                &quot;{searchQuery}&quot;
                <button onClick={() => setSearchQuery('')} className="ml-2">
                  <X className="h-4 w-4" />
                </button>
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm">
                {categories.find((c) => c.id === selectedCategory)?.name}
                <button onClick={() => setSelectedCategory('')} className="ml-2">
                  <X className="h-4 w-4" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Effacer tout
            </button>
          </div>
        )}
      </div>

      {/* Category Quick Links */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-6 -mx-4 px-4 scrollbar-hide">
        <button
          onClick={() => setSelectedCategory('')}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition ${
            !selectedCategory
              ? 'bg-primary-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Tous
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedCategory === cat.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          {pagination.total} produit{pagination.total !== 1 ? 's' : ''} trouve{pagination.total !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg mb-4">Aucun produit trouve</p>
          <button
            onClick={clearFilters}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Effacer les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => handleAddToCart(product)}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {pagination.hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              // TODO: Implement pagination
            }}
            className="bg-white border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Voir plus de produits
          </button>
        </div>
      )}
    </div>
  );
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
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
      </Link>

      {/* Content */}
      <div className="p-4">
        {/* Farm Badge */}
        <Link
          href={`/farms/${product.farm.slug}`}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium mb-1 block"
        >
          {product.farm.name}
        </Link>

        {/* Product Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 hover:text-primary-600 transition">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-lg font-bold text-gray-900">
              {Number(product.price).toFixed(3)} TND
            </span>
            <span className="text-sm text-gray-500 ml-1">/ {product.unit}</span>
          </div>
        </div>

        {/* Add to Cart Button */}
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
