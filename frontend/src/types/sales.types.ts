import type { BatchName } from "@pages/batches/types";
import type { SeasonName } from "./season.types";
import type { VendorName } from "./vendor.types";

export type Sale = {
  id: number;
  season: SeasonName;
  batch: BatchName;
  date: string;
  buyer: VendorName;
  vehicle_no: string;
  weight: number;
  bird_no: number;
  avg_weight: number;
  payment_type: "credit" | "cash";
  price: number;
  amount: number;
  narration: string;
  status: string;
};

export type NewSaleRequest = {
  season_id: number | null;
  batch_id: number | null;
  date: string;
  buyer_id: number | null;
  vehicle_no: string;
  weight: number;
  bird_no: number;
  payment_type: "credit" | "cash" | null;
  price: number;
  narration: string;
};

export type SaleFilterRequest = {
  season_id: number | null;
  batch_id: number | null;
  buyer_id: number | null;
  payment_type: string;
  start_date: string;
  end_date: string;
};

export type EditSaleRequest = Partial<NewSaleRequest> & {
  id: number;
};

export type EditSalePayload = Omit<EditSaleRequest, "id">;
