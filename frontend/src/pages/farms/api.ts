import fetcherV2 from "@utils/fetcherV2.ts";
import type { FarmFormValues, FarmsListResponse } from "./types.ts";
import fetcher from "@utils/fetcher";
import type { Filter } from "@utils/filters.ts";

const farms = {
  fetchAll: (filter?: Filter) => {
    const opts = {
      method: "GET" as const,
      filter: filter,
    };
    return fetcherV2<FarmsListResponse>("farms", null, opts);
  },
  getNames: () => fetcher("farms/names"),
  fetchById: (id: number) => fetcherV2<FarmFormValues>(`farms/${id}`),
  create: async (payload: FarmFormValues) =>
    await fetcherV2("farms", JSON.stringify(payload), { method: "POST" }),
  updateById: async (id: number, updatedData: FarmFormValues) => {
    const payload: FarmFormValues = {
      capacity: updatedData.capacity,
      place: updatedData.place,
      name: updatedData.name,
    };
    return await fetcherV2(`farms/${id}`, JSON.stringify(payload), {
      method: "PUT",
    });
  },
};

export default farms;
