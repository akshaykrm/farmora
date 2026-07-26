import type { BatchListResponse, BatchFormValues } from "./types";
import type { ItemName } from "@pages/items/types";
import fetcher from "@utils/fetcher";
import fetcherV2, { type FetcherReturnType } from "@utils/fetcherV2";
import type { Filter } from "@utils/filters";

const batches = {
  fetchAll: (filter?: Filter) => {
    const opts = {
      method: "GET" as const,
      filter: filter,
    };
    return fetcherV2<BatchListResponse>("batches", null, opts);
  },
  getNames: () => fetcher("batches/names"),
  getBySeasonId: async (
    seasonId: number,
  ): Promise<FetcherReturnType<ItemName[]>> => {
    const res = await fetcherV2<ItemName[]>(
      "batches/names?season_id=" + seasonId,
    );
    return res;
  },
  fetchById: (id: number) => fetcherV2<BatchFormValues>(`batches/${id}`),
  create: async (payload: BatchFormValues) =>
    await fetcherV2("batches", JSON.stringify(payload), { method: "POST" }),
  updateById: async (id: number, updateData: BatchFormValues) => {
    const payload: BatchFormValues = {
      name: updateData.name,
      farm_id: updateData.farm_id,
      season_id: updateData.season_id,
      status: updateData.status,
    };
    return await fetcherV2(`batches/${id}`, JSON.stringify(payload), {
      method: "PUT",
    });
  },
};

export default batches;
