import fetcherV2 from "@utils/fetcherV2";
import type { SeasonListResponse, SeasonFormValues } from "./types";
import fetcher from "@utils/fetcher";
import type { Filter } from "@utils/filters";

const seasons = {
  fetchAll: (filter?: Filter) => {
    const opts = {
      method: "GET" as const,
      filter: filter,
    };
    return fetcherV2<SeasonListResponse>("seasons", null, opts);
  },
  getNames: () => {
    return fetcher("seasons/names");
  },
  fetchById: (id: number) => fetcherV2<SeasonFormValues>(`seasons/${id}`),
  create: async (payload: SeasonFormValues) =>
    await fetcherV2("seasons", JSON.stringify(payload), { method: "POST" }),
  updateById: async (id: number, updateData: SeasonFormValues) => {
    const payload: SeasonFormValues = {
      name: updateData.name,
      to_date: updateData.to_date,
      from_date: updateData.from_date,
      status: updateData.status,
    };
    return await fetcherV2(`seasons/${id}`, JSON.stringify(payload), {
      method: "PUT",
    });
  },
};

export default seasons;
