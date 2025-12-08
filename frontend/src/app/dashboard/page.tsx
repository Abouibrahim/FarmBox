'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { ordersApi } from '@/lib/api';
import { Order, ORDER_STATUS_LABELS } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils';
import { Package, ShoppingBag, User, Settings, ArrowRight, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard');
      return;
    }

    loadRecentOrders();
  }, [isAuthenticated, router]);

  const loadRecentOrders = async () => {
    try {
      const response = await ordersApi.getMyOrders({ limit: 5 });
      setRecentOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {user.name.split(' ')[0]}!
        </h1>
        <p className="text-gray-600">Bienvenue sur votre tableau de bord</p>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <QuickActionCard
          icon={<ShoppingBag className="h-6 w-6" />}
          title="Commander"
          description="Parcourir les fermes"
          href="/farms"
          color="primary"
        />
        <QuickActionCard
          icon={<Package className="h-6 w-6" />}
          title="Mes commandes"
          description="Voir l'historique"
          href="/dashboard/orders"
          color="blue"
        />
        <QuickActionCard
          icon={<User className="h-6 w-6" />}
          title="Mon profil"
          description="Modifier mes infos"
          href="/dashboard/profile"
          color="green"
        />
        <QuickActionCard
          icon={<Settings className="h-6 w-6" />}
          title="Parametres"
          description="Preferences"
          href="/dashboard/settings"
          color="gray"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="font-semibold text-lg">Commandes recentes</h2>
          <Link
            href="/dashboard/orders"
            className="text-primary-600 text-sm font-medium hover:underline flex items-center"
          >
            Voir tout
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Vous n'avez pas encore de commandes</p>
            <Link
              href="/farms"
              className="text-primary-600 font-medium hover:underline"
            >
              Decouvrir nos fermes
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="block p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-gray-900">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          ORDER_STATUS_LABELS[order.status].color
                        }`}
                      >
                        {ORDER_STATUS_LABELS[order.status].label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {order.farm.name} - {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(Number(order.total))}
                    </p>
                    <p className="text-sm text-gray-500">
                      {order.items.length} article{order.items.length > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuickActionCard({
  icon,
  title,
  description,
  href,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: 'primary' | 'blue' | 'green' | 'gray';
}) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    gray: 'bg-gray-50 text-gray-600',
  };

  return (
    <Link
      href={href}
      className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition group"
    >
      <div
        className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </Link>
  );
}
