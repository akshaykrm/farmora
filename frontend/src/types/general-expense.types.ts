import type { Season } from "./season.types";

export type GeneralExpenseRecord = {
  id: number;
  season_id: number;
  master_id: number;
  purpose: string;
  date: string;
  amount: number;
  narration: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
  season?: Season;
};

export type GeneralExpenseFilterRequest = {
  season_id: number | null;
  start_date: string;
  purpose: string;
  end_date: string;
};

export type GeneralExpenseListResponse = {
  data: GeneralExpenseRecord[];
  totalPages: number;
  limit: number;
  totalAmount: number;
};

export type GeneralExpanceFormValues = {
  season_id: number | "";
  purpose: string;
  amount: string;
  date: string;
  narration?: string;
};
export type NewGeneralExpenseRequest = {
  season_id: number | null;
  purpose: string;
  amount: number | string;
  narration?: string | null;
};

export type EditGeneralExpenseRequest = {
  id: number;
  season_id: number | null;
  purpose: string;
  amount: number | string;
  narration?: string | null;
};

export type EditGeneralExpensePayload = Omit<EditGeneralExpenseRequest, "id">;
