import type { NameResponse } from "@app-types/gen.types";

export type SalesBookTransaction = {
  created_date: string;
  bird_no: number | null;
  weight: number | null;
  price: number | null;
  amount: number;
  type: "credit" | "cash";
  balance: number;
};

export type SalesBookTotals = {
  birds: number;
  weight: number;
  amount: number;
};

export type SalesBookSummary = {
  buyer: NameResponse;
  totals: SalesBookTotals;
  opening_balance: number;
  closing_balance: number;
};

export type SalesBookLedgerResponse = {
  summary: SalesBookSummary;
  count: number;
  totalPages: number;
  data: SalesBookTransaction[];
};

export type NewSalesBookEntryRequest = {
  date: string;
  buyer_id: number | null;
  amount: string;
  narration?: string;
};

export type SalesBookFilterRequest = {
  buyer_id: number | "";
  from_date: string;
  end_date: string;
};
