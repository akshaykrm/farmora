export interface MetricData {
  label: string;
  value: number;
  trend: number;
  color: "blue" | "amber" | "emerald" | "rose";
}

export interface ManagerDashboardData {
  metrics: MetricData[];
  balanceInHand: number;
  totalCredited: number;
  totalDebited: number;
}
