export type SetupItemKey =
  "profile" | "farm" | "season" | "batch" | "suppliers" | "customers" | "items";

export type SetupItems = Record<SetupItemKey, boolean>;

export type SetupProfile = {
  state: string;
  district: string;
  place: string;
  pincode: string;
  bird_capacity: string;
};

export type SetupVendorDefaults = {
  name: string;
  address: string;
  opening_balance: string;
};

export type SetupSystemItemType = "integration" | "working" | "general";

export type SetupExtraItemType =
  "chick" | "medicine" | "PRE STARTER" | "STARTER" | "FINISHER" | "regular";

export type SetupItemType = SetupSystemItemType | SetupExtraItemType;

export type SetupItemDefault = {
  name: string;
  type: SetupSystemItemType;
  base_price: number;
};

export type SetupSystemItem = SetupItemDefault & {
  id: number | null;
  exists: boolean;
};

export type SaveSetupItemsPayload = {
  system: SetupItemDefault[];
  extra: {
    name: string;
    type: SetupExtraItemType;
    base_price: number;
    vendor_id: number;
  }[];
};

export type SetupDefaults = {
  farm: { name: string; place: string; capacity: string };
  season: { name: string; from_date: string; to_date: string };
  batch: { name: string };
  supplier: SetupVendorDefaults;
  customer: SetupVendorDefaults;
  items: SetupItemDefault[];
};

export type SetupStatus = {
  items: SetupItems;
  completed: boolean;
  existing: {
    farm: { id: number; name: string } | null;
    season: { id: number; name: string } | null;
    supplier: { id: number; name: string } | null;
  };
  systemItems?: SetupSystemItem[];
  profile: SetupProfile;
  defaults: SetupDefaults;
};

export type SaveSetupItemsResult = {
  saved: { system: unknown[]; extra: unknown[] };
  status: SetupStatus;
};

export type GenerateDefaultsResult = {
  created: Partial<
    Record<
      "farm" | "season" | "batch" | "supplier" | "customer" | "items",
      unknown
    >
  >;
  status: SetupStatus;
};
