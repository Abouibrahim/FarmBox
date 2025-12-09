'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { subscriptionsApi, trialApi } from '@/lib/api';
import { Subscription, TrialBox, SUBSCRIPTION_STATUS_LABELS, BOX_SIZES, DAYS_OF_WEEK } from '@/types';
import { formatDate, formatPrice } from '@/lib/utils';
import {
  Package,
  ArrowLeft,
  Loader2,
  Calendar,
  Pause,
  Play,
  X,
  Clock,
  Gift,
  ChevronRight,
  Plus,
} from 'lucide-react';

export default function SubscriptionsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [trialBoxes, setTrialBoxes] = useState<TrialBox[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard/subscriptions');
      return;
    }

    loadData();
  }, [isAuthenticated, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsResponse, trialsResponse] = await Promise.all([
        subscriptionsApi.getMySubscriptions(),
        trialApi.getMyTrialBoxes(),
      ]);
      setSubscriptions(subsResponse.data.data || []);
      setTrialBoxes(trialsResponse.data.data || []);
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes abonnements</h1>
            <p className="text-gray-600">Gerez vos paniers hebdomadaires</p>
          </div>
          <Link
            href="/trial"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouvel abonnement
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : (
        <>
          {/* Trial Boxes */}
          {trialBoxes.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Gift className="h-5 w-5 text-primary-600" />
                Paniers d&apos;essai
              </h2>
              <div className="space-y-4">
                {trialBoxes.map((trial) => (
                  <TrialBoxCard key={trial.id} trial={trial} onRefresh={loadData} />
                ))}
              </div>
            </div>
          )}

          {/* Active Subscriptions */}
          {subscriptions.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary-600" />
                Abonnements actifs
              </h2>
              {subscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onRefresh={loadData}
                />
              ))}
            </div>
          ) : trialBoxes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">Aucun abonnement</h3>
              <p className="text-gray-500 mb-6">
                Recevez des produits frais chaque semaine avec nos paniers bio
              </p>
              <Link href="/trial" className="btn-primary inline-flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Essayer un panier (-25%)
              </Link>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function TrialBoxCard({ trial, onRefresh }: { trial: TrialBox; onRefresh: () => void }) {
  const isExpired = trial.status === 'EXPIRED' || new Date(trial.expiresAt) < new Date();
  const isPending = trial.status === 'PENDING';
  const isConverted = trial.status === 'CONVERTED';

  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden border-2 ${
      isPending ? 'border-primary-200' : 'border-transparent'
    }`}>
      <div className="p-4 bg-gradient-to-r from-primary-50 to-green-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {trial.farm?.logo ? (
              <img
                src={trial.farm.logo}
                alt={trial.farm.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <Gift className="h-6 w-6 text-primary-600" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{trial.farm?.name}</h3>
              <p className="text-sm text-gray-600">
                Panier {BOX_SIZES[trial.boxSize]?.name} - Essai
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              isPending ? 'bg-yellow-100 text-yellow-800' :
              isConverted ? 'bg-green-100 text-green-800' :
              isExpired ? 'bg-gray-100 text-gray-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {isPending ? 'En attente' :
               isConverted ? 'Converti' :
               isExpired ? 'Expire' :
               trial.status}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4">
        {isPending && !isExpired && (
          <>
            <div className="flex items-center gap-2 text-sm text-primary-600 mb-4">
              <Clock className="h-4 w-4" />
              <span>
                Expire le {formatDate(trial.expiresAt)} - {trial.discountPercent}% de reduction
              </span>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/farms/${trial.farm?.slug}`}
                className="btn-primary flex-1 text-center"
              >
                Commander maintenant
              </Link>
            </div>
          </>
        )}

        {trial.order && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Commande: {trial.order.orderNumber}
            </span>
            <span className="font-medium">{formatPrice(trial.order.total)}</span>
          </div>
        )}

        {isConverted && (
          <p className="text-sm text-green-600">
            Converti en abonnement regulier
          </p>
        )}
      </div>
    </div>
  );
}

function SubscriptionCard({
  subscription,
  onRefresh,
}: {
  subscription: Subscription;
  onRefresh: () => void;
}) {
  const [showActions, setShowActions] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [pauseWeeks, setPauseWeeks] = useState(2);

  const isPaused = subscription.status === 'PAUSED';
  const isActive = subscription.status === 'ACTIVE';
  const statusInfo = SUBSCRIPTION_STATUS_LABELS[subscription.status];
  const boxInfo = BOX_SIZES[subscription.boxSize];
  const deliveryDay = DAYS_OF_WEEK.find(d => d.value === subscription.deliveryDay);

  const handlePause = async () => {
    if (!window.confirm(`Mettre en pause pour ${pauseWeeks} semaines?`)) return;

    setActionLoading(true);
    try {
      await subscriptionsApi.pause(subscription.id, { weeks: pauseWeeks });
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors de la mise en pause');
    } finally {
      setActionLoading(false);
      setShowActions(false);
    }
  };

  const handleResume = async () => {
    setActionLoading(true);
    try {
      await subscriptionsApi.resume(subscription.id);
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors de la reprise');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt('Raison de l\'annulation (optionnel):');
    if (reason === null) return;

    setActionLoading(true);
    try {
      await subscriptionsApi.cancel(subscription.id, reason || undefined);
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors de l\'annulation');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {subscription.farm?.logo ? (
            <img
              src={subscription.farm.logo}
              alt={subscription.farm.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-primary-600" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{subscription.farm?.name}</h3>
            <p className="text-sm text-gray-600">
              Panier {boxInfo?.name} ({boxInfo?.weight})
            </p>
          </div>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusInfo?.color}`}>
          {statusInfo?.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Frequence</p>
            <p className="font-medium">
              {subscription.frequency === 'WEEKLY' ? 'Hebdomadaire' : 'Bi-hebdomadaire'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Jour de livraison</p>
            <p className="font-medium">{deliveryDay?.labelFr}</p>
          </div>
          {subscription.nextDelivery && isActive && (
            <div>
              <p className="text-sm text-gray-500">Prochaine livraison</p>
              <p className="font-medium text-primary-600">
                {formatDate(subscription.nextDelivery)}
              </p>
            </div>
          )}
          {isPaused && subscription.pausedUntil && (
            <div>
              <p className="text-sm text-gray-500">Reprend le</p>
              <p className="font-medium text-yellow-600">
                {formatDate(subscription.pausedUntil)}
              </p>
            </div>
          )}
        </div>

        {/* Flexibility Info */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <span className="font-medium">{subscription.pausesUsedThisYear}</span>
            /{subscription.maxPausesPerYear} pauses utilisees cette annee
          </div>
          <div>
            <span className="font-medium">{subscription.skipsThisMonth}</span>
            /{subscription.maxSkipsPerMonth} sauts ce mois
          </div>
        </div>

        {/* Actions */}
        {subscription.status !== 'CANCELLED' && (
          <div className="border-t pt-4">
            {!showActions ? (
              <div className="flex gap-2">
                {isPaused ? (
                  <button
                    onClick={handleResume}
                    disabled={actionLoading}
                    className="btn-primary flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    Reprendre
                  </button>
                ) : (
                  <button
                    onClick={() => setShowActions(true)}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    Gerer
                  </button>
                )}
                <Link
                  href={`/dashboard/subscriptions/${subscription.id}`}
                  className="btn-secondary flex items-center gap-2"
                >
                  Details
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-600">Pause pour:</label>
                  <select
                    value={pauseWeeks}
                    onChange={(e) => setPauseWeeks(Number(e.target.value))}
                    className="input py-1 px-2"
                  >
                    <option value={1}>1 semaine</option>
                    <option value={2}>2 semaines</option>
                    <option value={3}>3 semaines</option>
                    <option value={4}>4 semaines</option>
                  </select>
                  <button
                    onClick={handlePause}
                    disabled={actionLoading}
                    className="btn-secondary flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Pause className="h-4 w-4" />
                    )}
                    Confirmer
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    Annuler l&apos;abonnement
                  </button>
                  <button
                    onClick={() => setShowActions(false)}
                    className="text-gray-500 hover:text-gray-700 text-sm ml-auto"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
