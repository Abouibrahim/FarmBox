import axios from 'axios';

// Always use relative /api path - this gets proxied to the backend
// This works both in development and production, and avoids CORS issues
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { email: string; password: string; name: string; phone?: string }) =>
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/password', data),
};

// Farms API
export const farmsApi = {
  getAll: (params?: { zone?: string; search?: string; limit?: number; offset?: number }) =>
    api.get('/farms', { params }),
  getBySlug: (slug: string) => api.get(`/farms/${slug}`),
  create: (data: any) => api.post('/farms', data),
  update: (id: string, data: any) => api.put(`/farms/${id}`, data),
  getMyFarm: () => api.get('/farms/me/farm'),
  getStats: () => api.get('/farms/me/stats'),
};

// Products API
export const productsApi = {
  getAll: (params?: { farmId?: string; category?: string; available?: string; search?: string }) =>
    api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
  toggle: (id: string) => api.patch(`/products/${id}/toggle`),
  getMyProducts: () => api.get('/products/me/products'),
};

// Product Discovery API (Product-First Experience)
export const productDiscoveryApi = {
  getFeatured: (limit?: number) => api.get('/products/featured', { params: { limit } }),
  getPopular: (params?: { limit?: number; category?: string }) =>
    api.get('/products/popular', { params }),
  getSeasonal: (params?: { limit?: number; category?: string }) =>
    api.get('/products/seasonal', { params }),
  search: (params: {
    q?: string;
    category?: string;
    priceMin?: number;
    priceMax?: number;
    farmId?: string;
    sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'popularity';
    limit?: number;
    offset?: number;
  }) => api.get('/products/search', { params }),
  getByCategory: (slug: string, params?: {
    sort?: string;
    limit?: number;
    offset?: number;
    priceMin?: number;
    priceMax?: number;
    farmId?: string;
  }) => api.get(`/products/category/${slug}`, { params }),
  getByFarm: (farmId: string, params?: { excludeId?: string; limit?: number }) =>
    api.get(`/products/farm/${farmId}`, { params }),
  getSimilar: (id: string, limit?: number) =>
    api.get(`/products/${id}/similar`, { params: { limit } }),
  recordView: (id: string) => api.post(`/products/${id}/view`),
  recordCartAdd: (id: string) => api.post(`/products/${id}/cart-add`),
};

// Orders API (Legacy - single farm orders)
export const ordersApi = {
  create: (data: any) => api.post('/orders', data),
  getMyOrders: (params?: { status?: string; limit?: number; offset?: number }) =>
    api.get('/orders/my-orders', { params }),
  getById: (id: string) => api.get(`/orders/${id}`),
  cancel: (id: string, reason?: string) => api.post(`/orders/${id}/cancel`, { reason }),
  getFarmOrders: (params?: { status?: string; date?: string }) =>
    api.get('/orders/farm/orders', { params }),
  updateStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),
  getDeliverySchedule: () => api.get('/orders/delivery-schedule'),
};

// Unified Orders API (Multi-farm orders)
export const unifiedOrdersApi = {
  create: (data: {
    items: Array<{ productId: string; quantity: number }>;
    deliveryType: 'DELIVERY' | 'PICKUP';
    deliveryDate: string;
    deliveryWindow?: string;
    deliveryAddress?: string;
    deliveryZone?: string;
    customerNotes?: string;
    creditsToUse?: number;
  }) => api.post('/orders/unified', data),
  getMyOrders: (params?: { status?: string; limit?: number; offset?: number }) =>
    api.get('/orders/unified/my', { params }),
  getById: (id: string) => api.get(`/orders/unified/${id}`),
  getByNumber: (orderNumber: string) => api.get(`/orders/unified/number/${orderNumber}`),
  cancel: (id: string, reason?: string) => api.patch(`/orders/unified/${id}/cancel`, { reason }),
};

// Subscriptions API
export const subscriptionsApi = {
  getMySubscriptions: () => api.get('/subscriptions/my'),
  getById: (id: string) => api.get(`/subscriptions/${id}`),
  create: (data: {
    farmId: string;
    boxSize: string;
    frequency: string;
    deliveryDay: number;
    deliveryAddress: string;
    deliveryZone: string;
    preferences?: string;
  }) => api.post('/subscriptions', data),
  update: (id: string, data: any) => api.patch(`/subscriptions/${id}`, data),
  cancel: (id: string, reason?: string) => api.delete(`/subscriptions/${id}`, { data: { reason } }),
  pause: (id: string, data: { weeks: number; reason?: string }) =>
    api.post(`/subscriptions/${id}/pause`, data),
  resume: (id: string) => api.delete(`/subscriptions/${id}/pause`),
  skip: (id: string, data: { date: string; reason?: string }) =>
    api.post(`/subscriptions/${id}/skip`, data),
  unskip: (id: string, date: string) => api.delete(`/subscriptions/${id}/skip/${date}`),
};

// Trial Boxes API
export const trialApi = {
  getAvailableFarms: (zone?: string) => api.get('/trial-boxes/available-farms', { params: { zone } }),
  checkAvailability: (farmId: string) => api.get(`/trial-boxes/check/${farmId}`),
  create: (data: { farmId: string; boxSize: string }) => api.post('/trial-boxes', data),
  getMyTrialBoxes: () => api.get('/trial-boxes/my'),
  getById: (id: string) => api.get(`/trial-boxes/${id}`),
  convertToSubscription: (id: string, data: {
    frequency: string;
    deliveryDay: number;
    deliveryAddress: string;
    deliveryZone: string;
    preferences?: string;
  }) => api.post(`/trial-boxes/${id}/convert`, data),
};

// Quality & Credits API
export const qualityApi = {
  createReport: (data: {
    orderId: string;
    productId?: string;
    issueType: string;
    description: string;
    photoUrls?: string[];
  }) => api.post('/quality/reports', data),
  getMyReports: () => api.get('/quality/reports/my'),
  getReportById: (id: string) => api.get(`/quality/reports/${id}`),
  getMyCredits: () => api.get('/quality/credits/my'),
  getCreditHistory: () => api.get('/quality/credits/history'),
  submitSurvey: (data: {
    orderId: string;
    overallRating: number;
    freshnessRating: number;
    deliveryRating: number;
    packagingRating: number;
    wouldRecommend: boolean;
    feedback?: string;
  }) => api.post('/quality/surveys', data),
  getMySurveys: () => api.get('/quality/surveys/my'),
  getOrdersPendingSurvey: () => api.get('/quality/surveys/pending'),
};

// Notifications API
export const notificationsApi = {
  getAll: (params?: { limit?: number; offset?: number }) =>
    api.get('/notifications', { params }),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data: any) => api.patch('/notifications/preferences', data),
};

// Category Subscriptions API (Multi-farm category boxes)
export const categorySubscriptionsApi = {
  getCategories: () => api.get('/category-subscriptions/categories'),
  create: (data: {
    category: string;
    boxSize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'FAMILY';
    frequency: 'WEEKLY' | 'BIWEEKLY';
    deliveryDay: number;
    deliveryAddress: string;
    deliveryZone: string;
    preferences?: {
      excludeItems?: string[];
      preferredFarms?: string[];
      notes?: string;
    };
    maxFarmsPerBox?: number;
    startDate?: string;
  }) => api.post('/category-subscriptions', data),
  getMy: () => api.get('/category-subscriptions/my'),
  getById: (id: string) => api.get(`/category-subscriptions/${id}`),
  update: (id: string, data: any) => api.patch(`/category-subscriptions/${id}`, data),
  cancel: (id: string, reason?: string) =>
    api.delete(`/category-subscriptions/${id}`, { data: { reason } }),
  pause: (id: string, data: { startDate: string; endDate: string; reason?: string }) =>
    api.post(`/category-subscriptions/${id}/pause`, data),
  resume: (id: string) => api.delete(`/category-subscriptions/${id}/pause`),
  skip: (id: string, data: { skipDate: string; reason?: string }) =>
    api.post(`/category-subscriptions/${id}/skip`, data),
  unskip: (id: string, date: string) =>
    api.delete(`/category-subscriptions/${id}/skip/${date}`),
  previewNextBox: (id: string) => api.get(`/category-subscriptions/${id}/preview`),
};

export default api;
