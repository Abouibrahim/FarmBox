'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { subscriptionsApi } from '@/lib/api';
import {
  Subscription,
  SubscriptionSkip,
  SubscriptionPause,
  SUBSCRIPTION_STATUS_LABELS,
  BOX_SIZES,
  DAYS_OF_WEEK,
  DELIVERY_ZONES,
} from '@/types';
import { formatDate, formatPrice } from '@/lib/utils';
import {
  ArrowLeft,
  Loader2,
  Calendar,
  Package,
  MapPin,
  Clock,
  Pause,
  Play,
  SkipForward,
  X,
  CheckCircle,
  AlertCircle,
  Settings,
} from 'lucide-react';

export default function SubscriptionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard/subscriptions');
      return;
    }

    loadSubscription();
  }, [isAuthenticated, params.id, router]);

  const loadSubscription = async () => {
    try {
      setLoading(true);
      const response = await subscriptionsApi.getById(params.id as string);
      setSubscription(response.data.data);
    } catch (error) {
      console.error('Failed to load subscription:', error);
      router.push('/dashboard/subscriptions');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const statusInfo = SUBSCRIPTION_STATUS_LABELS[subscription.status];
  const boxInfo = BOX_SIZES[subscription.boxSize];
  const deliveryDay = DAYS_OF_WEEK.find(d => d.value === subscription.deliveryDay);
  const zoneInfo = DELIVERY_ZONES[subscription.deliveryZone];
  const isPaused = subscription.status === 'PAUSED';
  const isActive = subscription.status === 'ACTIVE';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/subscriptions"
          className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux abonnements
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Abonnement {subscription.farm?.name}
            </h1>
            <p className="text-gray-600">
              Panier {boxInfo?.name} - {subscription.frequency === 'WEEKLY' ? 'Hebdomadaire' : 'Bi-hebdomadaire'}
            </p>
          </div>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusInfo?.color}`}>
            {statusInfo?.label}
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Subscription Details */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary-600" />
              Details de l&apos;abonnement
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Taille du panier</p>
                <p className="font-semibold">{boxInfo?.name}</p>
                <p className="text-sm text-gray-600">{boxInfo?.weight} - {boxInfo?.price}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Frequence</p>
                <p className="font-semibold">
                  {subscription.frequency === 'WEEKLY' ? 'Chaque semaine' : 'Toutes les 2 semaines'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Jour de livraison</p>
                <p className="font-semibold">{deliveryDay?.labelFr}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Zone de livraison</p>
                <p className="font-semibold">{zoneInfo?.nameFr}</p>
              </div>
            </div>

            {subscription.deliveryAddress && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Adresse de livraison
                </p>
                <p className="font-medium">{subscription.deliveryAddress}</p>
              </div>
            )}
          </div>

          {/* Upcoming Deliveries */}
          <UpcomingDeliveries
            subscription={subscription}
            onRefresh={loadSubscription}
          />

          {/* Pause History */}
          {subscription.pauses && subscription.pauses.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Pause className="h-5 w-5 text-yellow-600" />
                Historique des pauses
              </h2>
              <div className="space-y-3">
                {subscription.pauses.map((pause) => (
                  <div key={pause.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {formatDate(pause.startDate)} - {formatDate(pause.endDate)}
                      </p>
                      {pause.reason && (
                        <p className="text-sm text-gray-600">{pause.reason}</p>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(pause.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">Statut</h3>
            {isActive && subscription.nextDelivery && (
              <div className="text-center p-4 bg-primary-50 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-1">Prochaine livraison</p>
                <p className="text-xl font-bold text-primary-600">
                  {formatDate(subscription.nextDelivery)}
                </p>
              </div>
            )}
            {isPaused && subscription.pausedUntil && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-1">Reprend le</p>
                <p className="text-xl font-bold text-yellow-600">
                  {formatDate(subscription.pausedUntil)}
                </p>
              </div>
            )}

            {/* Flexibility Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pauses cette annee</span>
                <span className="font-medium">
                  {subscription.pausesUsedThisYear}/{subscription.maxPausesPerYear}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: `${(subscription.pausesUsedThisYear / subscription.maxPausesPerYear) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">Sauts ce mois</span>
                <span className="font-medium">
                  {subscription.skipsThisMonth}/{subscription.maxSkipsPerMonth}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(subscription.skipsThisMonth / subscription.maxSkipsPerMonth) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <QuickActions
            subscription={subscription}
            onRefresh={loadSubscription}
          />

          {/* Help */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold mb-4">Besoin d&apos;aide?</h3>
            <div className="space-y-2 text-sm">
              <p className="text-gray-600">
                <strong>Pause:</strong> Suspendez jusqu&apos;a 4 semaines, max 4 fois/an
              </p>
              <p className="text-gray-600">
                <strong>Saut:</strong> Sautez jusqu&apos;a 2 livraisons/mois (48h a l&apos;avance)
              </p>
              <p className="text-gray-600">
                <strong>Annulation:</strong> Annulez a tout moment sans frais
              </p>
            </div>
            {subscription.farm?.phone && (
              <a
                href={`tel:${subscription.farm.phone}`}
                className="mt-4 w-full btn-secondary text-center block"
              >
                Contacter la ferme
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UpcomingDeliveries({
  subscription,
  onRefresh,
}: {
  subscription: Subscription;
  onRefresh: () => void;
}) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Generate next 4 delivery dates
  const getUpcomingDates = () => {
    const dates: Date[] = [];
    const startDate = subscription.nextDelivery
      ? new Date(subscription.nextDelivery)
      : new Date();

    const weeksInterval = subscription.frequency === 'WEEKLY' ? 1 : 2;

    for (let i = 0; i < 4; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + (i * 7 * weeksInterval));
      dates.push(date);
    }

    return dates;
  };

  const upcomingDates = getUpcomingDates();
  const skippedDates = subscription.skips?.map(s => new Date(s.skipDate).toDateString()) || [];

  const handleSkip = async (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setActionLoading(dateStr);
    try {
      await subscriptionsApi.skip(subscription.id, { date: dateStr });
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors du saut');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnskip = async (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setActionLoading(dateStr);
    try {
      await subscriptionsApi.unskip(subscription.id, dateStr);
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Erreur lors de l'annulation du saut");
    } finally {
      setActionLoading(null);
    }
  };

  const canSkip = subscription.skipsThisMonth < subscription.maxSkipsPerMonth;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary-600" />
        Prochaines livraisons
      </h2>
      <div className="space-y-3">
        {upcomingDates.map((date, index) => {
          const dateStr = date.toDateString();
          const isSkipped = skippedDates.includes(dateStr);
          const isLoading = actionLoading === date.toISOString().split('T')[0];
          const isPast = date < new Date();
          const isWithin48h = (date.getTime() - Date.now()) < 48 * 60 * 60 * 1000;

          return (
            <div
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                isSkipped ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isSkipped ? 'bg-gray-200' :
                  index === 0 ? 'bg-primary-100' : 'bg-gray-100'
                }`}>
                  {isSkipped ? (
                    <SkipForward className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Package className={`h-5 w-5 ${index === 0 ? 'text-primary-600' : 'text-gray-400'}`} />
                  )}
                </div>
                <div>
                  <p className={`font-medium ${isSkipped ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    {formatDate(date)}
                  </p>
                  {index === 0 && !isSkipped && (
                    <p className="text-sm text-primary-600">Prochaine livraison</p>
                  )}
                  {isSkipped && (
                    <p className="text-sm text-gray-500">Sautee</p>
                  )}
                </div>
              </div>

              {!isPast && subscription.status === 'ACTIVE' && (
                <div>
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  ) : isSkipped ? (
                    <button
                      onClick={() => handleUnskip(date)}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Annuler le saut
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSkip(date)}
                      disabled={!canSkip || isWithin48h}
                      className={`text-sm font-medium ${
                        canSkip && !isWithin48h
                          ? 'text-gray-600 hover:text-gray-900'
                          : 'text-gray-300 cursor-not-allowed'
                      }`}
                      title={
                        isWithin48h
                          ? 'Impossible de sauter moins de 48h avant'
                          : !canSkip
                          ? 'Limite de sauts atteinte ce mois'
                          : undefined
                      }
                    >
                      Sauter
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!canSkip && (
        <p className="mt-4 text-sm text-yellow-600 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Vous avez atteint la limite de sauts pour ce mois
        </p>
      )}
    </div>
  );
}

function QuickActions({
  subscription,
  onRefresh,
}: {
  subscription: Subscription;
  onRefresh: () => void;
}) {
  const [actionLoading, setActionLoading] = useState(false);
  const [showPauseForm, setShowPauseForm] = useState(false);
  const [pauseWeeks, setPauseWeeks] = useState(2);

  const isPaused = subscription.status === 'PAUSED';
  const isActive = subscription.status === 'ACTIVE';
  const canPause = subscription.pausesUsedThisYear < subscription.maxPausesPerYear;

  const handlePause = async () => {
    setActionLoading(true);
    try {
      await subscriptionsApi.pause(subscription.id, { weeks: pauseWeeks });
      setShowPauseForm(false);
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors de la mise en pause');
    } finally {
      setActionLoading(false);
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
    const reason = window.prompt("Raison de l'annulation (optionnel):");
    if (reason === null) return;

    if (!window.confirm('Etes-vous sur de vouloir annuler cet abonnement?')) return;

    setActionLoading(true);
    try {
      await subscriptionsApi.cancel(subscription.id, reason || undefined);
      onRefresh();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Erreur lors de l'annulation");
    } finally {
      setActionLoading(false);
    }
  };

  if (subscription.status === 'CANCELLED') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-gray-500 text-center">Abonnement annule</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Settings className="h-5 w-5 text-gray-400" />
        Actions rapides
      </h3>
      <div className="space-y-3">
        {isPaused ? (
          <button
            onClick={handleResume}
            disabled={actionLoading}
            className="w-full btn-primary flex items-center justify-center gap-2"
          >
            {actionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Reprendre l&apos;abonnement
          </button>
        ) : isActive && !showPauseForm ? (
          <>
            <button
              onClick={() => setShowPauseForm(true)}
              disabled={!canPause}
              className={`w-full btn-secondary flex items-center justify-center gap-2 ${
                !canPause ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Pause className="h-4 w-4" />
              Mettre en pause
            </button>
            {!canPause && (
              <p className="text-xs text-yellow-600 text-center">
                Limite de pauses atteinte cette annee
              </p>
            )}
          </>
        ) : null}

        {showPauseForm && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Duree de la pause
            </label>
            <select
              value={pauseWeeks}
              onChange={(e) => setPauseWeeks(Number(e.target.value))}
              className="input w-full"
            >
              <option value={1}>1 semaine</option>
              <option value={2}>2 semaines</option>
              <option value={3}>3 semaines</option>
              <option value={4}>4 semaines</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handlePause}
                disabled={actionLoading}
                className="flex-1 btn-primary"
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                ) : (
                  'Confirmer'
                )}
              </button>
              <button
                onClick={() => setShowPauseForm(false)}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        <hr className="my-4" />

        <button
          onClick={handleCancel}
          disabled={actionLoading}
          className="w-full text-red-600 hover:text-red-700 text-sm font-medium flex items-center justify-center gap-2"
        >
          <X className="h-4 w-4" />
          Annuler l&apos;abonnement
        </button>
      </div>
    </div>
  );
}
