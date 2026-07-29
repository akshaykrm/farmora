import { useCallback, useEffect, useState } from "react";
import { overrideFilters, type Filter } from "@utils/filters";
import salesApi from "../api";
import type { Sale } from "@app-types/sales.types";

function useGetSales(filter: Filter) {
  const [sales, setSales] = useState<{
    records: Sale[];
    totalPages: number;
  }>({ records: [], totalPages: 0 });

  const { season_id, start_date, end_date, buyer_name, page, limit, batch_id } =
    filter;

  const handlefetchAllSales = useCallback(
    async (override?: Filter) => {
      const opts = overrideFilters(filter, override);
      const res = await salesApi.fetchAll(opts);

      if (res.status === "success") {
        if (res.data) {
          const { data, totalPages } = res.data;
          setSales({
            records: data,
            totalPages: totalPages,
          });
        }
      }
    },
    [season_id, start_date, end_date, buyer_name, page, limit, batch_id],
  );

  useEffect(() => {
    handlefetchAllSales();
  }, [handlefetchAllSales]);

  return { sales, refetch: handlefetchAllSales };
}

export default useGetSales;
