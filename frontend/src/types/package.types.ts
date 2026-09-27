export type Package = {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  status: string;
  referral_bonus_type?: "none" | "fixed" | "percentage";
  referral_bonus_value?: number | null;
  role_id?: number | null;
  role?: {
    id: number;
    name: string;
    description?: string;
    kind?: string;
  } | null;
};

export type PackageName = {
  id: number;
  name: string;
};
