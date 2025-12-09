'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { qualityApi, ordersApi } from '@/lib/api';
import { Order } from '@/types';
import { formatDate, formatPrice } from '@/lib/utils';
import {
  ArrowLeft,
  Loader2,
  Star,
  Gift,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  Package,
  Truck,
  Leaf,
  Box,
} from 'lucide-react';

export default function SurveyPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    overallRating: 0,
    freshnessRating: 0,
    deliveryRating: 0,
    packagingRating: 0,
    wouldRecommend: true,
    feedback: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard/quality');
      return;
    }

    loadOrder();
  }, [isAuthenticated, params.orderId, router]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.getById(params.orderId as string);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Failed to load order:', error);
      router.push('/dashboard/quality');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.overallRating === 0 || formData.freshnessRating === 0 ||
        formData.deliveryRating === 0 || formData.packagingRating === 0) {
      alert('Veuillez donner une note pour chaque critere');
      return;
    }

    setSubmitting(true);
    try {
      await qualityApi.submitSurvey({
        orderId: params.orderId as string,
        ...formData,
      });
      setSubmitted(true);
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors de l\'envoi');
    } finally {
      setSubmitting(false);
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

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Merci pour votre avis!</h1>
          <p className="text-gray-600 mb-6">
            Votre feedback nous aide a ameliorer nos services. Un credit de 5 TND a ete ajoute a votre compte.
          </p>
          <div className="bg-green-50 rounded-lg p-4 mb-6 inline-flex items-center gap-2">
            <Gift className="h-5 w-5 text-green-600" />
            <span className="font-semibold text-green-700">+5.000 TND</span>
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard/quality" className="btn-primary">
              Voir mes credits
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              Tableau de bord
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/quality"
          className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Evaluez votre commande
        </h1>
        <p className="text-gray-600">
          Votre avis est precieux! Gagnez 5 TND en completant cette evaluation.
        </p>
      </div>

      {/* Order Info */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">{order.orderNumber}</p>
            <p className="text-sm text-gray-600">{order.farm.name}</p>
          </div>
          <div className="text-right">
            <p className="font-semibold">{formatPrice(Number(order.total))}</p>
            <p className="text-sm text-gray-500">{formatDate(order.deliveryDate || order.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Survey Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Overall Rating */}
        <RatingSection
          icon={<Star className="h-5 w-5" />}
          title="Note globale"
          description="Votre satisfaction generale"
          value={formData.overallRating}
          onChange={(v) => setFormData({ ...formData, overallRating: v })}
        />

        {/* Freshness Rating */}
        <RatingSection
          icon={<Leaf className="h-5 w-5" />}
          title="Fraicheur des produits"
          description="Qualite et fraicheur a la reception"
          value={formData.freshnessRating}
          onChange={(v) => setFormData({ ...formData, freshnessRating: v })}
        />

        {/* Delivery Rating */}
        <RatingSection
          icon={<Truck className="h-5 w-5" />}
          title="Livraison"
          description="Ponctualite et service du livreur"
          value={formData.deliveryRating}
          onChange={(v) => setFormData({ ...formData, deliveryRating: v })}
        />

        {/* Packaging Rating */}
        <RatingSection
          icon={<Box className="h-5 w-5" />}
          title="Emballage"
          description="Qualite et eco-responsabilite"
          value={formData.packagingRating}
          onChange={(v) => setFormData({ ...formData, packagingRating: v })}
        />

        {/* Would Recommend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <p className="font-medium text-gray-900 mb-4">
            Recommanderiez-vous FarmBox a vos proches?
          </p>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, wouldRecommend: true })}
              className={`flex-1 py-4 rounded-xl border-2 transition flex items-center justify-center gap-2 ${
                formData.wouldRecommend
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <ThumbsUp className="h-5 w-5" />
              Oui
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, wouldRecommend: false })}
              className={`flex-1 py-4 rounded-xl border-2 transition flex items-center justify-center gap-2 ${
                !formData.wouldRecommend
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <ThumbsDown className="h-5 w-5" />
              Non
            </button>
          </div>
        </div>

        {/* Feedback */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <label className="block font-medium text-gray-900 mb-2">
            Commentaire (optionnel)
          </label>
          <textarea
            value={formData.feedback}
            onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
            className="input w-full"
            rows={4}
            placeholder="Partagez votre experience, suggestions ou remarques..."
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
        >
          {submitting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <Gift className="h-5 w-5" />
              Envoyer et recevoir 5 TND
            </>
          )}
        </button>
      </form>
    </div>
  );
}

function RatingSection({
  icon,
  title,
  description,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
          {icon}
        </div>
        <div>
          <p className="font-medium text-gray-900">{title}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-2 transition hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= value
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
