'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { ordersApi } from '@/lib/api';
import { Order, ORDER_STATUS_LABELS, OrderStatus } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { Package, ArrowLeft, Loader2, Filter } from 'lucide-react';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard/orders');
      return;
    }

    loadOrders();
  }, [isAuthenticated, router, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) params.status = statusFilter;

      const response = await ordersApi.getMyOrders(params);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
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
        <h1 className="text-2xl font-bold text-gray-900">Mes commandes</h1>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input flex-1 sm:flex-none sm:min-w-[200px]"
          >
            <option value="">Toutes les commandes</option>
            <option value="PENDING">En attente</option>
            <option value="CONFIRMED">Confirmees</option>
            <option value="PREPARING">En preparation</option>
            <option value="OUT_FOR_DELIVERY">En livraison</option>
            <option value="DELIVERED">Livrees</option>
            <option value="CANCELLED">Annulees</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">Aucune commande trouvee</h3>
          <p className="text-gray-500 mb-4">
            {statusFilter
              ? 'Aucune commande avec ce statut'
              : 'Vous n\'avez pas encore passe de commande'}
          </p>
          <Link
            href="/farms"
            className="text-primary-600 font-medium hover:underline"
          >
            Decouvrir nos fermes
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <span className="font-semibold text-gray-900">{order.orderNumber}</span>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-gray-600">{formatDate(order.createdAt)}</span>
        </div>
        <span
          className={`text-sm px-3 py-1 rounded-full font-medium ${
            ORDER_STATUS_LABELS[order.status].color
          }`}
        >
          {ORDER_STATUS_LABELS[order.status].label}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Link
            href={`/farms/${order.farm.slug}`}
            className="font-medium text-primary-600 hover:underline"
          >
            {order.farm.name}
          </Link>
          <span className="text-gray-500">
            {order.items.length} article{order.items.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Items Preview */}
        <div className="flex flex-wrap gap-2 mb-4">
          {order.items.slice(0, 3).map((item) => (
            <span
              key={item.id}
              className="text-sm bg-gray-100 px-2 py-1 rounded"
            >
              {item.product.name} x{item.quantity}
            </span>
          ))}
          {order.items.length > 3 && (
            <span className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-500">
              +{order.items.length - 3} autres
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <span className="text-gray-500 text-sm">Total: </span>
            <span className="font-bold text-lg text-primary-600">
              {formatPrice(Number(order.total))}
            </span>
          </div>
          <Link
            href={`/dashboard/orders/${order.id}`}
            className="text-primary-600 font-medium hover:underline text-sm"
          >
            Voir les details →
          </Link>
        </div>
      </div>
    </div>
  );
}
