import type { BatchOverviewSummary } from "../batch/types";

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
};

export type Totals = {
  total_avg_weight: number;
  fcr: number;
  cfcr: number;
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
  overviewCalculations: BatchOverviewSummary;
};

export type SeasonOverviewSlot<T> = {
  totalPages: number;
  count: number;
  data: T[];
};

export type SeasonOverviewFilterRequest = {
  season_id: number | null;
};

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
