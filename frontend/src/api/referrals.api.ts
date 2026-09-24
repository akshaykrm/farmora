import fetcherV2 from "@utils/fetcherV2";
import type { ListResponse } from "@app-types/response.types";

export type ReferralPartner = {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  code: string;
  status: "active" | "inactive";
  referral_bonus_type?: "none" | "fixed" | "percentage";
  referral_bonus_value?: number | null;
  companies_count?: number;
  total_earned?: number;
  total_paid?: number;
  balance?: number;
};

export type ReferralLedgerTxn = {
  id: number;
  type: string;
  amount: number | string;
  package_name?: string | null;
  remarks?: string | null;
  created_at: string;
  company?: { id: number; name: string; username: string } | null;
};

export type ReferralPartnerDetail = ReferralPartner & {
  companies: Array<{
    id: number;
    name: string;
    username: string;
    email: string | null;
    phone: string | null;
    status: number;
    current_package: { id: number; name: string; price: number } | null;
    valid_to: string | null;
  }>;
  ledger: ReferralLedgerTxn[];
};

export type ReferralPartnerForm = {
  name: string;
  phone: string;
  email: string;
  code: string;
  status: "active" | "inactive";
  referral_bonus_type: "none" | "fixed" | "percentage";
  referral_bonus_value: number | null;
};

const referralsApi = {
  fetchAll: (filter?: { page?: number; limit?: number; name?: string }) =>
    fetcherV2<ListResponse<ReferralPartner>>("referrals", null, {
      method: "GET",
      filter,
    }),
  fetchById: (id: number) =>
    fetcherV2<ReferralPartnerDetail>(`referrals/${id}`),
  create: (payload: ReferralPartnerForm) =>
    fetcherV2<ReferralPartner>("referrals", JSON.stringify(payload), {
      method: "POST",
    }),
  updateById: (id: number, payload: Partial<ReferralPartnerForm>) =>
    fetcherV2(`referrals/${id}`, JSON.stringify(payload), { method: "PUT" }),
  recordPayment: (id: number, payload: { amount: number; remarks?: string }) =>
    fetcherV2(`referrals/${id}/payments`, JSON.stringify(payload), {
      method: "POST",
    }),
  linkCompany: (id: number, user_id: number) =>
    fetcherV2(`referrals/${id}/link-company`, JSON.stringify({ user_id }), {
      method: "POST",
    }),
};

export default referralsApi;
