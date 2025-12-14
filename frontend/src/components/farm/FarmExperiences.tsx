'use client';

import Image from 'next/image';
import Link from 'next/link';

interface Experience {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: string;
  maxParticipants: number;
  image: string | null;
  available: boolean;
}

interface FarmExperiencesProps {
  experiences: Experience[];
}

export function FarmExperiences({ experiences }: FarmExperiencesProps) {
  if (experiences.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🌻</div>
        <p className="text-brand-brown">
          Aucune expérience disponible pour le moment.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-2xl text-brand-green mb-6">
        Visites et expériences
      </h2>

      <p className="text-brand-brown mb-6">
        Venez découvrir notre ferme et vivre une expérience authentique en famille ou entre amis.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {experiences.map((experience) => (
          <div
            key={experience.id}
            className="bg-brand-cream rounded-lg overflow-hidden"
          >
            {/* Experience Image */}
            <div className="relative h-48">
              {experience.image ? (
                <Image
                  src={experience.image}
                  alt={experience.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-brand-cream-dark flex items-center justify-center">
                  <span className="text-5xl">🌻</span>
                </div>
              )}
            </div>

            {/* Experience Info */}
            <div className="p-4">
              <h3 className="font-display text-lg text-brand-green mb-2">
                {experience.title}
              </h3>
              <p className="text-sm text-brand-brown mb-4 line-clamp-2">
                {experience.description}
              </p>

              {/* Details */}
              <div className="flex flex-wrap gap-3 text-sm text-brand-brown mb-4">
                <span className="flex items-center gap-1">
                  <span>⏱️</span>
                  {experience.duration}
                </span>
                <span className="flex items-center gap-1">
                  <span>👥</span>
                  Max {experience.maxParticipants} pers.
                </span>
              </div>

              {/* Price and CTA */}
              <div className="flex items-center justify-between">
                <div className="font-semibold text-brand-green">
                  {experience.price} TND
                  <span className="text-sm font-normal text-brand-brown">/pers.</span>
                </div>
                <Link
                  href={`/experiences/${experience.id}`}
                  className="px-4 py-2 bg-brand-green text-white text-sm rounded-lg hover:bg-brand-green-dark transition-colors"
                >
                  Réserver
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-brand-gold/10 rounded-lg border border-brand-gold/30">
        <div className="flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <h4 className="font-medium text-brand-green mb-1">Bon à savoir</h4>
            <p className="text-sm text-brand-brown">
              Les visites sont disponibles sur réservation uniquement. Veuillez réserver au moins 48h à l&apos;avance.
              En cas d&apos;annulation, prévenez-nous au moins 24h avant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
