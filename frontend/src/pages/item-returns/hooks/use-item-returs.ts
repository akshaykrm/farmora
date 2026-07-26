import { useCallback, useEffect, useState } from "react";
import type { ItemReturn } from "../types";
import purchase from "../api";
import { overrideFilters, type Filter } from "@utils/filters";

function useGetItemReturns(filter?: Filter) {
  const [itemReturns, setPurchases] = useState<{
    records: ItemReturn[];
    totalPages: number;
  }>({
    records: [],
    totalPages: 0,
  });

  const {
    page,
    limit,
    return_type,
    item_category_id,
    from_batch,
    to_batch,
    to_vendor,
    start_date,
    end_date,
  } = filter || {};

  const handleFetchAllPurchases = useCallback(
    async (override?: Filter) => {
      const opts = overrideFilters(filter, override);

      const res = await purchase.fetchAll(opts);
      if (res.status === "success") {
        if (res.data) {
          const { data, totalPages } = res.data;
          setPurchases({
            records: data,
            totalPages: totalPages,
          });
        }
      }
    },
    [
      page,
      limit,
      return_type,
      item_category_id,
      from_batch,
      to_batch,
      to_vendor,
      start_date,
      end_date,
    ],
  );

  useEffect(() => {
    handleFetchAllPurchases();
  }, [handleFetchAllPurchases]);

  return { itemReturns, refetch: handleFetchAllPurchases };
}

export default useGetItemReturns;
