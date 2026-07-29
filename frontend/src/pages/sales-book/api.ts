import type {
  NewSalesBookEntryRequest,
  SalesBookLedgerResponse,
} from "./types";
import fetcher from "@utils/fetcher";
import fetcherV2 from "@utils/fetcherV2";
import type { Filter } from "@utils/filters";

const salesBookApi = {
  fetchAll: async (filter: Filter) => {
    const opts = {
      method: "GET" as const,
      filter: filter,
    };
    return await fetcherV2<SalesBookLedgerResponse>("sales/ledger", null, opts);
  },
  create: async (payload: NewSalesBookEntryRequest) =>
    await fetcher("sales/ledger", JSON.stringify(payload), { method: "POST" }),
};

export default salesBookApi;
