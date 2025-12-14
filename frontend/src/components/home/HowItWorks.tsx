'use client';

import Link from 'next/link';

const steps = [
  {
    number: 1,
    icon: '📦',
    title: 'Choisissez votre formule',
    description: 'Box CSA hebdomadaire, box d\'essai à -25%, ou achat à la carte selon vos besoins.',
  },
  {
    number: 2,
    icon: '✨',
    title: 'Personnalisez vos produits',
    description: 'Sélectionnez selon vos goûts, allergies et la saison. Échangez jusqu\'à 3 produits.',
  },
  {
    number: 3,
    icon: '🚚',
    title: 'Recevez chez vous',
    description: 'Livraison gratuite dès 80 TND. Fraîcheur garantie, directement de la ferme.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 lg:py-24 bg-brand-cream">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl text-brand-green mb-4">
            Comment ça marche
          </h2>
          <p className="text-lg text-brand-brown max-w-2xl mx-auto">
            En 3 étapes simples, recevez des produits frais de nos fermes partenaires
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-12">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Step Number */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-brand-green text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                {step.number}
              </div>

              {/* Icon */}
              <div className="text-5xl mb-6 text-center">{step.icon}</div>

              {/* Content */}
              <h3 className="font-display text-xl text-brand-green mb-3 text-center">
                {step.title}
              </h3>
              <p className="text-brand-brown text-center">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Connector lines (desktop only) */}
        <div className="hidden md:flex justify-center items-center gap-4 -mt-40 mb-28 px-12">
          <div className="flex-1 h-0.5 bg-brand-green/20" />
          <div className="flex-1 h-0.5 bg-brand-green/20" />
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/get-started"
            className="inline-flex items-center justify-center px-8 py-4 bg-brand-green text-white font-semibold rounded-lg hover:bg-brand-green-dark transition-colors text-lg"
          >
            Commencer maintenant
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
