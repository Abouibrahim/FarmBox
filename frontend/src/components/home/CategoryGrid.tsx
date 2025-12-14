'use client';

import Link from 'next/link';

const categories = [
  { slug: 'vegetables', name: 'Légumes', icon: '🥬', color: 'bg-green-100' },
  { slug: 'fruits', name: 'Fruits', icon: '🍊', color: 'bg-orange-100' },
  { slug: 'dairy', name: 'Produits Laitiers', icon: '🧀', color: 'bg-yellow-100' },
  { slug: 'olive-oil', name: 'Huile d\'Olive', icon: '🫒', color: 'bg-lime-100' },
  { slug: 'eggs', name: 'Oeufs', icon: '🥚', color: 'bg-amber-100' },
  { slug: 'honey', name: 'Miel', icon: '🍯', color: 'bg-yellow-100' },
  { slug: 'herbs', name: 'Herbes & Aromates', icon: '🌿', color: 'bg-emerald-100' },
  { slug: 'mixed', name: 'Paniers Mixtes', icon: '🧺', color: 'bg-brand-cream-dark' },
];

export function CategoryGrid() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl text-brand-green mb-4">
            Explorez nos produits
          </h2>
          <p className="text-lg text-brand-brown max-w-2xl mx-auto">
            Des produits frais et bio, cultivés avec soin par nos fermes partenaires
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/categories/${category.slug}`}
              className="group relative overflow-hidden rounded-2xl aspect-square flex flex-col items-center justify-center p-6 transition-all hover:scale-105 hover:shadow-lg"
              style={{ backgroundColor: category.color.includes('brand') ? '#F5EDE0' : undefined }}
            >
              <div className={`absolute inset-0 ${category.color} transition-colors group-hover:bg-opacity-80`} />

              <div className="relative z-10 text-center">
                <span className="text-5xl lg:text-6xl mb-4 block transition-transform group-hover:scale-110">
                  {category.icon}
                </span>
                <h3 className="font-semibold text-brand-green text-lg">
                  {category.name}
                </h3>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-brand-green/0 group-hover:bg-brand-green/10 transition-colors" />
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link
            href="/products"
            className="inline-flex items-center text-brand-green font-semibold hover:text-brand-green-dark transition-colors"
          >
            Voir tous les produits
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CategoryGrid;
