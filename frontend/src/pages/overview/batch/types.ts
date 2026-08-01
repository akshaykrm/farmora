import type { NameResponse } from "@app-types/gen.types";

export type BatchOverviewFilterRequest = {
  season_id: number | "";
  batch_id: number | "";
};

export type BatchOverviewExpense = {
  date: string;
  return_type: "batch";
  purpose: string;
  quantity: number;
  price_per_unit: number;
  net_amount: number;
  category: {
    id: number;
    type: string;
  };
};

export type BatchOverviewSale = {
  date: string;
  vehicle_no: string;
  weight: number | null;
  bird_no: number | null;
  avg_weight: number | null;
  price: number | null;
  amount: number;
};

export type BatchOverviewReturn = {
  date: string;
  purpose: string;
  quantity: number;
  rate_per_bag: number;
  total_amount: number;
  return_type: string;
  to_batch_data: NameResponse;
  category: {
    id: number;
    type: string;
  };
  vendor: {
    id: number;
    name: string;
  };
};

export type BatchOverviewBatch = {
  id: number;
  name: string;
  status: "active" | "inactive" | "closed";
  closed_on: string;
  closing_statement: string | null;
  season: {
    id: number;
    name: string;
  } | null;
};

export type BatchOverviewSummary = {
  total_purchase_feeds: number;
  total_purchase_amount: number;
  total_returned_feeds: number;
  total_returned_amount: number;
  total_sale_weight: number;
  total_sale_birds: number;
  total_sale_amount: number;
  avg_weight: number;
  total_expense: number;
  fcr: number;
  cfcr: number;
};

export type BatchOverviewSlot<T> = {
  totalPages: number;
  count: number;
  data: T[];
};

export type BatchOverviewResponse = {
  expenses: BatchOverviewSlot<BatchOverviewExpense>;
  sales: BatchOverviewSlot<BatchOverviewSale>;
  returns: BatchOverviewSlot<BatchOverviewReturn>;
  overviewCalculations: BatchOverviewSummary;
  batch?: BatchOverviewBatch;
};

export type ExpenseTotals = {
  readonly quantity: number;
  readonly amount: number;
};

export type SalesTotals = {
  readonly weight: number;
  readonly birds: number;
  readonly amount: number;
};
