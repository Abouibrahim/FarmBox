'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';

interface Product {
  id: string;
  name: string;
  quantity: string;
  image: string | null;
  farm: { name: string };
}

interface UpcomingBoxProps {
  subscriptionId: string;
}

export function UpcomingBox({ subscriptionId }: UpcomingBoxProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deadline, setDeadline] = useState<string>('');

  const fetchUpcomingBox = useCallback(async () => {
    try {
      const response = await api.get(`/subscriptions/${subscriptionId}/upcoming`);
      setProducts(response.data.products);
      setDeadline(response.data.modificationDeadline);
    } catch {
      // Mock data for development
      setProducts([
        { id: '1', name: 'Tomates heirloom', quantity: '1kg', image: null, farm: { name: 'Ferme Ben Salah' } },
        { id: '2', name: 'Courgettes bio', quantity: '500g', image: null, farm: { name: 'Ferme Ben Salah' } },
        { id: '3', name: 'Oranges Hammamet', quantity: '2kg', image: null, farm: { name: 'Domaine Zaghouan' } },
        { id: '4', name: 'Épinards frais', quantity: 'botte', image: null, farm: { name: 'Les Jardins de Sonia' } },
        { id: '5', name: 'Oeufs fermiers', quantity: '12', image: null, farm: { name: 'Ferme Testour' } },
      ]);
      // Calculate a mock deadline (2 days from now)
      const mockDeadline = new Date();
      mockDeadline.setDate(mockDeadline.getDate() + 2);
      setDeadline(mockDeadline.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }));
    } finally {
      setLoading(false);
    }
  }, [subscriptionId]);

  useEffect(() => {
    fetchUpcomingBox();
  }, [fetchUpcomingBox]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 animate-pulse border border-brand-cream-dark">
        <div className="h-6 bg-brand-cream-dark rounded w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-brand-cream-dark rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-brand-cream-dark">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-brand-green">Contenu de votre prochaine box</h3>
        <span className="text-sm text-brand-brown bg-brand-cream px-3 py-1 rounded-full">
          {products.length} produits
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between p-3 bg-brand-cream rounded-lg hover:bg-brand-cream-dark transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full rounded-lg object-cover"
                  />
                ) : (
                  <span className="text-2xl">🥬</span>
                )}
              </div>
              <div>
                <div className="font-medium text-brand-green">{product.name}</div>
                <div className="text-sm text-brand-brown">
                  {product.farm.name} • {product.quantity}
                </div>
              </div>
            </div>
            <button className="text-sm text-brand-green hover:text-brand-green-dark hover:underline transition-colors">
              Échanger
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-4 border-t border-brand-cream-dark gap-2">
        <p className="text-sm text-brand-brown flex items-center gap-2">
          <span className="text-lg">⏰</span>
          Date limite de modification: <strong className="text-brand-green capitalize">{deadline}</strong>
        </p>
        <button className="text-sm text-brand-green font-medium hover:underline">
          Voir tous les produits →
        </button>
      </div>
    </div>
  );
}
