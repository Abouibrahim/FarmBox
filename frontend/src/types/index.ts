export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: 'CUSTOMER' | 'FARMER' | 'ADMIN';
  address?: string;
  city?: string;
  zone?: DeliveryZone;
  farm?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface Farm {
  id: string;
  name: string;
  slug: string;
  description?: string;
  story?: string;
  address: string;
  city: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  logo?: string;
  coverImage?: string;
  images: string[];
  deliveryZones: DeliveryZone[];
  isActive: boolean;
  isVerified: boolean;
  tier: string;
  products?: Product[];
  reviews?: Review[];
  averageRating?: number;
  _count?: {
    products: number;
    reviews: number;
    orders: number;
  };
}

export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  price: number;
  unit: string;
  minQuantity: number;
  category: string;
  subcategory?: string;
  isAvailable: boolean;
  seasonStart?: number;
  seasonEnd?: number;
  stockQuantity?: number;
  images: string[];
  farmId: string;
  farm?: {
    id: string;
    name: string;
    slug: string;
    phone?: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  deliveryType: DeliveryType;
  deliveryDate: string;
  deliveryWindow?: string;
  deliveryAddress?: string;
  deliveryZone?: DeliveryZone;
  deliveryFee: number;
  subtotal: number;
  total: number;
  paymentMethod: string;
  isPaid: boolean;
  customerNotes?: string;
  createdAt: string;
  confirmedAt?: string;
  deliveredAt?: string;
  items: OrderItem[];
  farm: {
    name: string;
    slug: string;
    phone?: string;
    whatsapp?: string;
  };
  customer?: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    name: string;
    nameAr?: string;
    unit: string;
    images: string[];
  };
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  customer: {
    name: string;
  };
}

export interface Subscription {
  id: string;
  boxSize: BoxSize;
  frequency: SubscriptionFrequency;
  deliveryDay: number;
  status: SubscriptionStatus;
  deliveryAddress: string;
  deliveryZone: DeliveryZone;
  startDate: string;
  nextDelivery?: string;
  pausedUntil?: string;
  pausesUsedThisYear: number;
  maxPausesPerYear: number;
  skipsThisMonth: number;
  maxSkipsPerMonth: number;
  farm?: {
    name: string;
    slug: string;
    logo?: string;
    phone?: string;
  };
  pauses?: SubscriptionPause[];
  skips?: SubscriptionSkip[];
}

export interface SubscriptionPause {
  id: string;
  startDate: string;
  endDate: string;
  reason?: string;
  createdAt: string;
}

export interface SubscriptionSkip {
  id: string;
  skipDate: string;
  reason?: string;
  createdAt: string;
}

export interface TrialBox {
  id: string;
  farmId: string;
  boxSize: BoxSize;
  status: TrialStatus;
  discountPercent: number;
  convertedToSub: boolean;
  createdAt: string;
  expiresAt: string;
  farm?: {
    name: string;
    slug: string;
    logo?: string;
  };
  order?: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    total: number;
  };
}

export type TrialStatus = 'PENDING' | 'ORDERED' | 'DELIVERED' | 'CONVERTED' | 'EXPIRED';

export interface QualityReport {
  id: string;
  orderId: string;
  productId?: string;
  issueType: QualityIssue;
  description: string;
  photoUrls: string[];
  status: ReportStatus;
  resolution?: string;
  creditAmount?: number;
  createdAt: string;
  handledAt?: string;
  order?: {
    orderNumber: string;
    createdAt: string;
    deliveryDate: string;
  };
  product?: {
    name: string;
    nameAr?: string;
    images: string[];
  };
}

export type QualityIssue =
  | 'DAMAGED'
  | 'NOT_FRESH'
  | 'WRONG_ITEM'
  | 'MISSING_ITEM'
  | 'QUANTITY_SHORT'
  | 'TASTE_QUALITY'
  | 'OTHER';

export type ReportStatus = 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED';

export interface CustomerCredit {
  id: string;
  amount: number;
  reason: CreditReason;
  referenceId?: string;
  expiresAt?: string;
  usedAt?: string;
  usedInOrderId?: string;
  createdAt: string;
}

export type CreditReason =
  | 'QUALITY_ISSUE'
  | 'PACKAGING_RETURN'
  | 'REFERRAL'
  | 'LOYALTY'
  | 'APOLOGY'
  | 'PROMOTION';

export interface DeliverySurvey {
  id: string;
  orderId: string;
  overallRating: number;
  freshnessRating: number;
  deliveryRating: number;
  packagingRating: number;
  wouldRecommend: boolean;
  feedback?: string;
  createdAt: string;
  order?: {
    orderNumber: string;
    deliveryDate: string;
    farm: {
      name: string;
      slug: string;
    };
  };
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export type DeliveryZone = 'ZONE_A' | 'ZONE_B' | 'ZONE_C';
export type DeliveryType = 'DELIVERY' | 'PICKUP';
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';
export type SubscriptionStatus = 'ACTIVE' | 'PAUSED' | 'CANCELLED';
export type SubscriptionFrequency = 'WEEKLY' | 'BIWEEKLY';
export type BoxSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'FAMILY';

export const DELIVERY_ZONES: Record<DeliveryZone, {
  name: string;
  nameFr: string;
  cities: string[];
  fee: number;
  freeThreshold: number;
}> = {
  ZONE_A: {
    name: 'Zone A (0-15km)',
    nameFr: 'Zone A (0-15km)',
    cities: ['Tunis', 'La Marsa', 'Carthage', 'Sidi Bou Said'],
    fee: 5,
    freeThreshold: 80,
  },
  ZONE_B: {
    name: 'Zone B (15-30km)',
    nameFr: 'Zone B (15-30km)',
    cities: ['Ariana', 'Ben Arous', 'Manouba'],
    fee: 8,
    freeThreshold: 120,
  },
  ZONE_C: {
    name: 'Zone C (30-50km)',
    nameFr: 'Zone C (30-50km)',
    cities: ['Banlieue extérieure'],
    fee: 12,
    freeThreshold: 150,
  },
};

export const PRODUCT_CATEGORIES = [
  { id: 'vegetables', name: 'Légumes', nameAr: 'خضروات', icon: '🥬' },
  { id: 'herbs', name: 'Herbes', nameAr: 'أعشاب', icon: '🌿' },
  { id: 'fruits', name: 'Fruits', nameAr: 'فواكه', icon: '🍎' },
  { id: 'eggs', name: 'Oeufs', nameAr: 'بيض', icon: '🥚' },
  { id: 'honey', name: 'Miel', nameAr: 'عسل', icon: '🍯' },
  { id: 'olive-oil', name: 'Huile d\'olive', nameAr: 'زيت زيتون', icon: '🫒' },
  { id: 'dairy', name: 'Produits laitiers', nameAr: 'منتجات الألبان', icon: '🧀' },
  { id: 'other', name: 'Autres', nameAr: 'أخرى', icon: '📦' },
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  PREPARING: { label: 'En préparation', color: 'bg-purple-100 text-purple-800' },
  OUT_FOR_DELIVERY: { label: 'En livraison', color: 'bg-indigo-100 text-indigo-800' },
  DELIVERED: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
};

export const BOX_SIZES: Record<BoxSize, { name: string; weight: string; price: string }> = {
  SMALL: { name: 'Petit', weight: '3-4 kg', price: '25-35 TND' },
  MEDIUM: { name: 'Moyen', weight: '5-7 kg', price: '45-60 TND' },
  LARGE: { name: 'Grand', weight: '8-10 kg', price: '70-90 TND' },
  FAMILY: { name: 'Famille', weight: '12-15 kg', price: '100-130 TND' },
};

export const QUALITY_ISSUES: Record<QualityIssue, { label: string; labelAr: string }> = {
  DAMAGED: { label: 'Damaged produce', labelAr: 'منتج تالف' },
  NOT_FRESH: { label: 'Not fresh', labelAr: 'غير طازج' },
  WRONG_ITEM: { label: 'Wrong item', labelAr: 'منتج خاطئ' },
  MISSING_ITEM: { label: 'Missing item', labelAr: 'منتج مفقود' },
  QUANTITY_SHORT: { label: 'Quantity short', labelAr: 'كمية ناقصة' },
  TASTE_QUALITY: { label: 'Taste/quality issue', labelAr: 'مشكلة في الطعم/الجودة' },
  OTHER: { label: 'Other', labelAr: 'أخرى' },
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, { label: string; color: string }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  REVIEWING: { label: 'Under Review', color: 'bg-blue-100 text-blue-800' },
  RESOLVED: { label: 'Resolved', color: 'bg-green-100 text-green-800' },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800' },
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'Active', color: 'bg-green-100 text-green-800' },
  PAUSED: { label: 'Paused', color: 'bg-yellow-100 text-yellow-800' },
  CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800' },
};

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', labelFr: 'Dimanche' },
  { value: 1, label: 'Monday', labelFr: 'Lundi' },
  { value: 2, label: 'Tuesday', labelFr: 'Mardi' },
  { value: 3, label: 'Wednesday', labelFr: 'Mercredi' },
  { value: 4, label: 'Thursday', labelFr: 'Jeudi' },
  { value: 5, label: 'Friday', labelFr: 'Vendredi' },
  { value: 6, label: 'Saturday', labelFr: 'Samedi' },
];
