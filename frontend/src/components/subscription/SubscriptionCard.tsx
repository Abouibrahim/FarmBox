'use client';

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface SubscriptionCardProps {
  subscription: {
    id: string;
    boxType: string;
    status: string;
    frequency: string;
    nextDeliveryDate: string;
    price: number;
    farm?: { name: string };
  };
  onUpdate?: () => void;
}

export function SubscriptionCard({ subscription, onUpdate }: SubscriptionCardProps) {
  const [status, setStatus] = useState(subscription.status);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

  const handlePause = async () => {
    setLoading(true);
    setActionMessage('');
    try {
      await api.post(`/subscriptions/${subscription.id}/pause`);
      setStatus('PAUSED');
      setActionMessage('Abonnement mis en pause');
      onUpdate?.();
    } catch (error) {
      console.error('Failed to pause subscription:', error);
      setActionMessage('Erreur lors de la mise en pause');
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    setLoading(true);
    setActionMessage('');
    try {
      await api.post(`/subscriptions/${subscription.id}/resume`);
      setStatus('ACTIVE');
      setActionMessage('Abonnement réactivé');
      onUpdate?.();
    } catch (error) {
      console.error('Failed to resume subscription:', error);
      setActionMessage('Erreur lors de la réactivation');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    setActionMessage('');
    try {
      await api.post(`/subscriptions/${subscription.id}/skip`);
      setActionMessage('Livraison passée avec succès');
      onUpdate?.();
    } catch (error) {
      console.error('Failed to skip delivery:', error);
      setActionMessage('Erreur - limite de sauts atteinte?');
    } finally {
      setLoading(false);
    }
  };

  const nextDate = new Date(subscription.nextDeliveryDate);
  const formattedDate = nextDate.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const boxTypeLabel = subscription.boxType.charAt(0).toUpperCase() + subscription.boxType.slice(1);
  const frequencyLabel = subscription.frequency === 'weekly' ? 'semaine' : '2 semaines';

  return (
    <div className="bg-white rounded-xl p-6 border border-brand-cream-dark hover:shadow-md transition-shadow">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-display text-xl text-brand-green">
              Box {boxTypeLabel}
            </h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              status === 'ACTIVE'
                ? 'bg-green-100 text-green-700'
                : status === 'PAUSED'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {status === 'ACTIVE' ? 'Actif' : status === 'PAUSED' ? 'En pause' : 'Annulé'}
            </span>
          </div>

          <p className="text-brand-brown mb-1">
            <span className="font-semibold text-brand-green">{subscription.price} TND</span>
            <span className="text-sm">/{frequencyLabel}</span>
          </p>

          {subscription.farm && (
            <p className="text-sm text-brand-brown mb-2">
              Ferme: {subscription.farm.name}
            </p>
          )}

          {status === 'ACTIVE' && (
            <p className="text-sm text-brand-brown flex items-center gap-2">
              <span className="text-lg">📅</span>
              Prochaine livraison: <strong className="text-brand-green capitalize">{formattedDate}</strong>
            </p>
          )}

          {actionMessage && (
            <p className={`text-sm mt-2 ${actionMessage.includes('Erreur') ? 'text-red-600' : 'text-brand-green'}`}>
              {actionMessage}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {status === 'ACTIVE' ? (
            <>
              <button
                onClick={handleSkip}
                disabled={loading}
                className="px-4 py-2 text-sm text-brand-brown border border-brand-cream-dark rounded-lg hover:bg-brand-cream transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Passer cette semaine
              </button>
              <button
                onClick={handlePause}
                disabled={loading}
                className="px-4 py-2 text-sm text-brand-gold border border-brand-gold rounded-lg hover:bg-brand-gold/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mettre en pause
              </button>
            </>
          ) : status === 'PAUSED' ? (
            <button
              onClick={handleResume}
              disabled={loading}
              className="px-4 py-2 text-sm text-white bg-brand-green rounded-lg hover:bg-brand-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reprendre
            </button>
          ) : null}
          <Link
            href={`/dashboard/subscriptions/${subscription.id}`}
            className="px-4 py-2 text-sm text-brand-green border border-brand-green rounded-lg hover:bg-brand-green/10 transition-colors"
          >
            Modifier
          </Link>
        </div>
      </div>
    </div>
  );
}
