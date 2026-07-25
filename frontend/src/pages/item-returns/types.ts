import type { ListResponse } from "@app-types/response.types";

export type ItemReturn = {
  id: number;
  return_type: "vendor" | "batch";
  item_category_id: number;
  date: string;
  from_batch: number;
  to_batch: number | null;
  to_vendor: number | null;
  quantity: number;
  payment_type: "credit" | "paid";
  rate_per_bag: number;
  total_amount: number;
  status: "pending" | "completed" | "cancelled";
  category?: {
    id: number;
    name: string;
  };
  from_batch_data?: {
    id: number;
    name: string;
  };
  to_batch_data?: {
    id: number;
    name: string;
  };
  to_vendor_data?: {
    id: number;
    name: string;
  };
};

export type NewItemReturnRequest = {
  return_type: "vendor" | "batch";
  payment_type?: "credit" | "paid" | "";
  item_category_id: number;
  date: string;
  from_batch: number;
  to_batch: number | null;
  to_vendor: number | null;
  quantity: number;
  rate_per_bag: number;
  total_amount: number;
  status?: "pending" | "completed" | "cancelled";
};

export type ItemReturnFilterRequest = {
  return_type: string;
  item_category_id: number | "";
  from_batch: number | "";
  to_batch: number | "";
  to_vendor: number | "";
  status: string;
  start_date: string;
  end_date: string;
};

export type EditItemReturnRequest = Partial<NewItemReturnRequest> & {
  id: number;
};

export type EditItemReturnPayload = Omit<EditItemReturnRequest, "id">;

export type ItemReturnsListResponse = ListResponse<ItemReturn>;
