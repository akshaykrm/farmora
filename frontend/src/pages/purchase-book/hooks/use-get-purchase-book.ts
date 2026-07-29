import { useCallback, useEffect, useState } from "react";
import { overrideFilters, type Filter } from "@utils/filters";
import purchaseBookApi from "../api";
import type { PurchaseBookTransaction, PurchaseBookSummary } from "../types";

function useGetPurchaseBook(filter: Filter) {
  const [purchaseBook, setPurchaseBook] = useState<{
    records: PurchaseBookTransaction[];
    totalPages: number;
    summary?: PurchaseBookSummary;
  }>({
    records: [],
    totalPages: 0,
  });

  const { vendor_id, start_date, end_date, page, limit } = filter;

  const handlefetchAllSales = useCallback(
    async (override?: Filter) => {
      if (!vendor_id) {
        return;
      }
      const opts = overrideFilters(filter, override);
      const res = await purchaseBookApi.fetchAll(opts);

      if (res.status === "success") {
        if (res.data) {
          const { data, summary, totalPages } = res.data;
          setPurchaseBook({
            records: data,
            totalPages: totalPages,
            summary: summary,
          });
        }
      }
    },
    [start_date, end_date, page, limit, vendor_id],
  );

  useEffect(() => {
    handlefetchAllSales();
  }, [handlefetchAllSales]);

  return { purchaseBook, refetch: handlefetchAllSales };
}

export default useGetPurchaseBook;
