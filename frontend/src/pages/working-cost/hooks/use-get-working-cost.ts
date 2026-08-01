import { useCallback, useEffect, useState } from "react";
import type { WorkingCostResponse } from "../types";
import workingCost from "../api";
import { overrideFilters, type Filter } from "@utils/filters";

const useGetWorkingCost = (filter: Filter) => {
  const [isLoading, setIsLoading] = useState(false);
  const [workingCostList, setWorkingCostList] = useState<WorkingCostResponse>({
    income: {
      count: 0,
      totalPages: 0,
      data: [],
    },
    expense: {
      count: 0,
      totalPages: 0,
      data: [],
    },
  });

  const { e_page, e_limit, i_page, i_limit, season_id, start_date, end_date } =
    filter;

  const handleFetchAllWorkingCost = useCallback(
    async (override?: Filter) => {
      if (!season_id) {
        return;
      }
      const opts = overrideFilters(filter, override);
      setIsLoading(true);

      const res = await workingCost.fetchAll(opts);

      if (res.status === "success") {
        if (res.data) {
          const { expense, income, summary } = res.data;
          setWorkingCostList({
            expense,
            income,
            summary,
          });
        }
      }
      setIsLoading(false);
    },
    [e_page, e_limit, i_page, i_limit, season_id, start_date, end_date],
  );

  useEffect(() => {
    handleFetchAllWorkingCost();
  }, [handleFetchAllWorkingCost]);

  return { workingCostList, isLoading, refetch: handleFetchAllWorkingCost };
};

export default useGetWorkingCost;
