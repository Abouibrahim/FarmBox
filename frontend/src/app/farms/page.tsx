'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { FarmCard } from '@/components/farm/FarmCard';
import { FarmFilters } from '@/components/farm/FarmFilters';

interface Farm {
  id: string;
  name: string;
  slug: string;
  region: string;
  description: string;
  image: string | null;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  categories: string[];
  hasExperiences: boolean;
}

const regions = [
  { id: 'all', label: 'Toutes les régions' },
  { id: 'CAP_BON', label: 'Cap Bon' },
  { id: 'SAHEL', label: 'Sahel' },
  { id: 'TUNIS_SUBURBS', label: 'Grand Tunis' },
  { id: 'NORTH', label: 'Nord' },
  { id: 'CENTRAL', label: 'Centre' },
  { id: 'SOUTH', label: 'Sud' },
];

const categories = [
  { id: 'all', label: 'Toutes catégories' },
  { id: 'vegetables', label: 'Légumes' },
  { id: 'fruits', label: 'Fruits' },
  { id: 'dairy', label: 'Produits laitiers' },
  { id: 'olive-oil', label: 'Huile d\'olive' },
  { id: 'honey', label: 'Miel' },
  { id: 'eggs', label: 'Oeufs' },
  { id: 'herbs', label: 'Herbes' },
];

// Mock data for development
const mockFarms: Farm[] = [
  {
    id: '1',
    name: 'Ferme Ben Salah',
    slug: 'ferme-ben-salah',
    region: 'CAP_BON',
    description: 'Agriculture biologique depuis 3 générations. Nous cultivons des légumes de saison avec passion et respect de la terre.',
    image: null,
    rating: 4.8,
    reviewCount: 127,
    isVerified: true,
    categories: ['Légumes', 'Herbes'],
    hasExperiences: true,
  },
  {
    id: '2',
    name: 'Domaine Zaghouan',
    slug: 'domaine-zaghouan',
    region: 'TUNIS_SUBURBS',
    description: 'Producteur d\'agrumes et d\'huile d\'olive premium depuis 1985. Nos vergers sont cultivés selon les méthodes traditionnelles.',
    image: null,
    rating: 4.6,
    reviewCount: 89,
    isVerified: true,
    categories: ['Fruits', 'Huile d\'olive'],
    hasExperiences: false,
  },
  {
    id: '3',
    name: 'Les Jardins de Sonia',
    slug: 'jardins-de-sonia',
    region: 'SAHEL',
    description: 'Maraîchage bio et permaculture. Des légumes frais livrés le jour même de la récolte.',
    image: null,
    rating: 4.9,
    reviewCount: 203,
    isVerified: true,
    categories: ['Légumes', 'Herbes', 'Fruits'],
    hasExperiences: true,
  },
  {
    id: '4',
    name: 'Ferme Testour',
    slug: 'ferme-testour',
    region: 'NORTH',
    description: 'Élevage en plein air et apiculture. Nos poules et nos abeilles vivent en harmonie avec la nature.',
    image: null,
    rating: 4.7,
    reviewCount: 156,
    isVerified: true,
    categories: ['Oeufs', 'Miel'],
    hasExperiences: true,
  },
  {
    id: '5',
    name: 'Fromagerie Artisanale Bizerte',
    slug: 'fromagerie-bizerte',
    region: 'NORTH',
    description: 'Fromages artisanaux au lait cru de chèvre et de brebis. Saveurs authentiques du terroir tunisien.',
    image: null,
    rating: 4.5,
    reviewCount: 67,
    isVerified: false,
    categories: ['Produits laitiers'],
    hasExperiences: false,
  },
  {
    id: '6',
    name: 'Oliveraie de Sfax',
    slug: 'oliveraie-sfax',
    region: 'SAHEL',
    description: 'Huile d\'olive extra vierge première pression à froid. Oliviers centenaires et savoir-faire familial.',
    image: null,
    rating: 4.8,
    reviewCount: 178,
    isVerified: true,
    categories: ['Huile d\'olive'],
    hasExperiences: true,
  },
];

function FarmsPageContent() {
  const searchParams = useSearchParams();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    region: searchParams.get('region') || 'all',
    category: searchParams.get('category') || 'all',
    search: searchParams.get('q') || '',
  });

  useEffect(() => {
    const fetchFarms = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.region !== 'all') params.set('region', filters.region);
        if (filters.category !== 'all') params.set('category', filters.category);
        if (filters.search) params.set('search', filters.search);

        const response = await api.get(`/farms?${params.toString()}`);
        const farmsData = response.data.farms || response.data;

        // Transform API data to match our interface
        const formattedFarms = farmsData.map((farm: any) => ({
          id: farm.id,
          name: farm.name,
          slug: farm.slug,
          region: farm.region || 'TUNIS_SUBURBS',
          description: farm.description || '',
          image: farm.coverImage || farm.image || null,
          rating: farm.averageRating || farm.rating || 0,
          reviewCount: farm._count?.reviews || farm.reviewCount || 0,
          isVerified: farm.isVerified || false,
          categories: farm.categories || [],
          hasExperiences: farm.hasExperiences || false,
        }));

        setFarms(formattedFarms);
      } catch (error) {
        console.error('Failed to fetch farms:', error);
        // Use mock data as fallback
        let filteredFarms = [...mockFarms];

        if (filters.region !== 'all') {
          filteredFarms = filteredFarms.filter(f => f.region === filters.region);
        }
        if (filters.category !== 'all') {
          const categoryLabel = categories.find(c => c.id === filters.category)?.label;
          if (categoryLabel) {
            filteredFarms = filteredFarms.filter(f =>
              f.categories.some(c => c.toLowerCase().includes(categoryLabel.toLowerCase()))
            );
          }
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredFarms = filteredFarms.filter(f =>
            f.name.toLowerCase().includes(searchLower) ||
            f.description.toLowerCase().includes(searchLower)
          );
        }

        setFarms(filteredFarms);
      } finally {
        setLoading(false);
      }
    };
    fetchFarms();
  }, [filters]);

  return (
    <main className="min-h-screen bg-brand-cream">
      {/* Hero */}
      <section className="bg-brand-green text-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-4xl mb-4">
            Nos fermes partenaires
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            45 familles d&apos;agriculteurs, une même passion pour l&apos;agriculture biologique et régénératrice
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-brand-cream-dark sticky top-16 z-30">
        <div className="container mx-auto px-4 py-4">
          <FarmFilters
            filters={filters}
            onFilterChange={setFilters}
            regions={regions}
            categories={categories}
          />
        </div>
      </section>

      {/* Farm Grid */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg h-80 animate-pulse" />
              ))}
            </div>
          ) : farms.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🌱</div>
              <h2 className="font-display text-xl text-brand-green mb-2">
                Aucune ferme trouvée
              </h2>
              <p className="text-brand-brown mb-4">
                Essayez de modifier vos critères de recherche
              </p>
              <button
                onClick={() => setFilters({ region: 'all', category: 'all', search: '' })}
                className="text-brand-green font-medium hover:underline"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <>
              <p className="text-brand-brown mb-6">
                {farms.length} ferme{farms.length > 1 ? 's' : ''} trouvée{farms.length > 1 ? 's' : ''}
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {farms.map((farm) => (
                  <FarmCard key={farm.id} farm={farm} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Become a Partner CTA */}
      <section className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-brand-cream rounded-lg p-8 text-center">
            <div className="text-4xl mb-4">🌾</div>
            <h2 className="font-display text-2xl text-brand-green mb-2">
              Vous êtes agriculteur?
            </h2>
            <p className="text-brand-brown mb-6">
              Rejoignez notre réseau de fermes partenaires et vendez directement
              aux familles qui apprécient votre travail.
            </p>
            <Link
              href="/farmer/register"
              className="inline-flex px-6 py-3 bg-brand-green text-white rounded-lg font-semibold hover:bg-brand-green-dark transition-colors"
            >
              Devenir partenaire
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function FarmsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-brand-cream">
        <section className="bg-brand-green text-white py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-3xl md:text-4xl mb-4">
              Nos fermes partenaires
            </h1>
          </div>
        </section>
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg h-80 animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    }>
      <FarmsPageContent />
    </Suspense>
  );
}
