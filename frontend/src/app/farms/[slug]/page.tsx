'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/lib/api';
import { FarmStory } from '@/components/farm/FarmStory';
import { FarmProducts } from '@/components/farm/FarmProducts';
import { FarmPractices } from '@/components/farm/FarmPractices';
import { FarmExperiences } from '@/components/farm/FarmExperiences';
import { FarmReviews } from '@/components/farm/FarmReviews';

interface Farm {
  id: string;
  name: string;
  slug: string;
  description: string;
  region: string;
  image: string | null;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  phone?: string;
  email?: string;
  profile: {
    story: string;
    storyAr?: string;
    foundedYear: number;
    farmerName: string;
    farmerPhoto?: string;
    farmSize: string;
    certifications: string[];
    practices: string[];
    gallery: string[];
    quote?: string;
  } | null;
  products: any[];
  experiences: any[];
  reviews: any[];
}

type TabId = 'story' | 'products' | 'practices' | 'visits' | 'reviews';

// Mock farm data for development
const mockFarm: Farm = {
  id: '1',
  name: 'Ferme Ben Salah',
  slug: 'ferme-ben-salah',
  description: 'Agriculture biologique depuis 3 générations. Nous cultivons des légumes de saison avec passion et respect de la terre.',
  region: 'CAP_BON',
  image: null,
  rating: 4.8,
  reviewCount: 127,
  isVerified: true,
  phone: '+216 71 234 567',
  email: 'contact@fermebensalah.tn',
  profile: {
    story: `Notre ferme familiale existe depuis 1952, fondée par mon grand-père Mohamed Ben Salah. Passionné par la terre de notre Cap Bon natal, il a commencé avec quelques hectares de légumes et d'agrumes.

Aujourd'hui, je perpétue cet héritage avec mes deux fils. Nous cultivons plus de 30 variétés de légumes sur 15 hectares, toujours selon les méthodes traditionnelles transmises de génération en génération.

Notre philosophie est simple : des produits sains, cultivés avec amour et respect de la nature. Nous n'utilisons aucun pesticide chimique et privilégions le compostage naturel pour enrichir nos sols.

Chaque semaine, nous récoltons à la main les légumes qui partiront dans vos paniers. De notre terre à votre table, nous mettons tout notre coeur.`,
    foundedYear: 1952,
    farmerName: 'Ahmed Ben Salah',
    farmSize: '15 hectares',
    certifications: ['Bio Tunisie', 'Agriculture Raisonnée'],
    practices: ['Rotation des cultures', 'Compostage', 'Irrigation goutte-à-goutte', 'Zéro pesticides', 'Semences paysannes'],
    gallery: [],
    quote: 'La terre nous donne ce que nous lui donnons en retour.',
  },
  products: [
    { id: '1', name: 'Tomates heirloom', price: 4.5, unit: 'kg', image: null, isInSeason: true },
    { id: '2', name: 'Courgettes bio', price: 3.2, unit: 'kg', image: null, isInSeason: true },
    { id: '3', name: 'Poivrons tricolores', price: 5.0, unit: 'kg', image: null },
    { id: '4', name: 'Épinards frais', price: 2.8, unit: 'botte', image: null, isInSeason: true },
    { id: '5', name: 'Carottes', price: 2.5, unit: 'kg', image: null },
    { id: '6', name: 'Concombres', price: 2.0, unit: 'kg', image: null, isRescue: true },
  ],
  experiences: [
    {
      id: '1',
      title: 'Visite de la ferme',
      description: 'Découvrez notre exploitation et nos méthodes de culture biologique. Dégustation de produits frais incluse.',
      price: 25,
      duration: '2 heures',
      maxParticipants: 10,
      image: null,
      available: true,
    },
    {
      id: '2',
      title: 'Atelier récolte en famille',
      description: 'Participez à la récolte avec vos enfants et repartez avec votre panier de légumes fraîchement cueillis.',
      price: 35,
      duration: '3 heures',
      maxParticipants: 6,
      image: null,
      available: true,
    },
  ],
  reviews: [
    {
      id: '1',
      rating: 5,
      comment: 'Des légumes exceptionnels! On sent vraiment la différence avec les produits du supermarché. Merci pour votre travail.',
      createdAt: '2024-12-01T10:00:00Z',
      user: { firstName: 'Sonia', lastName: 'M' },
    },
    {
      id: '2',
      rating: 5,
      comment: 'Livraison toujours ponctuelle et produits d\'une fraîcheur incroyable. Je recommande vivement!',
      createdAt: '2024-11-28T14:30:00Z',
      user: { firstName: 'Karim', lastName: 'B' },
    },
    {
      id: '3',
      rating: 4,
      comment: 'Très bons produits, la visite de la ferme était aussi très intéressante.',
      createdAt: '2024-11-20T09:15:00Z',
      user: { firstName: 'Amira', lastName: 'T' },
    },
  ],
};

const regionLabels: Record<string, string> = {
  CAP_BON: 'Cap Bon',
  SAHEL: 'Sahel',
  TUNIS_SUBURBS: 'Grand Tunis',
  NORTH: 'Nord',
  CENTRAL: 'Centre',
  SOUTH: 'Sud',
};

export default function FarmProfilePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [farm, setFarm] = useState<Farm | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('story');

  useEffect(() => {
    const fetchFarm = async () => {
      try {
        const response = await api.get(`/farms/${slug}`);
        const farmData = response.data;

        // Transform API response to match our interface
        const transformedFarm: Farm = {
          id: farmData.id,
          name: farmData.name,
          slug: farmData.slug,
          description: farmData.description || '',
          region: farmData.region || 'TUNIS_SUBURBS',
          image: farmData.coverImage || farmData.image || null,
          rating: farmData.averageRating || 0,
          reviewCount: farmData._count?.reviews || 0,
          isVerified: farmData.isVerified || false,
          phone: farmData.phone,
          email: farmData.email,
          profile: farmData.profile || {
            story: farmData.story || farmData.description || '',
            foundedYear: 2000,
            farmerName: '',
            farmSize: '',
            certifications: [],
            practices: [],
            gallery: [],
          },
          products: farmData.products || [],
          experiences: farmData.experiences || [],
          reviews: farmData.reviews?.map((r: any) => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            user: {
              firstName: r.user?.firstName || r.customer?.name?.split(' ')[0] || 'Client',
              lastName: r.user?.lastName || r.customer?.name?.split(' ')[1] || '',
            },
          })) || [],
        };

        setFarm(transformedFarm);
      } catch (error) {
        console.error('Failed to fetch farm:', error);
        // Use mock data as fallback for the requested slug
        if (slug === 'ferme-ben-salah' || slug === mockFarm.slug) {
          setFarm(mockFarm);
        } else {
          // Create a variation of mock data for other slugs
          setFarm({
            ...mockFarm,
            slug: slug,
            name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchFarm();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-brand-cream">
        <div className="h-80 bg-brand-cream-dark animate-pulse" />
        <div className="container mx-auto px-4 -mt-20">
          <div className="bg-white rounded-lg p-8 animate-pulse">
            <div className="h-8 bg-brand-cream-dark rounded w-64 mb-4" />
            <div className="h-4 bg-brand-cream-dark rounded w-32" />
          </div>
        </div>
      </main>
    );
  }

  if (!farm) {
    return (
      <main className="min-h-screen bg-brand-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🌾</div>
          <h1 className="font-display text-2xl text-brand-green mb-2">
            Ferme non trouvée
          </h1>
          <Link href="/farms" className="text-brand-green hover:underline">
            Retour aux fermes
          </Link>
        </div>
      </main>
    );
  }

  const tabs: { id: TabId; label: string; show: boolean }[] = [
    { id: 'story', label: 'Notre histoire', show: true },
    { id: 'products', label: 'Nos produits', show: farm.products.length > 0 },
    { id: 'practices', label: 'Nos pratiques', show: !!farm.profile?.practices?.length },
    { id: 'visits', label: 'Visites', show: farm.experiences.length > 0 },
    { id: 'reviews', label: `Avis (${farm.reviewCount || farm.reviews.length})`, show: true },
  ];

  return (
    <main className="min-h-screen bg-brand-cream pb-20 md:pb-0">
      {/* Hero Image */}
      <div className="relative h-80 md:h-96">
        {farm.image ? (
          <Image
            src={farm.image}
            alt={farm.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-green to-brand-green-dark flex items-center justify-center">
            <span className="text-9xl opacity-30">🌾</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Back button */}
        <Link
          href="/farms"
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg text-brand-green font-medium hover:bg-white transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </Link>
      </div>

      {/* Farm Info Card */}
      <div className="container mx-auto px-4 -mt-24 relative z-10">
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Farmer Photo */}
            {farm.profile?.farmerPhoto && (
              <div className="flex-shrink-0">
                <Image
                  src={farm.profile.farmerPhoto}
                  alt={farm.profile.farmerName}
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-brand-cream"
                />
              </div>
            )}

            {/* Farm Details */}
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <h1 className="font-display text-3xl text-brand-green mb-2">
                    {farm.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-brand-brown mb-3">
                    <span className="flex items-center gap-1">
                      <span>📍</span>
                      {regionLabels[farm.region] || farm.region}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span>⭐</span>
                      {farm.rating.toFixed(1)} ({farm.reviewCount || farm.reviews.length} avis)
                    </span>
                    {farm.profile?.foundedYear && (
                      <>
                        <span>•</span>
                        <span>Depuis {farm.profile.foundedYear}</span>
                      </>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {farm.isVerified && (
                      <span className="bg-brand-green text-white text-sm px-3 py-1 rounded-full">
                        🌱 Bio Certifié
                      </span>
                    )}
                    {farm.profile?.certifications?.map((cert) => (
                      <span
                        key={cert}
                        className="bg-brand-cream text-brand-green text-sm px-3 py-1 rounded-full"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>

                  {/* Contact Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-brand-brown">
                    {farm.phone && (
                      <a
                        href={`tel:${farm.phone}`}
                        className="flex items-center gap-1 hover:text-brand-green transition-colors"
                      >
                        <span>📞</span>
                        {farm.phone}
                      </a>
                    )}
                    {farm.email && (
                      <a
                        href={`mailto:${farm.email}`}
                        className="flex items-center gap-1 hover:text-brand-green transition-colors"
                      >
                        <span>✉️</span>
                        {farm.email}
                      </a>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="hidden md:flex gap-2">
                  <button
                    onClick={() => setActiveTab('products')}
                    className="px-4 py-2 bg-brand-green text-white rounded-lg font-medium hover:bg-brand-green-dark transition-colors"
                  >
                    Voir les produits
                  </button>
                </div>
              </div>

              {/* Quote */}
              {farm.profile?.quote && (
                <blockquote className="mt-4 text-lg text-brand-brown italic border-l-4 border-brand-gold pl-4">
                  &ldquo;{farm.profile.quote}&rdquo;
                  {farm.profile.farmerName && (
                    <footer className="text-sm mt-1 not-italic text-brand-green">
                      — {farm.profile.farmerName}
                    </footer>
                  )}
                </blockquote>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 mt-8">
        <div className="bg-white rounded-lg overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-brand-cream-dark overflow-x-auto">
            {tabs.filter(t => t.show).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'text-brand-green border-b-2 border-brand-green'
                    : 'text-brand-brown hover:text-brand-green'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {activeTab === 'story' && (
              <FarmStory
                story={farm.profile?.story || farm.description}
                farmerName={farm.profile?.farmerName}
                gallery={farm.profile?.gallery || []}
              />
            )}
            {activeTab === 'products' && (
              <FarmProducts
                products={farm.products}
                farmSlug={farm.slug}
                farmName={farm.name}
              />
            )}
            {activeTab === 'practices' && (
              <FarmPractices practices={farm.profile?.practices || []} />
            )}
            {activeTab === 'visits' && (
              <FarmExperiences experiences={farm.experiences} />
            )}
            {activeTab === 'reviews' && (
              <FarmReviews farmId={farm.id} reviews={farm.reviews} />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-brand-cream-dark p-4 md:hidden z-50">
        <button
          onClick={() => setActiveTab('products')}
          className="block w-full py-3 bg-brand-green text-white text-center rounded-lg font-semibold"
        >
          Voir les produits ({farm.products.length})
        </button>
      </div>
    </main>
  );
}
