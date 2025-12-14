'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { productDiscoveryApi, productsApi } from '@/lib/api';
import { useCartStore } from '@/store/cart';

// Import new Borgdanet components
import { TrustBar } from '@/components/brand/TrustBar';
import { HeroSection } from '@/components/home/HeroSection';
import { HowItWorks } from '@/components/home/HowItWorks';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FarmCarousel } from '@/components/home/FarmCarousel';
import { SubscriptionOptions } from '@/components/home/SubscriptionOptions';
import { StandardsSection } from '@/components/home/StandardsSection';

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
  images: string[];
  isAvailable: boolean;
  farm: {
    id: string;
    name: string;
    slug: string;
  };
}

const CATEGORY_ICONS: Record<string, string> = {
  vegetables: '🥬',
  fruits: '🍎',
  herbs: '🌿',
  eggs: '🥚',
  honey: '🍯',
  'olive-oil': '🫒',
  dairy: '🧀',
  other: '📦',
};

export default function HomePage() {
  const [seasonalProducts, setSeasonalProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [seasonalRes, popularRes] = await Promise.all([
        productDiscoveryApi.getSeasonal({ limit: 4 }),
        productDiscoveryApi.getPopular({ limit: 4 }),
      ]);
      setSeasonalProducts(seasonalRes.data);
      setPopularProducts(popularRes.data);
    } catch (error) {
      console.log('Products will load from API when available');
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
    } catch (error) { /* silently fail */ }
  };

  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* Trust Bar */}
      <TrustBar />

      {/* How It Works */}
      <HowItWorks />

      {/* Category Grid */}
      <CategoryGrid />

      {/* Farm Carousel */}
      <FarmCarousel />

      {/* Subscription Options */}
      <SubscriptionOptions />

      {/* Seasonal Products */}
      {seasonalProducts.length > 0 && (
        <section className="py-16 bg-brand-cream">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="inline-flex items-center bg-brand-green/10 text-brand-green text-sm px-3 py-1 rounded-full mb-2">
                  🍊 Cette saison
                </span>
                <h2 className="font-display text-3xl text-brand-green">
                  Produits de saison
                </h2>
              </div>
              <Link
                href="/products?seasonal=true"
                className="text-brand-green hover:text-brand-green-dark font-medium flex items-center"
              >
                Voir tous →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {seasonalProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => handleAddToCart(product)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Standards Section */}
      <StandardsSection />

      {/* Popular Products */}
      {popularProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-3xl text-brand-green">
                Populaires cette semaine
              </h2>
              <Link
                href="/products?sort=popularity"
                className="text-brand-green hover:text-brand-green-dark font-medium flex items-center"
              >
                Voir tous →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {popularProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => handleAddToCart(product)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Impact Section */}
      <section className="py-16 bg-brand-green text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl lg:text-4xl mb-4">
              Notre impact collectif
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Ensemble, nous changeons le système alimentaire tunisien
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 rounded-2xl p-6 text-center">
              <p className="text-4xl font-bold mb-2">45+</p>
              <p className="text-white/80">Fermes partenaires</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 text-center">
              <p className="text-4xl font-bold mb-2">12,500</p>
              <p className="text-white/80">Familles servies</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 text-center">
              <p className="text-4xl font-bold mb-2">850kg</p>
              <p className="text-white/80">Nourriture sauvée</p>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 text-center">
              <p className="text-4xl font-bold mb-2">15T</p>
              <p className="text-white/80">CO2 évité</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-2xl p-6 max-w-2xl mx-auto text-center">
            <p className="text-lg">
              💚 Cette semaine: 245 familles ont reçu leur box, représentant 890 TND versés directement aux fermes
            </p>
          </div>
        </div>
      </section>

      {/* Farmer CTA */}
      <section className="py-16 bg-brand-cream">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 flex items-center gap-6">
              <span className="text-5xl">🌾</span>
              <div>
                <h3 className="font-display text-2xl text-brand-green mb-2">
                  Vous êtes producteur?
                </h3>
                <p className="text-brand-brown">
                  Rejoignez notre réseau de fermes partenaires et vendez directement aux familles
                </p>
              </div>
            </div>
            <Link
              href="/register?role=farmer"
              className="whitespace-nowrap px-6 py-3 bg-brand-green text-white font-semibold rounded-lg hover:bg-brand-green-dark transition"
            >
              Devenir partenaire →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl lg:text-4xl text-brand-green mb-4">
            Prêt à manger local?
          </h2>
          <p className="text-brand-brown text-lg mb-8 max-w-2xl mx-auto">
            Commencez votre aventure avec Borgdanet et découvrez le goût des produits
            cultivés avec soin par nos fermiers tunisiens.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center px-8 py-4 bg-brand-green text-white font-semibold rounded-lg hover:bg-brand-green-dark transition text-lg"
            >
              Commencer maintenant
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center px-8 py-4 bg-brand-cream text-brand-green font-semibold rounded-lg border-2 border-brand-green hover:bg-brand-green hover:text-white transition text-lg"
            >
              Explorer les produits
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

// Product Card Component
function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product;
  onAddToCart: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden group hover:shadow-lg transition">
      <Link href={`/products/${product.id}`} className="block relative aspect-square">
        {product.images[0] && !imageError ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-brand-cream flex items-center justify-center">
            <span className="text-5xl">{CATEGORY_ICONS[product.category] || '📦'}</span>
          </div>
        )}
      </Link>
      <div className="p-4">
        <Link
          href={`/farms/${product.farm.slug}`}
          className="text-xs text-brand-green hover:text-brand-green-dark font-medium"
        >
          {product.farm.name}
        </Link>
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-brand-brown text-sm line-clamp-2 mt-1 hover:text-brand-green transition">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-brand-green">
            {Number(product.price).toFixed(2)} TND
          </span>
          <button
            onClick={(e) => {
              e.preventDefault();
              onAddToCart();
            }}
            className="p-2 bg-brand-green text-white rounded-full hover:bg-brand-green-dark transition"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
