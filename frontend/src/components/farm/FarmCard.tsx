'use client';

import Image from 'next/image';
import Link from 'next/link';

interface FarmCardProps {
  farm: {
    id: string;
    name: string;
    slug: string;
    region: string;
    description: string;
    image: string | null;
    rating: number;
    reviewCount: number;
    isVerified: boolean;
    categories?: string[];
    hasExperiences?: boolean;
  };
}

export function FarmCard({ farm }: FarmCardProps) {
  const regionLabels: Record<string, string> = {
    CAP_BON: 'Cap Bon',
    SAHEL: 'Sahel',
    TUNIS_SUBURBS: 'Grand Tunis',
    NORTH: 'Nord',
    CENTRAL: 'Centre',
    SOUTH: 'Sud',
  };

  return (
    <Link
      href={`/farms/${farm.slug}`}
      className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
    >
      {/* Farm Image */}
      <div className="relative h-48 overflow-hidden">
        {farm.image ? (
          <Image
            src={farm.image}
            alt={farm.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-brand-cream-dark flex items-center justify-center">
            <span className="text-5xl">🌾</span>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {farm.isVerified && (
            <span className="bg-brand-green text-white text-xs px-2 py-1 rounded-full">
              ✓ Vérifié
            </span>
          )}
          {farm.hasExperiences && (
            <span className="bg-brand-gold text-white text-xs px-2 py-1 rounded-full">
              🌻 Visites
            </span>
          )}
        </div>
      </div>

      {/* Farm Info */}
      <div className="p-4">
        <h3 className="font-display text-lg text-brand-green mb-1 group-hover:text-brand-green-dark transition-colors">
          {farm.name}
        </h3>
        <p className="text-sm text-brand-brown mb-2 flex items-center">
          <span className="mr-1">📍</span>
          {regionLabels[farm.region] || farm.region.replace('_', ' ')}
        </p>
        <p className="text-sm text-brand-brown line-clamp-2 mb-3">
          {farm.description}
        </p>

        {/* Categories */}
        {farm.categories && farm.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {farm.categories.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="text-xs bg-brand-cream px-2 py-1 rounded text-brand-brown"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center text-sm">
          <span className="text-brand-gold">⭐ {farm.rating.toFixed(1)}</span>
          <span className="text-gray-400 ml-1">({farm.reviewCount} avis)</span>
        </div>
      </div>
    </Link>
  );
}
