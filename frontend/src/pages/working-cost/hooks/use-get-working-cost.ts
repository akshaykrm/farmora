import { useCallback, useEffect, useState } from "react";
import type { WorkingCostListResponse, WorkingCostResponse } from "../types";
import workingCost from "../api";
import { overrideFilters, type Filter } from "@utils/filters";

const useGetWorkingCost = (filter: Filter) => {
  const [workingCostList, setWorkingCostList] = useState<WorkingCostResponse>({
    income: {
      count: 0,
      totalPage: 0,
      data: [],
    },
    expense: {
      count: 0,
      totalPage: 0,
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
    },
    [e_page, e_limit, i_page, i_limit, season_id, start_date, end_date],
  );

  useEffect(() => {
    handleFetchAllWorkingCost();
  }, [handleFetchAllWorkingCost]);

  return { workingCostList, refetch: handleFetchAllWorkingCost };
};

export default useGetWorkingCost;
