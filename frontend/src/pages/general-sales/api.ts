import fetcher from "@utils/fetcher";
import fetcherV2 from "@utils/fetcherV2";
import type { Filter } from "@utils/filters";
import type {
  GeneralSalesFormValues,
  GeneralSalesListResponse,
  GeneralSalesRecord,
} from "./types";

const generalSalesApi = {
  fetchAll: (filter: Filter) => {
    const opts = {
      method: "GET" as const,
      filter: filter,
    };
    return fetcherV2<GeneralSalesListResponse>("general-sales", null, opts);
  },
  fetchById: async (id: number) =>
    fetcherV2<GeneralSalesRecord>(`general-sales/${id}`),
  create: async (payload: GeneralSalesFormValues) =>
    await fetcherV2("general-sales", JSON.stringify(payload), {
      method: "POST",
    }),
  updateById: async (id: number, updateData: GeneralSalesFormValues) => {
    return await fetcherV2(`general-sales/${id}`, JSON.stringify(updateData), {
      method: "PUT",
    });
  },
  deleteById: async (id: number) =>
    await fetcher(`general-sales/${id}`, null, { method: "DELETE" }),
};

export default generalSalesApi;
