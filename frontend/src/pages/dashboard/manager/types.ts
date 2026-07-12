export interface MetricData {
  label: string;
  value: number;
  trend: number;
  color: "blue" | "amber" | "emerald" | "rose";
  unit?: string;
}

export interface ManagerDashboardData {
  metrics: MetricData[];
  balanceInHand: number;
  totalCredited: number;
  totalDebited: number;
}
