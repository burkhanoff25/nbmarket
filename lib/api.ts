import axios from 'axios';
import { ProductsResponse, Product, Category, Stats, ValidationLog, Settings } from '@/types/product';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to handle Bearer Token if token exists in localStorage/cookie
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Fetch Stats
export async function getStats(): Promise<Stats> {
  const res = await api.get<Stats>('/stats');
  return res.data;
}

// Fetch Products list with filtering & pagination
export async function getProducts(params?: {
  category?: string;
  status?: string;
  search?: string;
  moq?: number;
  page?: number;
  limit?: number;
}): Promise<ProductsResponse> {
  const res = await api.get<ProductsResponse>('/products', { params });
  return res.data;
}

// Fetch Single Product detail
export async function getProductById(id: string): Promise<{ product: Product; logs: ValidationLog[] }> {
  const res = await api.get<{ product: Product; logs: ValidationLog[] }>(`/products/${id}`);
  return res.data;
}

// Fetch Categories
export async function getCategories(): Promise<Category[]> {
  const res = await api.get<Category[]>('/categories');
  return res.data;
}

// Update Product (Admin)
export async function updateProduct(id: string, data: Partial<Product>): Promise<{ success: boolean; product: Product; errors: string[] }> {
  const res = await api.put<{ success: boolean; product: Product; errors: string[] }>(`/products/${id}`, data);
  return res.data;
}

// Approve Product Manually
export async function approveProduct(id: string): Promise<{ success: boolean; message: string }> {
  const res = await api.post<{ success: boolean; message: string }>(`/products/${id}/approve`);
  return res.data;
}

// Fetch Global Validation Logs
export async function getValidationLogs(): Promise<ValidationLog[]> {
  const res = await api.get<ValidationLog[]>('/validation-logs');
  return res.data;
}

// Trigger Manual Sync
export async function triggerSync(): Promise<{ success: boolean; message: string; stats?: any }> {
  const res = await api.post<{ success: boolean; message: string; stats?: any }>('/sync');
  return res.data;
}

// Trigger Taobao Aggregator Sync
export async function triggerTaobaoSync(): Promise<{ success: boolean; message: string; stats?: any }> {
  const res = await api.post<{ success: boolean; message: string; stats?: any }>('/sync/taobao');
  return res.data;
}

// Get Settings
export async function getSettings(): Promise<Settings> {
  const res = await api.get<Settings>('/settings');
  return res.data;
}

// Save Settings
export async function saveSettings(settings: Partial<Settings>): Promise<{ success: boolean; message: string }> {
  const res = await api.post<{ success: boolean; message: string }>('/settings', settings);
  return res.data;
}
