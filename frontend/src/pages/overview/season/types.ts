import type { OverviewCalculculation } from "@app-types/batch-overview.types";

export type GeneralCostItem = {
  id: number;
  date: string;
  purpose: string;
  amount: number;
};

export type GeneralSaleItem = {
  id: number;
  date: string;
  purpose: string;
  amount: number;
};

type SeasonOverviewSummary = {
  total_batch_profit: number;
  total_general_cost: number;
  total_general_sales: number;
  investor_profit: number;
  net_season_profit: number;
};

export type Totals = {
  total_avg_weight: number;
  fcr: number;
  cfcr: number;
  bird_shortage: number;
  shortage_percentage: number;
  avg_cost: number;
  avg_rate: number;
  profit_loss_percentage: number;
  profit: number;
};

export type BatchOverviewItem = {
  batch: {
    id: number;
    name: string;
    closed_on: string;
  };
  overviewCalculations: OverviewCalculculation;
};

export type SeasonOverviewSlot<T> = {
  totalPages: number;
  count: number;
  data: T[];
};

export type SeasonOverviewFilterRequest = {
  season_id: number | null;
  gc_purpose?: string;
  gs_purpose?: string;
  b_search?: string;
  b_close_from?: string;
  b_close_to?: string;
};

export type BatchSortKey =
  | "name"
  | "closed_on"
  | "avg_weight"
  | "fcr"
  | "cfcr"
  | "bird_shortage"
  | "shortage_percentage"
  | "avg_cost"
  | "avg_rate"
  | "diff"
  | "profit";

export type SortOrder = "asc" | "desc";

export type SeasonOverviewResponse = {
  season: {
    id: number;
    name: string;
    closed_on: string | null;
  } | null;
  totals: Totals;
  batches: SeasonOverviewSlot<BatchOverviewItem>;
  general_costs: SeasonOverviewSlot<GeneralCostItem>;
  general_sales: SeasonOverviewSlot<GeneralSaleItem>;
  summary: SeasonOverviewSummary | null;
};

export const BATCH_METRIC_FILTERS: { key: string; label: string }[] = [
  { key: "avg_weight", label: "Avg Weight" },
  { key: "fcr", label: "FCR" },
  { key: "cfcr", label: "CFCR" },
  { key: "bird_shortage", label: "Bird Shortage" },
  { key: "shortage_percentage", label: "Shortage %" },
  { key: "avg_cost", label: "Avg Cost" },
  { key: "avg_rate", label: "Avg Rate" },
  { key: "diff", label: "Profit - Loss Diff" },
  { key: "profit", label: "Profit/Loss" },
];
