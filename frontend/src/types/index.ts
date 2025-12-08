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
