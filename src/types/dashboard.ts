export interface Store {
  id: string;
  name: string;
  region: string;
  revenue: number;
  orders: number;
  avgOrderValue: number;
  topSku: string;
  revenueShare: number; // percentage of total revenue
  cumulativeShare: number; // cumulative percentage for Pareto
}

export interface SKU {
  id: string;
  name: string;
  category: string;
  price: number;
  totalSales: number;
  totalRevenue: number;
  storeCount: number; // how many stores sell this SKU
  revenueShare: number;
  cumulativeShare: number;
}

export interface StoreSkuData {
  storeId: string;
  storeName: string;
  skuId: string;
  skuName: string;
  quantity: number;
  revenue: number;
}

export interface DashboardStats {
  totalStores: number;
  totalSkus: number;
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  top20StoresRevenueShare: number; // what % of revenue comes from top 20% stores
  top20SkusRevenueShare: number; // what % of revenue comes from top 20% SKUs
}

export interface Insight {
  id: string;
  type: 'warning' | 'opportunity' | 'info';
  title: string;
  description: string;
  metric?: string;
}

export interface CategoryBreakdown {
  category: string;
  revenue: number;
  percentage: number;
  skuCount: number;
}

export interface TrendData {
  date: string;
  revenue: number;
  orders: number;
}
