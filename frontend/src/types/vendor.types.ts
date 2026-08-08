import type { NameResponse } from "./gen.types";

export type Vendor = {
  id: number;
  name: string;
  status: number;
  address: string;
  opening_balance: string;
  vendor_type: string;
};

export type VendorName = NameResponse & {
  vendor_type: "customer" | "supplier" | "internal";
};

export type NewVendorRequest = {
  name: string;
  address: string;
  opening_balance: string;
  vendor_type: string;
};

export type EditVendorRequest = Partial<NewVendorRequest> & { id: number };

export type EditVendorPayload = Omit<EditVendorRequest, "id">;
