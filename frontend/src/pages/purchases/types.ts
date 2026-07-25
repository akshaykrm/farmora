import type { ValidationError } from "@errors/api.error";

export type Purchase = {
  id: number;
  name: string;
  category: {
    id: number;
    name: string;
    type: string;
  };
  invoice_number: string;
  invoice_date: string;
  vendor: {
    id: number;
    name: string;
  };
  total_price: number;
  discount_price: number;
  net_amount: number;
  quantity: number;
  price_per_unit: number;
  batch_id: number;
  status: string;
  payment_type: "credit" | "paid";
  type: "integration" | "working" | null;
};

export type NewPurchaseRequest = {
  total_price: number;
  net_amount: number;
  invoice_number: string;
  invoice_date: string;
  quantity: number;
  vendor_id: number | null;
  season_id: number | null;
  discount_price: number;
  price_per_unit: number;
  category_id: number | null;
  batch_id: number | null;
  assign_quantity: number;
  payment_type: "credit" | "paid" | null;
};

export type PurchaseFilterRequest = {
  page: number;
  limit: number;
  vendor_id?: number | "";
  category_id?: number | "";
  batch_id?: number | "";
  start_date?: string;
  end_date?: string;
};

export type PurchaseFilter = {
  vendor_id?: number | "";
  category_id?: number | "";
  batch_id?: number | "";
  start_date?: string;
  end_date?: string;
};

export type EditPurchaseRequest = Partial<NewPurchaseRequest> & {
  id: null;
};

export type EditPurchasePayload = Omit<EditPurchaseRequest, "id">;

export type PurchaseFormValues = {
  total_price: string;
  net_amount: number | "";
  invoice_number: string;
  invoice_date: string;
  quantity: string;
  vendor_id: number | null;
  season_id: number | null;
  discount_price: string;
  price_per_unit: string;
  category_id: number | null;
  batch_id: number | null;
  assign_quantity: number | "";
  payment_type: "credit" | "paid" | null;
};

type UsePurchaseReturn = {
  onSubmit: (inputData: PurchaseFormValues) => void;
  errors: ValidationError[];
  clearError: () => void;
};

type Opts = {
  onSuccess: () => void;
};

export type UseAddPurchase = (opts: Opts) => UsePurchaseReturn;

export type UseEditPurchase = (
  selectedId: number | null,
  opts: Opts,
) => UsePurchaseReturn;
