'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { farmsApi } from '@/lib/api';
import { Farm, DELIVERY_ZONES, DeliveryZone } from '@/types';
import { MapPin, Star, Package, Search, Filter, CheckCircle } from 'lucide-react';

export default function FarmsPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFarms();
  }, [selectedZone]);

  const loadFarms = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = {};
      if (selectedZone) params.zone = selectedZone;
      if (searchQuery) params.search = searchQuery;

      const response = await farmsApi.getAll(params);
      setFarms(response.data);
    } catch (err: any) {
      console.error('Failed to load farms:', err);
      setError('Impossible de charger les fermes. Veuillez reessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadFarms();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nos Fermes Partenaires</h1>
        <p className="text-gray-600">
          Decouvrez les fermes bio de la region de Tunis et commandez directement leurs produits
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une ferme ou un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </form>

          {/* Zone Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="input min-w-[200px]"
            >
              <option value="">Toutes les zones</option>
              {Object.entries(DELIVERY_ZONES).map(([key, zone]) => (
                <option key={key} value={key}>
                  {zone.nameFr}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8">
          {error}
        </div>
      )}

      {/* Farms Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : farms.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune ferme trouvee</h3>
          <p className="text-gray-500 mb-4">
            Essayez de modifier vos criteres de recherche
          </p>
          <button
            onClick={() => {
              setSelectedZone('');
              setSearchQuery('');
              loadFarms();
            }}
            className="text-primary-600 font-medium hover:underline"
          >
            Reinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <FarmCard key={farm.id} farm={farm} />
          ))}
        </div>
      )}
    </div>
  );
}

function FarmCard({ farm }: { farm: Farm }) {
  return (
    <Link
      href={`/farms/${farm.slug}`}
      className="card group hover:shadow-lg transition-shadow"
    >
      {/* Cover Image */}
      <div className="h-48 bg-gradient-to-br from-primary-100 to-primary-200 relative overflow-hidden">
        {farm.coverImage ? (
          <img
            src={farm.coverImage}
            alt={farm.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">🌾</span>
          </div>
        )}
        {farm.isVerified && (
          <span className="absolute top-3 right-3 bg-white text-primary-600 text-xs px-2 py-1 rounded-full flex items-center font-medium shadow-sm">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verifie
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-primary-600 transition-colors">
          {farm.name}
        </h3>

        <div className="flex items-center text-gray-500 text-sm mb-2">
          <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
          <span>{farm.city}</span>
        </div>

        {farm.averageRating && farm.averageRating > 0 ? (
          <div className="flex items-center text-sm mb-3">
            <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
            <span className="font-medium">{farm.averageRating.toFixed(1)}</span>
            <span className="text-gray-400 ml-1">
              ({farm._count?.reviews || 0} avis)
            </span>
          </div>
        ) : (
          <div className="text-sm text-gray-400 mb-3">Pas encore d&apos;avis</div>
        )}

        {farm.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {farm.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="flex items-center text-sm text-gray-500">
            <Package className="h-4 w-4 mr-1" />
            {farm._count?.products || 0} produits
          </span>
          <span className="text-primary-600 font-medium text-sm group-hover:translate-x-1 transition-transform inline-flex items-center">
            Voir la ferme
            <span className="ml-1">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
