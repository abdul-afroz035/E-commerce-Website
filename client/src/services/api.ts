import axios from 'axios';
import { Product, Category, CartItem, CartSummary, Order, Address, User } from '../types';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('zapkart_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User; message: string }>('/auth/login', { email, password });
    return res.data;
  },
  register: async (name: string, email: string, password: string, phone?: string) => {
    const res = await api.post<{ token: string; user: User; message: string }>('/auth/register', { name, email, password, phone });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<{ user: User }>('/auth/me');
    return res.data;
  },
};

export const productApi = {
  getProducts: async (params?: Record<string, any>) => {
    const res = await api.get<{ products: Product[]; pagination: any; cached: boolean }>('/products', { params });
    return res.data;
  },
  getProductByIdOrSlug: async (idOrSlug: string | number) => {
    const res = await api.get<{ product: Product; cached: boolean }>(`/products/${idOrSlug}`);
    return res.data;
  },
};

export const categoryApi = {
  getCategories: async () => {
    const res = await api.get<{ categories: Category[]; cached: boolean }>('/categories');
    return res.data;
  },
};

export const dealApi = {
  getFeaturedDeals: async () => {
    const res = await api.get<{ deals: Product[]; cached: boolean }>('/deals/featured');
    return res.data;
  },
};

export const searchApi = {
  getSuggestions: async (q: string) => {
    const res = await api.get<{ suggestions: string[]; cached: boolean }>('/search/suggestions', { params: { q } });
    return res.data;
  },
};

export const cartApi = {
  getCart: async () => {
    const res = await api.get<{ items: CartItem[]; summary: CartSummary }>('/cart');
    return res.data;
  },
  addToCart: async (productId: number, quantity: number = 1) => {
    const res = await api.post('/cart/add', { productId, quantity });
    return res.data;
  },
  updateQuantity: async (productId: number, quantity: number) => {
    const res = await api.put('/cart/update', { productId, quantity });
    return res.data;
  },
  removeItem: async (productId: number) => {
    const res = await api.delete(`/cart/${productId}`);
    return res.data;
  },
};

export const wishlistApi = {
  getWishlist: async () => {
    const res = await api.get<{ items: Product[] }>('/wishlist');
    return res.data;
  },
  toggleWishlist: async (productId: number) => {
    const res = await api.post<{ message: string; inWishlist: boolean }>('/wishlist/toggle', { productId });
    return res.data;
  },
};

export const addressApi = {
  getAddresses: async () => {
    const res = await api.get<{ addresses: Address[] }>('/addresses');
    return res.data;
  },
  addAddress: async (address: Partial<Address>) => {
    const res = await api.post<{ address: Address; message: string }>('/addresses', address);
    return res.data;
  },
};

export const orderApi = {
  createOrder: async (data: { addressId: number; paymentMethod: string; items?: any[] }) => {
    const res = await api.post<{ message: string; order: Order }>('/orders/create', data);
    return res.data;
  },
  getOrders: async () => {
    const res = await api.get<{ orders: Order[] }>('/orders');
    return res.data;
  },
  getOrderDetails: async (orderNumber: string) => {
    const res = await api.get<{ order: Order }>(`/orders/${orderNumber}`);
    return res.data;
  },
  cancelOrder: async (orderNumber: string, reason: string) => {
    const res = await api.post<{ message: string; order: Order }>(`/orders/${orderNumber}/cancel`, { reason });
    return res.data;
  },
  updateOrderStatus: async (orderNumber: string, status: string) => {
    const res = await api.put<{ message: string; order: Order }>(`/orders/${orderNumber}/status`, { status });
    return res.data;
  },
};

export default api;
