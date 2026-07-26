import { useCallback, useEffect, useState } from "react";
import type { Purchase } from "../types";
import purchase from "../api";
import { overrideFilters, type Filter } from "@utils/filters";

function useGetPurchases(filter?: Filter) {
  const [purchases, setPurchases] = useState<{
    records: Purchase[];
    totalPages: number;
  }>({
    records: [],
    totalPages: 0,
  });

  const {
    page,
    limit,
    vendor_id,
    category_id,
    batch_id,
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
    [page, limit, vendor_id, category_id, batch_id, start_date, end_date],
  );

  useEffect(() => {
    handleFetchAllPurchases();
  }, [handleFetchAllPurchases]);

  return { purchases, refetch: handleFetchAllPurchases };
}

export default useGetPurchases;
