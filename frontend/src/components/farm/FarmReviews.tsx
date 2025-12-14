'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import api from '@/lib/api';

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface FarmReviewsProps {
  farmId: string;
  reviews: Review[];
}

export function FarmReviews({ farmId, reviews: initialReviews }: FarmReviewsProps) {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState(initialReviews);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError('');
    try {
      const response = await api.post(`/farms/${farmId}/reviews`, newReview);
      setReviews([response.data, ...reviews]);
      setShowForm(false);
      setNewReview({ rating: 5, comment: '' });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la publication';
      setError(errorMessage);
      console.error('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl text-brand-green">
            Avis clients
          </h2>
          {reviews.length > 0 && (
            <p className="text-brand-brown">
              ⭐ {averageRating.toFixed(1)} basé sur {reviews.length} avis
            </p>
          )}
        </div>
        {user && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-brand-green text-white rounded-lg font-medium hover:bg-brand-green-dark transition-colors"
          >
            Écrire un avis
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-brand-cream rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-brand-green mb-4">Votre avis</h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Rating */}
          <div className="mb-4">
            <label className="block text-brand-brown mb-2">Note</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className={`text-2xl transition-transform hover:scale-110 ${
                    star <= newReview.rating ? 'text-brand-gold' : 'text-gray-300'
                  }`}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-4">
            <label className="block text-brand-brown mb-2">Commentaire</label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              rows={4}
              required
              className="w-full px-4 py-3 border border-brand-cream-dark rounded-lg focus:outline-none focus:border-brand-green resize-none"
              placeholder="Partagez votre expérience avec cette ferme..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-brand-green text-white rounded-lg font-medium hover:bg-brand-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Envoi...' : 'Publier'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError('');
              }}
              className="px-6 py-2 text-brand-brown hover:text-brand-green transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Login prompt for non-authenticated users */}
      {!user && (
        <div className="bg-brand-cream rounded-lg p-4 mb-6 text-center">
          <p className="text-brand-brown">
            <a href="/login" className="text-brand-green font-medium hover:underline">
              Connectez-vous
            </a>{' '}
            pour laisser un avis sur cette ferme.
          </p>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">💬</div>
          <p className="text-brand-brown">
            Aucun avis pour le moment. Soyez le premier à partager votre expérience!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-brand-cream-dark pb-4 last:border-b-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-brand-cream rounded-full flex items-center justify-center text-brand-green font-semibold">
                    {review.user.firstName[0]}{review.user.lastName[0]}
                  </div>
                  <div>
                    <div className="font-medium text-brand-green">
                      {review.user.firstName} {review.user.lastName[0]}.
                    </div>
                    <div className="text-xs text-brand-brown">
                      {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                </div>
                <div className="text-brand-gold">
                  {'⭐'.repeat(review.rating)}
                </div>
              </div>
              <p className="text-brand-brown">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
