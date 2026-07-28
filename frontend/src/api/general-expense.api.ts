import type {
  GeneralExpenseListResponse,
  GeneralExpenseRecord,
  GeneralExpanceFormValues,
} from "@app-types/general-expense.types";
import fetcher from "@utils/fetcher";
import fetcherV2 from "@utils/fetcherV2";
import type { Filter } from "@utils/filters";

const generalExpense = {
  fetchAll: (filter: Filter) => {
    const opts = {
      method: "GET" as const,
      filter: filter,
    };
    return fetcherV2<GeneralExpenseListResponse>(
      "general-expenses",
      null,
      opts,
    );
  },
  fetchById: (id: number) =>
    fetcherV2<GeneralExpenseRecord>(`general-expenses/${id}`),
  create: async (payload: GeneralExpanceFormValues) =>
    await fetcherV2("general-expenses", JSON.stringify(payload), {
      method: "POST",
    }),
  updateById: async (id: number, updateData: GeneralExpanceFormValues) => {
    const payload: GeneralExpanceFormValues = {
      season_id: updateData.season_id,
      purpose: updateData.purpose,
      amount: updateData.amount,
      date: updateData.date,
      narration: updateData.narration,
    };
    return await fetcherV2<GeneralExpanceFormValues>(
      `general-expenses/${id}`,
      JSON.stringify(payload),
      {
        method: "PUT",
      },
    );
  },
  deleteById: async (id: number) =>
    await fetcher(`general-expenses/${id}`, null, { method: "DELETE" }),
};

export default generalExpense;
