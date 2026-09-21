import type { Package } from "@app-types/package.types";
import type { ListResponse } from "@app-types/response.types";
import fetcher from "@utils/fetcher";
import fetcherV2 from "@utils/fetcherV2";
import type { NameResponse } from "@app-types/gen.types";

export type PackageFormValues = {
  name: string;
  description: string;
  actual_price: number;
  discount_price: number;
  duration: number;
  status: string;
  referral_bonus_type: "none" | "fixed" | "percentage";
  referral_bonus_value: number | null;
};

const packages = {
  getNames: async (): Promise<NameResponse[]> => {
    const data = await fetcher("packages/names");
    return data;
  },
  fetchAll: (filter?: { page?: number; limit?: number; name?: string }) =>
    fetcherV2<ListResponse<Package>>("packages", null, {
      method: "GET",
      filter,
    }),
  fetchById: (id: number) => fetcherV2<Package>(`packages/${id}`),
  create: (payload: PackageFormValues) =>
    fetcherV2<Package>("packages", JSON.stringify(payload), { method: "POST" }),
  updateById: (id: number, payload: PackageFormValues) =>
    fetcherV2(`packages/${id}`, JSON.stringify(payload), { method: "PUT" }),
  deleteById: (id: number) =>
    fetcherV2(`packages/${id}`, null, { method: "DELETE" }),
};

export default packages;
