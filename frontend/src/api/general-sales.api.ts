import type {
  GeneralSalesListResponse,
  NewGeneralSalesRequest,
  EditGeneralSalesRequest,
  EditGeneralSalesPayload,
  GeneralSalesRecord,
} from "@app-types/general-sales.types";
import fetcher from "@utils/fetcher";
import fetcherV2 from "@utils/fetcherV2";
import type { Filter } from "@utils/filters";

const generalSales = {
  fetchAll: (filter: Filter) => {
    const opts = {
      method: "GET" as const,
      filter: filter,
    };
    return fetcherV2<GeneralSalesListResponse>("general-sales", null, opts);
  },
  fetchById: (id: number): Promise<GeneralSalesRecord> =>
    fetcher(`general-sales/${id}`),
  create: async (payload: NewGeneralSalesRequest) =>
    await fetcher("general-sales", JSON.stringify(payload), { method: "POST" }),
  updateById: async (id: number, updateData: EditGeneralSalesRequest) => {
    const payload: EditGeneralSalesPayload = {
      season_id: updateData.season_id,
      purpose: updateData.purpose,
      amount: updateData.amount,
      narration: updateData.narration,
    };
    return await fetcher(`general-sales/${id}`, JSON.stringify(payload), {
      method: "PUT",
    });
  },
  deleteById: async (id: number) =>
    await fetcher(`general-sales/${id}`, null, { method: "DELETE" }),
};

export default generalSales;
