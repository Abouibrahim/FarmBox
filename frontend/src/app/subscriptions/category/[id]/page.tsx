'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { categorySubscriptionsApi } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import {
  Calendar,
  Package,
  Pause,
  Play,
  Trash2,
  SkipForward,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  MapPin,
  Clock,
  Edit,
  Eye,
} from 'lucide-react';

const CATEGORIES: Record<string, { name: string; emoji: string }> = {
  vegetables: { name: 'Legumes', emoji: '🥬' },
  fruits: { name: 'Fruits', emoji: '🍎' },
  herbs: { name: 'Herbes aromatiques', emoji: '🌿' },
  eggs: { name: 'Oeufs', emoji: '🥚' },
  honey: { name: 'Miel', emoji: '🍯' },
  'olive-oil': { name: "Huile d'olive", emoji: '🫒' },
  dairy: { name: 'Produits laitiers', emoji: '🧀' },
  mixed: { name: 'Box Mixte', emoji: '📦' },
};

const BOX_SIZES: Record<string, { name: string; items: string }> = {
  SMALL: { name: 'Petite Box', items: '4-6 produits' },
  MEDIUM: { name: 'Box Moyenne', items: '8-10 produits' },
  LARGE: { name: 'Grande Box', items: '12-15 produits' },
};

const FREQUENCIES: Record<string, string> = {
  WEEKLY: 'Chaque semaine',
  BIWEEKLY: 'Toutes les 2 semaines',
  MONTHLY: 'Une fois par mois',
};

const DAYS: Record<number, string> = {
  0: 'Dimanche',
  1: 'Lundi',
  2: 'Mardi',
  3: 'Mercredi',
  4: 'Jeudi',
  5: 'Vendredi',
  6: 'Samedi',
};

export default function SubscriptionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [subscription, setSubscription] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pauseWeeks, setPauseWeeks] = useState(2);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/subscriptions/category/' + id);
      return;
    }
    loadSubscription();
  }, [id, isAuthenticated]);

  const loadSubscription = async () => {
    try {
      const response = await categorySubscriptionsApi.getById(id as string);
      setSubscription(response.data);
    } catch (err: any) {
      setError('Impossible de charger l\'abonnement');
    } finally {
      setLoading(false);
    }
  };

  const loadPreview = async () => {
    try {
      const response = await categorySubscriptionsApi.previewNextBox(id as string);
      setPreview(response.data);
      setShowPreview(true);
    } catch (err: any) {
      setError('Impossible de charger l\'apercu');
    }
  };

  const handlePause = async () => {
    setActionLoading(true);
    try {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + pauseWeeks * 7 * 24 * 60 * 60 * 1000).toISOString();
      await categorySubscriptionsApi.pause(id as string, { startDate, endDate });
      await loadSubscription();
      setShowPauseModal(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la mise en pause');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    try {
      await categorySubscriptionsApi.resume(id as string);
      await loadSubscription();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la reprise');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSkipNext = async () => {
    setActionLoading(true);
    try {
      const nextDelivery = new Date(subscription.nextDelivery);
      await categorySubscriptionsApi.skip(id as string, { skipDate: nextDelivery.toISOString().split('T')[0] });
      await loadSubscription();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du skip');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await categorySubscriptionsApi.cancel(id as string);
      router.push('/dashboard/subscriptions');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'annulation');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Abonnement non trouve</h1>
        <Link href="/dashboard/subscriptions" className="text-primary-600 hover:text-primary-700">
          Retour a mes abonnements
        </Link>
      </div>
    );
  }

  const category = CATEGORIES[subscription.category] || CATEGORIES.mixed;
  const boxSize = BOX_SIZES[subscription.boxSize] || BOX_SIZES.MEDIUM;
  const isPaused = subscription.status === 'PAUSED';
  const isCancelled = subscription.status === 'CANCELLED';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 mb-6">
        <Link href="/dashboard" className="hover:text-gray-700">Dashboard</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <Link href="/dashboard/subscriptions" className="hover:text-gray-700">Abonnements</Link>
        <ChevronRight className="h-4 w-4 mx-2" />
        <span className="text-gray-900">Box {category.name}</span>
      </nav>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
          <button onClick={() => setError('')} className="ml-auto text-red-800">×</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center text-3xl">
              {category.emoji}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Box {category.name}
              </h1>
              <p className="text-gray-500">{boxSize.name} - {boxSize.items}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isCancelled ? 'bg-red-100 text-red-800' :
              isPaused ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {isCancelled ? 'Annule' : isPaused ? 'En pause' : 'Actif'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          {/* Next Delivery */}
          {!isCancelled && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary-600" />
                Prochaine livraison
              </h2>

              {isPaused ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    Abonnement en pause jusqu&apos;au{' '}
                    {new Date(subscription.pausedUntil).toLocaleDateString('fr-TN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <button
                    onClick={handleResume}
                    disabled={actionLoading}
                    className="mt-3 inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Reprendre maintenant
                  </button>
                </div>
              ) : subscription.nextDelivery ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Date(subscription.nextDelivery).toLocaleDateString('fr-TN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      })}
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      {FREQUENCIES[subscription.frequency]}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={loadPreview}
                      className="flex items-center px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Apercu
                    </button>
                    <button
                      onClick={handleSkipNext}
                      disabled={actionLoading || subscription.skipsThisMonth >= subscription.maxSkipsPerMonth}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
                    >
                      <SkipForward className="h-4 w-4 mr-2" />
                      Sauter
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Pas de livraison programmee</p>
              )}

              {subscription.skipsThisMonth > 0 && (
                <p className="text-sm text-gray-500 mt-3">
                  Skips ce mois: {subscription.skipsThisMonth} / {subscription.maxSkipsPerMonth}
                </p>
              )}
            </div>
          )}

          {/* Subscription Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-primary-600" />
              Details de l&apos;abonnement
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Categorie</span>
                <span className="font-medium">{category.emoji} {category.name}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Taille</span>
                <span className="font-medium">{boxSize.name}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Frequence</span>
                <span className="font-medium">{FREQUENCIES[subscription.frequency]}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Jour de livraison</span>
                <span className="font-medium">{DAYS[subscription.deliveryDay]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Date de debut</span>
                <span className="font-medium">
                  {new Date(subscription.startDate).toLocaleDateString('fr-TN')}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-primary-600" />
              Adresse de livraison
            </h2>
            <p className="text-gray-700">{subscription.deliveryAddress}</p>
            <p className="text-sm text-gray-500 mt-1">Zone: {subscription.deliveryZone}</p>
          </div>

          {/* Preferences */}
          {subscription.preferences && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4">Preferences</h2>
              {subscription.preferences.excludeItems?.length > 0 && (
                <div className="mb-3">
                  <span className="text-gray-600 text-sm">Produits exclus:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {subscription.preferences.excludeItems.map((item: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {subscription.preferences.notes && (
                <div>
                  <span className="text-gray-600 text-sm">Notes:</span>
                  <p className="text-gray-700 mt-1">{subscription.preferences.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {!isCancelled && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4">Actions</h2>
              <div className="space-y-3">
                {isPaused ? (
                  <button
                    onClick={handleResume}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Reprendre l&apos;abonnement
                  </button>
                ) : (
                  <button
                    onClick={() => setShowPauseModal(true)}
                    disabled={actionLoading || subscription.pausesUsedThisYear >= subscription.maxPausesPerYear}
                    className="w-full flex items-center justify-center py-2 px-4 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition disabled:opacity-50"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Mettre en pause
                  </button>
                )}

                <Link
                  href={`/subscriptions/category/${id}/edit`}
                  className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </Link>

                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full flex items-center justify-center py-2 px-4 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Annuler l&apos;abonnement
                </button>
              </div>

              {subscription.pausesUsedThisYear > 0 && (
                <p className="text-xs text-gray-500 mt-4">
                  Pauses utilisees cette annee: {subscription.pausesUsedThisYear} / {subscription.maxPausesPerYear}
                </p>
              )}
            </div>
          )}

          {/* Help */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold mb-2">Besoin d&apos;aide?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Notre equipe est la pour vous aider avec votre abonnement.
            </p>
            <a
              href="mailto:support@farmbox.tn"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              support@farmbox.tn
            </a>
          </div>
        </div>
      </div>

      {/* Pause Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Mettre en pause</h2>
            <p className="text-gray-600 mb-4">
              Pendant combien de semaines souhaitez-vous mettre en pause votre abonnement?
            </p>
            <select
              value={pauseWeeks}
              onChange={(e) => setPauseWeeks(Number(e.target.value))}
              className="input w-full mb-4"
            >
              <option value={1}>1 semaine</option>
              <option value={2}>2 semaines</option>
              <option value={3}>3 semaines</option>
              <option value={4}>4 semaines</option>
            </select>
            <div className="flex gap-3">
              <button
                onClick={() => setShowPauseModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handlePause}
                disabled={actionLoading}
                className="flex-1 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center justify-center"
              >
                {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4 text-red-600">Annuler l&apos;abonnement</h2>
            <p className="text-gray-600 mb-4">
              Etes-vous sur de vouloir annuler votre abonnement? Cette action est irreversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Non, garder
              </button>
              <button
                onClick={handleCancel}
                disabled={actionLoading}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center"
              >
                {actionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Oui, annuler'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && preview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Apercu de votre prochaine box</h2>
              <button onClick={() => setShowPreview(false)} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>

            <div className="space-y-4">
              {preview.products?.map((product: any) => (
                <div key={product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-xl">
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                    ) : category.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.farm?.name}</p>
                  </div>
                  <span className="text-primary-600 font-medium">
                    {formatPrice(Number(product.price))}
                  </span>
                </div>
              ))}
            </div>

            {preview.total && (
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span className="font-medium">Valeur totale estimee</span>
                <span className="text-xl font-bold text-primary-600">
                  {formatPrice(preview.total)}
                </span>
              </div>
            )}

            <p className="text-sm text-gray-500 mt-4">
              * Cette selection peut changer en fonction des disponibilites
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
