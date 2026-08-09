import type { NameResponse } from "@app-types/gen.types";
import type { ListResponse } from "@app-types/response.types";
import type { ValidationError } from "@errors/api.error";

export type Item = {
  id: number;
  name: string | null;
  brand?: {
    id: number;
    name: string;
  } | null;
  base_price: number;
  vendor: {
    id: number;
    name: string;
  };
  type: "integration" | "working" | "regular";
};

export type ItemListResponse = ListResponse<Item>;

export type ItemFormValues = {
  name?: string | null;
  brand_id: number | "" | null;
  vendor_id: number | "";
  base_price: number | "";
  type: "integration" | "working" | "regular" | "";
};

export type ItemName = NameResponse & {
  id: number;
  type: "integration" | "working" | "regular";
  base_price?: number;
};

type UseItemReturn = {
  onSubmit: (inputData: ItemFormValues) => void;
  errors: ValidationError[];
  clearError: () => void;
};

type Opts = {
  onSuccess: () => void;
};

export type UseAddItem = (opts: Opts) => UseItemReturn;

export type UseEditItem = (
  selectedId: number | null,
  opts: Opts,
) => UseItemReturn;
