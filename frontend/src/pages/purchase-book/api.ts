import type { Filter } from "@utils/filters";
import type { PurchaseBookLedgerResponse } from "./types";
import fetcherV2 from "@utils/fetcherV2";

const purchaseBookApi = {
  fetchAll: (filter: Filter) => {
    const opts = {
      method: "GET" as const,
      filter: filter,
    };
    return fetcherV2<PurchaseBookLedgerResponse>(
      "items/purchase-book",
      null,
      opts,
    );
  },
};

export default purchaseBookApi;
