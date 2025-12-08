import Link from 'next/link';
import { Leaf, Truck, Heart, MapPin, ShoppingBag, Users, Calendar } from 'lucide-react';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-100 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block bg-primary-100 text-primary-700 text-sm font-medium px-4 py-1 rounded-full mb-6">
              Produits bio de Tunisie
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Du champ a votre table,{' '}
              <span className="text-primary-600">en toute fraicheur</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Decouvrez les produits frais et bio de nos fermes tunisiennes.
              Commandez en ligne et recevez votre panier chaque semaine.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/farms"
                className="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-700 transition inline-flex items-center justify-center"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Decouvrir nos fermes
              </Link>
              <Link
                href="#how-it-works"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition"
              >
                Comment ca marche
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Pourquoi choisir FarmBox?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nous connectons directement les agriculteurs locaux aux consommateurs pour des produits plus frais et un commerce plus equitable.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Leaf className="h-8 w-8" />}
              title="100% Bio"
              description="Produits cultives sans pesticides ni engrais chimiques"
            />
            <FeatureCard
              icon={<MapPin className="h-8 w-8" />}
              title="Local"
              description="Fermes a moins de 50km de Tunis"
            />
            <FeatureCard
              icon={<Truck className="h-8 w-8" />}
              title="Livraison fraiche"
              description="Recolte et livre en moins de 48h"
            />
            <FeatureCard
              icon={<Heart className="h-8 w-8" />}
              title="Soutien local"
              description="Soutenez directement nos agriculteurs"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comment ca marche?
            </h2>
            <p className="text-gray-600">
              Commander vos produits frais en 3 etapes simples
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              icon={<Users className="h-6 w-6" />}
              title="Choisissez une ferme"
              description="Parcourez nos fermes partenaires et decouvrez leurs produits de saison"
            />
            <StepCard
              number="2"
              icon={<ShoppingBag className="h-6 w-6" />}
              title="Composez votre panier"
              description="Selectionnez vos produits preferes ou optez pour un abonnement hebdomadaire"
            />
            <StepCard
              number="3"
              icon={<Calendar className="h-6 w-6" />}
              title="Recevez votre commande"
              description="Livraison a domicile ou retrait a la ferme selon votre preference"
            />
          </div>
        </div>
      </section>

      {/* Zones Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Zones de livraison
            </h2>
            <p className="text-gray-600">
              Nous livrons dans toute la region du Grand Tunis
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <ZoneCard
              zone="Zone A"
              cities={['Tunis', 'La Marsa', 'Carthage', 'Sidi Bou Said']}
              fee="5 TND"
              freeFrom="80 TND"
              color="primary"
            />
            <ZoneCard
              zone="Zone B"
              cities={['Ariana', 'Ben Arous', 'Manouba']}
              fee="8 TND"
              freeFrom="120 TND"
              color="secondary"
            />
            <ZoneCard
              zone="Zone C"
              cities={['Banlieue exterieure']}
              fee="12 TND"
              freeFrom="150 TND"
              color="gray"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pret a commander?
          </h2>
          <p className="text-primary-100 mb-8 text-lg max-w-2xl mx-auto">
            Inscrivez-vous gratuitement et recevez 10% de reduction sur votre premiere commande
          </p>
          <Link
            href="/register"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-primary-50 transition inline-block"
          >
            Creer un compte gratuit
          </Link>
        </div>
      </section>

      {/* Farmer CTA */}
      <section className="py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Vous etes producteur?
              </h3>
              <p className="text-gray-600">
                Rejoignez notre plateforme et vendez directement aux consommateurs de Tunis
              </p>
            </div>
            <Link
              href="/register?role=farmer"
              className="bg-secondary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-secondary-600 transition whitespace-nowrap"
            >
              Devenir partenaire
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center p-6 rounded-xl hover:bg-gray-50 transition">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center relative">
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-50 text-primary-600 mb-4 mt-2">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function ZoneCard({
  zone,
  cities,
  fee,
  freeFrom,
  color,
}: {
  zone: string;
  cities: string[];
  fee: string;
  freeFrom: string;
  color: 'primary' | 'secondary' | 'gray';
}) {
  const colorClasses = {
    primary: 'bg-primary-50 border-primary-200',
    secondary: 'bg-secondary-50 border-secondary-200',
    gray: 'bg-gray-50 border-gray-200',
  };

  return (
    <div className={`p-6 rounded-xl border-2 ${colorClasses[color]}`}>
      <h3 className="text-xl font-bold mb-3">{zone}</h3>
      <p className="text-gray-600 mb-4">{cities.join(', ')}</p>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">Frais de livraison:</span>
        <span className="font-semibold">{fee}</span>
      </div>
      <div className="flex justify-between items-center text-sm mt-1">
        <span className="text-gray-500">Gratuit a partir de:</span>
        <span className="font-semibold text-primary-600">{freeFrom}</span>
      </div>
    </div>
  );
}
