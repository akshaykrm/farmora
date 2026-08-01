import { useCallback, useEffect, useState } from "react";
import { overrideFilters, type Filter } from "@utils/filters";
import generalExpense from "../api";
import type { GeneralExpenseRecord } from "../types";

function useGetGeneralExpense(filter: Filter) {
  const [generalExpenses, setGeneralExpense] = useState<{
    records: GeneralExpenseRecord[];
    totalPages: number;
    totalAmount: number;
  }>({ records: [], totalPages: 0, totalAmount: 0 });

  const { season_id, start_date, end_date, purpose, page, limit } = filter;

  const handlefetchAllGeneralExpense = useCallback(
    async (override?: Filter) => {
      const opts = overrideFilters(filter, override);
      const res = await generalExpense.fetchAll(opts);

      if (res.status === "success") {
        if (res.data) {
          const { data, totalPages, totalAmount } = res.data;
          setGeneralExpense({
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
    handlefetchAllGeneralExpense();
  }, [handlefetchAllGeneralExpense]);

  return { generalExpenses, refetch: handlefetchAllGeneralExpense };
}

export default useGetGeneralExpense;
