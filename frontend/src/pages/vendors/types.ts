import type { ListResponse } from "@app-types/response.types";
import type { NameResponse } from "@app-types/gen.types";
import type { ValidationError } from "@errors/api.error";

export type VendorType = "supplier" | "customer";

export type VendorNamesFilter = { type: "supplier" | "customer" };
export type Vendor = {
  id: number;
  name: string;
  status: number;
  address: string;
  opening_balance: string;
  vendor_type: VendorType;
};

export type VendorDetail = Vendor;

export type VendorName = NameResponse & { vendor_type: VendorType };

export type VendorFormValues = {
  name: string;
  address: string;
  opening_balance: string;
  vendor_type: VendorType;
};

export type EditVendorFormValues = VendorFormValues & { id: number };

export type VendorsListResponse = ListResponse<Vendor>;

type UseVendorReturn = {
  onSubmit: (inputData: VendorFormValues) => void;
  errors: ValidationError[];
  clearError: () => void;
};

export type UseEditVendor = (
  selectedId: number | null,
  opts: {
    onSuccess: () => void;
  },
) => UseVendorReturn;
