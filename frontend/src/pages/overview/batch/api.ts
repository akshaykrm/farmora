import type { Filter } from "@utils/filters";
import type { BatchOverviewResponse } from "./types";
import fetcherV2 from "@utils/fetcherV2";

const batchOverviewApi = {
  fetchOverview: (filter: Filter) => {
    const opts = {
      method: "GET" as const,
      filter: filter,
    };
    return fetcherV2<BatchOverviewResponse>("overview/batch", null, opts);
  },

  closeBatch: async (batchId: number, closingStatement?: string) => {
    return await fetcherV2(
      `batches/${batchId}/close`,
      JSON.stringify({
        status: "close",
        closing_statement: closingStatement || null,
      }),
      { method: "PUT" },
    );
  },
};

export default batchOverviewApi;
