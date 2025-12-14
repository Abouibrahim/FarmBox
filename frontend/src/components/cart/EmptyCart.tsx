import Link from 'next/link';

export function EmptyCart() {
  return (
    <main className="min-h-screen bg-brand-cream flex items-center justify-center py-12">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="font-display text-2xl text-brand-green mb-4">
          Votre panier est vide
        </h1>
        <p className="text-brand-brown mb-8">
          Votre panier attend les trésors de nos fermes.
          Commençons par découvrir nos produits de saison!
        </p>
        <div className="space-y-3">
          <Link
            href="/products"
            className="block w-full py-3 bg-brand-green text-white rounded-lg font-semibold hover:bg-brand-green-dark transition-colors"
          >
            Découvrir les produits
          </Link>
          <Link
            href="/farms"
            className="block w-full py-3 bg-brand-cream text-brand-green rounded-lg font-semibold border-2 border-brand-green hover:bg-brand-cream-dark transition-colors"
          >
            Explorer les fermes
          </Link>
        </div>
      </div>
    </main>
  );
}
