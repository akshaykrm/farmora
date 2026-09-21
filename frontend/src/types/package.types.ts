export type Package = {
  id: number;
  name: string;
  description: string;
  actual_price: number;
  discount_price: number;
  price?: number;
  duration: number;
  status: string;
  referral_bonus_type?: "none" | "fixed" | "percentage";
  referral_bonus_value?: number | null;
};

export type PackageName = {
  id: number;
  name: string;
};
