'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Farm {
  id: string;
  name: string;
  slug: string;
  region: string;
  description: string;
  logo?: string;
  specialties: string[];
}

// Placeholder farms for initial render
const placeholderFarms: Farm[] = [
  {
    id: '1',
    name: 'Ferme Ben Salah',
    slug: 'ferme-ben-salah',
    region: 'Cap Bon',
    description: 'Légumes bio cultivés avec passion depuis 3 générations',
    specialties: ['Légumes', 'Tomates'],
  },
  {
    id: '2',
    name: 'Domaine Zaghouan',
    slug: 'domaine-zaghouan',
    region: 'Zaghouan',
    description: 'Huile d\'olive extra vierge de première qualité',
    specialties: ['Huile d\'olive'],
  },
  {
    id: '3',
    name: 'Les Jardins de Sonia',
    slug: 'jardins-sonia',
    region: 'Tunis',
    description: 'Herbes aromatiques fraîches et plants bio',
    specialties: ['Herbes', 'Aromates'],
  },
  {
    id: '4',
    name: 'Oliveraie Sfax',
    slug: 'oliveraie-sfax',
    region: 'Sfax',
    description: 'Olives et huile traditionnelle du sud tunisien',
    specialties: ['Olives', 'Huile'],
  },
];

export function FarmCarousel() {
  const [farms, setFarms] = useState<Farm[]>(placeholderFarms);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const response = await api.get('/farms?limit=8');
        if (response.data.data && response.data.data.length > 0) {
          setFarms(response.data.data);
        }
      } catch (error) {
        console.log('Using placeholder farms');
      }
    };
    fetchFarms();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % farms.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + farms.length) % farms.length);
  };

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [farms.length]);

  const visibleFarms = () => {
    const result = [];
    for (let i = 0; i < 4; i++) {
      const index = (currentIndex + i) % farms.length;
      result.push(farms[index]);
    }
    return result;
  };

  return (
    <section className="py-16 lg:py-24 bg-brand-cream">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl text-brand-green mb-4">
            Rencontrez nos fermiers
          </h2>
          <p className="text-lg text-brand-brown max-w-2xl mx-auto">
            Derrière chaque produit, une famille
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-brand-green hover:bg-brand-cream transition-colors"
            aria-label="Previous"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-brand-green hover:bg-brand-cream transition-colors"
            aria-label="Next"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Farm Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-8">
            {visibleFarms().map((farm, index) => (
              <Link
                key={`${farm.id}-${index}`}
                href={`/farms/${farm.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
              >
                {/* Farm Image/Logo */}
                <div className="aspect-[4/3] bg-brand-cream-dark relative overflow-hidden">
                  {farm.logo ? (
                    <img
                      src={farm.logo}
                      alt={farm.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl">🌱</span>
                    </div>
                  )}
                </div>

                {/* Farm Info */}
                <div className="p-5">
                  <h3 className="font-semibold text-brand-green text-lg mb-1 group-hover:text-brand-green-dark transition-colors">
                    {farm.name}
                  </h3>
                  <p className="text-sm text-brand-brown mb-2 flex items-center gap-1">
                    <span>📍</span> {farm.region}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {farm.specialties?.slice(0, 2).map((specialty, i) => (
                      <span
                        key={i}
                        className="text-xs bg-brand-cream px-2 py-1 rounded-full text-brand-brown"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {farms.slice(0, Math.min(8, farms.length)).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-brand-green' : 'bg-brand-brown/30'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <Link
            href="/farms"
            className="inline-flex items-center px-6 py-3 bg-white text-brand-green font-semibold rounded-lg border-2 border-brand-green hover:bg-brand-green hover:text-white transition-colors"
          >
            Voir toutes les fermes
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FarmCarousel;
