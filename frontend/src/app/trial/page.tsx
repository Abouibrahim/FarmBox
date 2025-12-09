'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { trialApi } from '@/lib/api';
import { BOX_SIZES, DELIVERY_ZONES, DeliveryZone } from '@/types';
import {
  Gift,
  ArrowLeft,
  Loader2,
  MapPin,
  Star,
  Package,
  Check,
  ArrowRight,
  Percent,
} from 'lucide-react';

interface Farm {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  city: string;
  deliveryZones: DeliveryZone[];
  _count?: {
    products: number;
    reviews: number;
  };
}

export default function TrialPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/trial');
      return;
    }

    // Set default zone from user profile
    if (user?.zone) {
      setSelectedZone(user.zone);
    }

    loadFarms();
  }, [isAuthenticated, router, user]);

  useEffect(() => {
    if (isAuthenticated) {
      loadFarms();
    }
  }, [selectedZone, isAuthenticated]);

  const loadFarms = async () => {
    try {
      setLoading(true);
      const response = await trialApi.getAvailableFarms(selectedZone || undefined);
      setFarms(response.data.data || []);
    } catch (error) {
      console.error('Failed to load farms:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/subscriptions"
          className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux abonnements
        </Link>
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Gift className="h-4 w-4" />
            25% de reduction sur votre premier panier
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Essayez un panier bio sans engagement
          </h1>
          <p className="text-gray-600 text-lg">
            Decouvrez la qualite de nos fermes partenaires avec un panier d&apos;essai a prix reduit.
            Convertissez-le en abonnement apres avoir goute!
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Percent className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">25% de reduction</h3>
            <p className="text-sm text-gray-600">Sur votre premier panier de chaque ferme</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Check className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Sans engagement</h3>
            <p className="text-sm text-gray-600">Aucune obligation de continuer</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Star className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Produits frais</h3>
            <p className="text-sm text-gray-600">Directement de la ferme a votre table</p>
          </div>
        </div>
      </div>

      {/* Zone Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-5 w-5" />
            <span>Filtrer par zone:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedZone('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                selectedZone === ''
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes les zones
            </button>
            {Object.entries(DELIVERY_ZONES).map(([key, zone]) => (
              <button
                key={key}
                onClick={() => setSelectedZone(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedZone === key
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {zone.nameFr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Farms Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : farms.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Gift className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">
            Aucune ferme disponible pour l&apos;essai
          </h3>
          <p className="text-gray-500 mb-4">
            {selectedZone
              ? 'Essayez une autre zone ou vous avez deja teste toutes les fermes de cette zone.'
              : 'Vous avez deja teste toutes nos fermes partenaires!'}
          </p>
          <Link href="/farms" className="text-primary-600 font-medium hover:underline">
            Voir toutes les fermes
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <FarmTrialCard key={farm.id} farm={farm} />
          ))}
        </div>
      )}

      {/* How it works */}
      <div className="mt-12 bg-gradient-to-br from-primary-50 to-green-50 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
          Comment ca marche?
        </h2>
        <div className="grid sm:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-primary-600">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Choisissez</h3>
            <p className="text-sm text-gray-600">Selectionnez une ferme et la taille du panier</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-primary-600">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Commandez</h3>
            <p className="text-sm text-gray-600">Passez commande avec 25% de reduction</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-primary-600">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Goutez</h3>
            <p className="text-sm text-gray-600">Recevez et appreciez vos produits frais</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center mx-auto mb-3">
              <span className="text-xl font-bold text-primary-600">4</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Decidez</h3>
            <p className="text-sm text-gray-600">Convertissez en abonnement ou non</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FarmTrialCard({ farm }: { farm: Farm }) {
  const [creating, setCreating] = useState(false);
  const [showBoxSelect, setShowBoxSelect] = useState(false);
  const [selectedBox, setSelectedBox] = useState<string>('MEDIUM');
  const router = useRouter();

  const handleCreateTrial = async () => {
    setCreating(true);
    try {
      await trialApi.create({ farmId: farm.id, boxSize: selectedBox });
      router.push('/dashboard/subscriptions');
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors de la creation');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition group">
      {/* Farm Image/Logo */}
      <div className="h-32 bg-gradient-to-br from-primary-100 to-green-100 relative">
        {farm.logo ? (
          <img
            src={farm.logo}
            alt={farm.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package className="h-12 w-12 text-primary-300" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-bold">
          -25%
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition">
          {farm.name}
        </h3>
        <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {farm.city}
        </p>
        {farm.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{farm.description}</p>
        )}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span>{farm._count?.products || 0} produits</span>
          <span>{farm._count?.reviews || 0} avis</span>
        </div>

        {!showBoxSelect ? (
          <button
            onClick={() => setShowBoxSelect(true)}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            <Gift className="h-4 w-4" />
            Essayer cette ferme
          </button>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Choisissez la taille:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(BOX_SIZES).map(([key, box]) => (
                <button
                  key={key}
                  onClick={() => setSelectedBox(key)}
                  className={`p-2 rounded-lg border-2 text-left transition ${
                    selectedBox === key
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">{box.name}</p>
                  <p className="text-xs text-gray-500">{box.weight}</p>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateTrial}
                disabled={creating}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Confirmer
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
              <button
                onClick={() => setShowBoxSelect(false)}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
