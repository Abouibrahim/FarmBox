import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
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

// Orders API
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

export default api;
