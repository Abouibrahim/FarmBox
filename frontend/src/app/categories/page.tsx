'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { productsApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  nameAr: string;
}

const CATEGORY_ICONS: Record<string, { emoji: string; color: string }> = {
  vegetables: { emoji: '🥬', color: 'bg-green-100 text-green-800' },
  fruits: { emoji: '🍎', color: 'bg-red-100 text-red-800' },
  herbs: { emoji: '🌿', color: 'bg-teal-100 text-teal-800' },
  eggs: { emoji: '🥚', color: 'bg-amber-100 text-amber-800' },
  honey: { emoji: '🍯', color: 'bg-yellow-100 text-yellow-800' },
  'olive-oil': { emoji: '🫒', color: 'bg-lime-100 text-lime-800' },
  dairy: { emoji: '🧀', color: 'bg-orange-100 text-orange-800' },
  other: { emoji: '📦', color: 'bg-gray-100 text-gray-800' },
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await productsApi.getCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Categories</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explorez nos differentes categories de produits frais et bio
        </p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => {
          const { emoji, color } = CATEGORY_ICONS[category.id] || CATEGORY_ICONS.other;
          return (
            <Link
              key={category.id}
              href={`/categories/${category.id}`}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-lg transition"
            >
              <div className={`w-20 h-20 rounded-full ${color} flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition`}>
                <span className="text-4xl">{emoji}</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {category.name}
              </h2>
              <p className="text-gray-500 text-sm font-arabic">
                {category.nameAr}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Subscribe CTA */}
      <div className="mt-16 bg-primary-50 rounded-2xl p-8 md:p-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Abonnez-vous a une box par categorie
        </h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Recevez chaque semaine une selection de produits frais de votre categorie preferee,
          provenant de plusieurs fermes partenaires.
        </p>
        <Link
          href="/subscriptions/category"
          className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
        >
          Decouvrir les abonnements
        </Link>
      </div>
    </div>
  );
}
