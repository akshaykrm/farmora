import fetcherV2 from "@utils/fetcherV2";
import type { Filter } from "@utils/filters";
import type { SeasonOverviewResponse } from "./types";

const seasonOverview = {
  fetchOverview: (filter: Filter) => {
    const opts = {
      method: "GET" as const,
      filter: filter,
    };
    return fetcherV2<SeasonOverviewResponse>("overview/season", null, opts);
  },
  closeSeason: async (seasonId: number) => {
    return await fetcherV2(
      `seasons/${seasonId}/close`,
      JSON.stringify({
        status: "close",
      }),
      { method: "PUT" },
    );
  },
};

export default seasonOverview;
