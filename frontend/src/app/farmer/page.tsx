'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { farmsApi, ordersApi } from '@/lib/api';
import { Order, ORDER_STATUS_LABELS } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Plus,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface FarmStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeSubscriptions: number;
}

export default function FarmerDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [farm, setFarm] = useState<any>(null);
  const [stats, setStats] = useState<FarmStats | null>(null);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/farmer');
      return;
    }

    if (user?.role !== 'FARMER') {
      router.push('/dashboard');
      return;
    }

    loadData();
  }, [isAuthenticated, user, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load farm data
      const farmResponse = await farmsApi.getMyFarm();
      setFarm(farmResponse.data);

      // Load stats
      const statsResponse = await farmsApi.getStats();
      setStats(statsResponse.data);

      // Load pending orders
      const ordersResponse = await ordersApi.getFarmOrders({ status: 'PENDING' });
      setPendingOrders(ordersResponse.data.slice(0, 5));
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      if (err.response?.status === 404) {
        // Farm not found - redirect to onboarding
        router.push('/farmer/onboarding');
      } else {
        setError('Impossible de charger les donnees');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'FARMER') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">{error}</h1>
        <button
          onClick={loadData}
          className="text-primary-600 font-medium hover:underline"
        >
          Reessayer
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">{farm?.name}</p>
        </div>
        <Link
          href="/farmer/products/new"
          className="mt-4 sm:mt-0 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition inline-flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un produit
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<ShoppingCart className="h-6 w-6" />}
          label="Commandes en attente"
          value={stats?.pendingOrders || 0}
          color="yellow"
        />
        <StatCard
          icon={<CheckCircle className="h-6 w-6" />}
          label="Commandes livrees"
          value={stats?.completedOrders || 0}
          color="green"
        />
        <StatCard
          icon={<TrendingUp className="h-6 w-6" />}
          label="Revenus du mois"
          value={`${formatPrice(stats?.monthlyRevenue || 0)}`}
          color="primary"
        />
        <StatCard
          icon={<Package className="h-6 w-6" />}
          label="Produits actifs"
          value={farm?._count?.products || 0}
          color="blue"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Link
          href="/farmer/orders"
          className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition flex items-center"
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Gerer les commandes</h3>
            <p className="text-sm text-gray-500">
              {stats?.pendingOrders || 0} en attente
            </p>
          </div>
        </Link>

        <Link
          href="/farmer/products"
          className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition flex items-center"
        >
          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mr-4">
            <Package className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Mes produits</h3>
            <p className="text-sm text-gray-500">
              {farm?._count?.products || 0} produits
            </p>
          </div>
        </Link>

        <Link
          href="/farmer/settings"
          className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition flex items-center"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
            <Users className="h-6 w-6 text-gray-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Ma ferme</h3>
            <p className="text-sm text-gray-500">Parametres et profil</p>
          </div>
        </Link>
      </div>

      {/* Pending Orders */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="font-semibold text-lg">Commandes en attente</h2>
          <Link
            href="/farmer/orders"
            className="text-primary-600 text-sm font-medium hover:underline flex items-center"
          >
            Voir tout
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune commande en attente</p>
          </div>
        ) : (
          <div className="divide-y">
            {pendingOrders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-gray-900">
                        {order.orderNumber}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                        En attente
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {order.customer?.name} - {formatDate(order.deliveryDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(Number(order.total))}
                    </p>
                    <Link
                      href={`/farmer/orders/${order.id}`}
                      className="text-sm text-primary-600 hover:underline"
                    >
                      Gerer →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: 'primary' | 'yellow' | 'green' | 'blue';
}) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
