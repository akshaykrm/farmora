import { useCallback, useEffect, useState } from "react";
import { overrideFilters, type Filter } from "@utils/filters";
import type { SalesBookSummary, SalesBookTransaction } from "../types";
import salesBookApi from "../api";

function useGetSalesBook(filter: Filter) {
  const [saleBook, setSalesBook] = useState<{
    records: SalesBookTransaction[];
    totalPages: number;
    summary?: SalesBookSummary;
  }>({
    records: [],
    totalPages: 0,
  });

  const { buyer_id, start_date, end_date, page, limit } = filter;

  const handlefetchAllSales = useCallback(
    async (override?: Filter) => {
      if (!buyer_id) {
        return;
      }
      const opts = overrideFilters(filter, override);
      const res = await salesBookApi.fetchAll(opts);

      if (res.status === "success") {
        if (res.data) {
          const { data, totalPages, summary } = res.data;
          setSalesBook({
            records: data,
            totalPages: totalPages,
            summary: summary,
          });
        }
      }
    },
    [start_date, end_date, page, limit, buyer_id],
  );

  useEffect(() => {
    handlefetchAllSales();
  }, [handlefetchAllSales]);

  return { saleBook, refetch: handlefetchAllSales };
}

export default useGetSalesBook;
