export interface MetricData {
  label: string;
  value: number;
  trend: number;
  color: "blue" | "amber" | "emerald" | "rose";
  unit?: string;
  subtitle?: string;
  decimals?: number;
}

export interface RecentPurchase {
  id: number;
  invoice_number: string;
  invoice_date: string;
  amount: string;
  supplier_name: string;
  type: string;
  quantity: number;
}

export interface RecentSale {
  id: number;
  date: string;
  batch: string;
  buyer: string;
  weight: string;
  birds: number;
  amount: string;
  payment_type: string;
}

export interface ManagerDashboardData {
  metrics: MetricData[];
  balanceInHand: number;
  customerBalance: number;
  supplierBalance: number;
  totalCredited: number;
  totalDebited: number;
  recentPurchases: RecentPurchase[];
  recentSales: RecentSale[];
}

// Admin Dashboard Types
export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  activeBatches: number;
  totalItems: number;
}

export interface SalesChartData {
  name: string;
  sales: number;
  expenses: number;
  profit: number;
}

export interface ItemDistributionData {
  name: string;
  value: number;
}

export interface BatchStatusData {
  name: string;
  value: number;
}

export interface RecentActivityData {
  id: number;
  activity: string;
  time: string;
  value: string;
}

export interface StockLevelData {
  name: string;
  current: number;
  target: number;
}

export interface AdminDashboardData {
  stats: AdminStats;
  salesData: SalesChartData[];
  itemDistribution: ItemDistributionData[];
  batchStatus: BatchStatusData[];
  recentActivity: RecentActivityData[];
  stockLevels: StockLevelData[];
}
