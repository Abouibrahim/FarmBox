'use client';

import Link from 'next/link';

const subscriptionPlans = [
  {
    name: 'Essentiel',
    price: 45,
    period: 'sem',
    products: '6-8 produits',
    serves: '2-3 personnes',
    includes: ['Légumes', 'Fruits'],
    delivery: '5 TND',
    popular: false,
  },
  {
    name: 'Famille',
    price: 75,
    period: 'sem',
    products: '12-15 produits',
    serves: '4-5 personnes',
    includes: ['Légumes', 'Fruits', 'Oeufs', 'Herbes'],
    delivery: 'Gratuite',
    popular: true,
  },
  {
    name: 'Gourmet',
    price: 120,
    period: 'sem',
    products: '18-20 produits',
    serves: '5-6 personnes',
    includes: ['Légumes', 'Fruits', 'Oeufs', 'Herbes', 'Fromage', 'Huile'],
    delivery: 'Gratuite',
    popular: false,
  },
];

export function SubscriptionOptions() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl lg:text-4xl text-brand-green mb-4">
            Nos formules d&apos;abonnement
          </h2>
          <p className="text-lg text-brand-brown max-w-2xl mx-auto">
            Recevez le meilleur de nos fermes chaque semaine
          </p>
        </div>

        {/* Subscription Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto mb-12">
          {subscriptionPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl p-6 lg:p-8 border-2 transition-all hover:shadow-lg ${
                plan.popular
                  ? 'border-brand-green shadow-md'
                  : 'border-brand-cream hover:border-brand-green/50'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-brand-gold text-brand-brown text-sm font-semibold px-4 py-1 rounded-full">
                    ⭐ Populaire
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3 className="font-display text-2xl text-brand-green text-center mb-4">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-brand-green">{plan.price}</span>
                <span className="text-brand-brown ml-1">TND/{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-brand-brown">
                  <span className="text-brand-green mr-2">•</span>
                  {plan.products}
                </li>
                <li className="flex items-center text-brand-brown">
                  <span className="text-brand-green mr-2">•</span>
                  {plan.serves}
                </li>
                <li className="flex items-center text-brand-brown">
                  <span className="text-brand-green mr-2">•</span>
                  {plan.includes.join(' + ')}
                </li>
              </ul>

              {/* Delivery */}
              <div className="text-center mb-6 py-2 bg-brand-cream rounded-lg">
                <span className="text-sm text-brand-brown">
                  Livraison: <strong className="text-brand-green">{plan.delivery}</strong>
                </span>
              </div>

              {/* CTA */}
              <Link
                href={`/get-started?plan=${plan.name.toLowerCase()}`}
                className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-brand-green text-white hover:bg-brand-green-dark'
                    : 'bg-brand-cream text-brand-green hover:bg-brand-green hover:text-white'
                }`}
              >
                Choisir
              </Link>
            </div>
          ))}
        </div>

        {/* Trial Box Banner */}
        <div className="bg-gradient-to-r from-brand-gold/20 to-brand-gold/10 rounded-2xl p-6 lg:p-8 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🎁</span>
              <div>
                <h4 className="font-semibold text-brand-green text-lg">
                  Box d&apos;Essai - Première livraison à -25%
                </h4>
                <p className="text-brand-brown">
                  Découvrez Borgdanet sans engagement
                </p>
              </div>
            </div>
            <Link
              href="/trial"
              className="whitespace-nowrap px-6 py-3 bg-brand-gold text-brand-brown font-semibold rounded-lg hover:bg-brand-gold-light transition-colors"
            >
              Essayer maintenant →
            </Link>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-brand-brown">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-green" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Modifiez ou pausez à tout moment
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-green" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Sans engagement
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-green" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Satisfaction garantie 100%
          </span>
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-green" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Livraison flexible
          </span>
        </div>
      </div>
    </section>
  );
}

export default SubscriptionOptions;
