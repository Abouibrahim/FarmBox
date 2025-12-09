'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { qualityApi, ordersApi } from '@/lib/api';
import {
  QualityReport,
  CustomerCredit,
  Order,
  QUALITY_ISSUES,
  REPORT_STATUS_LABELS,
} from '@/types';
import { formatDate, formatPrice } from '@/lib/utils';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CreditCard,
  FileText,
  Plus,
  CheckCircle,
  Clock,
  X,
  ChevronRight,
  Wallet,
  Gift,
} from 'lucide-react';

export default function QualityPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'reports' | 'credits'>('reports');
  const [reports, setReports] = useState<QualityReport[]>([]);
  const [credits, setCredits] = useState<{ available: number; total: number; credits: CustomerCredit[] }>();
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/dashboard/quality');
      return;
    }

    loadData();
  }, [isAuthenticated, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsRes, creditsRes, pendingRes] = await Promise.all([
        qualityApi.getMyReports(),
        qualityApi.getMyCredits(),
        qualityApi.getOrdersPendingSurvey(),
      ]);
      setReports(reportsRes.data.data || []);
      setCredits(creditsRes.data.data);
      setPendingOrders(pendingRes.data.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
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
        <h1 className="text-2xl font-bold text-gray-900">Qualite & Credits</h1>
        <p className="text-gray-600">
          Signalez des problemes et gerez vos credits
        </p>
      </div>

      {/* Credit Summary */}
      {credits && (
        <div className="bg-gradient-to-r from-primary-500 to-green-500 rounded-xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm">Solde disponible</p>
              <p className="text-3xl font-bold">{formatPrice(credits.available)}</p>
            </div>
            <Wallet className="h-12 w-12 text-primary-200" />
          </div>
          {credits.available > 0 && (
            <p className="text-primary-100 text-sm mt-2">
              Utilisable sur votre prochaine commande
            </p>
          )}
        </div>
      )}

      {/* Pending Surveys */}
      {pendingOrders.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Gift className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-blue-900">
                Donnez votre avis et gagnez 5 TND!
              </p>
              <p className="text-sm text-blue-700 mb-3">
                Vous avez {pendingOrders.length} commande(s) en attente d&apos;evaluation
              </p>
              <div className="flex flex-wrap gap-2">
                {pendingOrders.slice(0, 3).map((order) => (
                  <Link
                    key={order.id}
                    href={`/dashboard/quality/survey/${order.id}`}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                  >
                    {order.orderNumber}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-1 border-b-2 font-medium transition ${
            activeTab === 'reports'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Signalements
        </button>
        <button
          onClick={() => setActiveTab('credits')}
          className={`pb-3 px-1 border-b-2 font-medium transition ${
            activeTab === 'credits'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <CreditCard className="h-4 w-4 inline mr-2" />
          Historique credits
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : activeTab === 'reports' ? (
        <ReportsTab reports={reports} onRefresh={loadData} />
      ) : (
        <CreditsTab credits={credits?.credits || []} />
      )}
    </div>
  );
}

function ReportsTab({
  reports,
  onRefresh,
}: {
  reports: QualityReport[];
  onRefresh: () => void;
}) {
  const [showNewReport, setShowNewReport] = useState(false);

  return (
    <div>
      {!showNewReport ? (
        <button
          onClick={() => setShowNewReport(true)}
          className="w-full btn-primary flex items-center justify-center gap-2 mb-6"
        >
          <Plus className="h-4 w-4" />
          Signaler un probleme
        </button>
      ) : (
        <NewReportForm
          onCancel={() => setShowNewReport(false)}
          onSuccess={() => {
            setShowNewReport(false);
            onRefresh();
          }}
        />
      )}

      {reports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
          <h3 className="font-medium text-gray-900 mb-2">Aucun signalement</h3>
          <p className="text-gray-500">
            Vous n&apos;avez pas encore signale de probleme de qualite
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportCard({ report }: { report: QualityReport }) {
  const statusInfo = REPORT_STATUS_LABELS[report.status];
  const issueInfo = QUALITY_ISSUES[report.issueType];

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-gray-50 flex items-center justify-between">
        <div>
          <span className="font-medium text-gray-900">
            {report.order?.orderNumber}
          </span>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-gray-600 text-sm">
            {formatDate(report.createdAt)}
          </span>
        </div>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${statusInfo?.color}`}>
          {statusInfo?.label}
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">{issueInfo?.label}</p>
            {report.product && (
              <p className="text-sm text-gray-600">Produit: {report.product.name}</p>
            )}
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-3">{report.description}</p>

        {report.photoUrls && report.photoUrls.length > 0 && (
          <div className="flex gap-2 mb-3">
            {report.photoUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Photo ${i + 1}`}
                className="w-16 h-16 object-cover rounded-lg"
              />
            ))}
          </div>
        )}

        {report.status === 'RESOLVED' && report.resolution && (
          <div className="mt-3 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Resolution:</strong> {report.resolution}
            </p>
            {report.creditAmount && (
              <p className="text-sm text-green-600 mt-1">
                Credit accorde: {formatPrice(report.creditAmount)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NewReportForm({
  onCancel,
  onSuccess,
}: {
  onCancel: () => void;
  onSuccess: () => void;
}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    orderId: '',
    productId: '',
    issueType: '',
    description: '',
  });

  useEffect(() => {
    loadRecentOrders();
  }, []);

  const loadRecentOrders = async () => {
    try {
      const response = await ordersApi.getMyOrders({ status: 'DELIVERED', limit: 10 });
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedOrder = orders.find(o => o.id === formData.orderId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orderId || !formData.issueType || !formData.description) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSubmitting(true);
    try {
      await qualityApi.createReport({
        orderId: formData.orderId,
        productId: formData.productId || undefined,
        issueType: formData.issueType,
        description: formData.description,
      });
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Erreur lors du signalement');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600 mx-auto" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h3 className="font-semibold text-lg mb-4">Signaler un probleme</h3>

      <div className="space-y-4">
        {/* Order Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Commande concernee *
          </label>
          <select
            value={formData.orderId}
            onChange={(e) => setFormData({ ...formData, orderId: e.target.value, productId: '' })}
            className="input w-full"
            required
          >
            <option value="">Selectionnez une commande</option>
            {orders.map((order) => (
              <option key={order.id} value={order.id}>
                {order.orderNumber} - {order.farm.name} ({formatDate(order.deliveryDate || order.createdAt)})
              </option>
            ))}
          </select>
        </div>

        {/* Product Selection (optional) */}
        {selectedOrder && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produit concerne (optionnel)
            </label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="input w-full"
            >
              <option value="">Tous les produits / General</option>
              {selectedOrder.items.map((item) => (
                <option key={item.id} value={item.product.name}>
                  {item.product.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Issue Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de probleme *
          </label>
          <select
            value={formData.issueType}
            onChange={(e) => setFormData({ ...formData, issueType: e.target.value })}
            className="input w-full"
            required
          >
            <option value="">Selectionnez un type</option>
            {Object.entries(QUALITY_ISSUES).map(([key, issue]) => (
              <option key={key} value={key}>
                {issue.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input w-full"
            rows={3}
            placeholder="Decrivez le probleme en detail..."
            required
          />
        </div>

        {/* Credit Info */}
        <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
          <p className="font-medium mb-1">Credit automatique</p>
          <p>
            Selon le type de probleme, vous recevrez automatiquement un credit
            sur votre compte (jusqu&apos;a 100% du prix du produit concerne).
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 btn-primary"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin mx-auto" />
            ) : (
              'Envoyer le signalement'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Annuler
          </button>
        </div>
      </div>
    </form>
  );
}

function CreditsTab({ credits }: { credits: CustomerCredit[] }) {
  if (credits.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="font-medium text-gray-900 mb-2">Aucun credit</h3>
        <p className="text-gray-500">
          Vous n&apos;avez pas encore recu de credits
        </p>
      </div>
    );
  }

  const REASON_LABELS: Record<string, string> = {
    QUALITY_ISSUE: 'Probleme de qualite',
    PACKAGING_RETURN: 'Retour emballage',
    REFERRAL: 'Parrainage',
    LOYALTY: 'Fidelite',
    APOLOGY: 'Geste commercial',
    PROMOTION: 'Promotion',
  };

  return (
    <div className="space-y-4">
      {credits.map((credit) => (
        <div
          key={credit.id}
          className={`bg-white rounded-xl shadow-sm p-4 flex items-center justify-between ${
            credit.usedAt ? 'opacity-60' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              credit.usedAt ? 'bg-gray-100' : 'bg-green-100'
            }`}>
              {credit.usedAt ? (
                <CheckCircle className="h-5 w-5 text-gray-400" />
              ) : (
                <CreditCard className="h-5 w-5 text-green-600" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {formatPrice(credit.amount)}
              </p>
              <p className="text-sm text-gray-600">
                {REASON_LABELS[credit.reason] || credit.reason}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">{formatDate(credit.createdAt)}</p>
            {credit.usedAt ? (
              <p className="text-xs text-gray-400">Utilise</p>
            ) : credit.expiresAt ? (
              <p className="text-xs text-yellow-600">
                Expire le {formatDate(credit.expiresAt)}
              </p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
