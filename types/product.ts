export interface Product {
  id: string;
  source_id: string;
  name_uz?: string;
  name_original: string;
  name_cn?: string;
  description_uz?: string;
  tagline?: string;
  features?: string[];
  category: string;
  price_cny: number;
  price_uzs?: number;
  images: string[];
  main_image?: string;
  stock_status: 'instock' | 'outofstock';
  rating?: number;
  moq: number;
  sales_30d?: number;
  location?: string;
  status: 'approved' | 'pending' | 'failed' | 'rasm_xatosi';
  last_synced_at?: string;
  is_hot?: boolean;
  discount?: number;
}

export interface Category {
  id: string;
  name_uz: string;
}

export interface Stats {
  total: number;
  approved: number;
  pending: number;
  failed: number;
  rasm_xatosi: number;
  outofstock: number;
  exchange_rate: number;
  markup: string;
}

export interface ValidationLog {
  id: number;
  product_id?: string;
  source_id: string;
  error_message: string;
  timestamp: string;
  name_uz?: string;
  name_original?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ProductsResponse {
  products: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Settings {
  EXCHANGE_RATE: string;
  MARKUP_PERCENTAGE: string;
}
