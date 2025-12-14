'use client';

import Link from 'next/link';

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-brand-cream flex items-center justify-center py-12 relative overflow-hidden">

      <div className="container mx-auto px-4 max-w-lg text-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="font-display text-3xl text-brand-green mb-4">
            Bienvenue dans la famille Borgdanet!
          </h1>

          <p className="text-brand-brown mb-6">
            Votre abonnement est confirmé. Nos fermiers préparent déjà votre première box avec soin.
          </p>

          {/* What happens next */}
          <div className="bg-brand-cream rounded-xl p-6 mb-6 text-left">
            <h3 className="font-semibold text-brand-green mb-3">Et maintenant?</h3>
            <ul className="space-y-3 text-sm text-brand-brown">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-brand-green text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                <span>Un email de confirmation a été envoyé à votre adresse</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-brand-green text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                <span>Vous recevrez un SMS la veille de votre livraison</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-brand-green text-white rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                <span>Notre livreur vous contactera le jour J pour confirmer</span>
              </li>
            </ul>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-brand-cream rounded-lg p-3">
              <div className="text-2xl">🌱</div>
              <div className="text-xs text-brand-brown">100% Bio</div>
            </div>
            <div className="bg-brand-cream rounded-lg p-3">
              <div className="text-2xl">🚚</div>
              <div className="text-xs text-brand-brown">Livraison fraîche</div>
            </div>
            <div className="bg-brand-cream rounded-lg p-3">
              <div className="text-2xl">💚</div>
              <div className="text-xs text-brand-brown">Impact positif</div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/dashboard/subscriptions"
              className="block w-full py-3 bg-brand-green text-white rounded-lg font-semibold hover:bg-brand-green-dark transition-colors"
            >
              Voir mon abonnement
            </Link>
            <Link
              href="/farms"
              className="block w-full py-3 bg-brand-cream text-brand-green rounded-lg font-semibold hover:bg-brand-cream-dark transition-colors"
            >
              Découvrir nos fermes
            </Link>
            <Link
              href="/"
              className="block w-full py-3 text-brand-brown hover:text-brand-green transition-colors"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>

        {/* Social sharing */}
        <div className="mt-8 text-center">
          <p className="text-brand-brown text-sm mb-3">
            Partagez votre engagement!
          </p>
          <div className="flex justify-center gap-3">
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-brown hover:bg-brand-cream transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </button>
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-brown hover:bg-brand-cream transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </button>
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-brand-brown hover:bg-brand-cream transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
