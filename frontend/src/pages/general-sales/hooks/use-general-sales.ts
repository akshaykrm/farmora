import { useCallback, useEffect, useState } from "react";
import { overrideFilters, type Filter } from "@utils/filters";
import generalSalesApi from "../api";
import type { GeneralSalesRecord } from "../types";

function useGetGeneralSales(filter: Filter) {
  const [generalSales, setGeneralSales] = useState<{
    records: GeneralSalesRecord[];
    totalPages: number;
    totalAmount: number;
  }>({ records: [], totalPages: 0, totalAmount: 0 });

  const { season_id, start_date, end_date, purpose, page, limit } = filter;

  const handlefetchAllGeneralSales = useCallback(
    async (override?: Filter) => {
      const opts = overrideFilters(filter, override);
      const res = await generalSalesApi.fetchAll(opts);

      if (res.status === "success") {
        if (res.data) {
          const { data, totalPages, totalAmount } = res.data;
          setGeneralSales({
            records: data,
            totalPages: totalPages,
            totalAmount,
          });
        }
      }
    },
    [season_id, start_date, end_date, purpose, page, limit],
  );

  useEffect(() => {
    handlefetchAllGeneralSales();
  }, [handlefetchAllGeneralSales]);

  return { generalSales, refetch: handlefetchAllGeneralSales };
}

export default useGetGeneralSales;
