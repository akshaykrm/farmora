import { overrideFilters, type Filter } from "@utils/filters";
import seasonOverviewApi from "../api";
import type { SeasonOverviewResponse } from "../types";
import { useCallback, useEffect, useState } from "react";

function searializeFilter(filter: Filter, override?: Filter) {
  const {
    season_id,
    b_page,
    b_limit,
    gc_page,
    gc_limit,
    gs_page,
    gs_limit,
    gc_purpose,
    gs_purpose,
  } = filter;

  return overrideFilters(
    {
      season_id,
      b_page,
      b_limit,
      gc_page,
      gc_limit,
      gs_page,
      gs_limit,
      gc_purpose,
      gs_purpose,
    },
    override,
  );
}

function useGetSeasonOverview(filter: Filter) {
  const [isLoading, setIsLoading] = useState(false);
  const [seasonOverview, setSeasonOverview] = useState<SeasonOverviewResponse>({
    season: null,
    totals: {
      total_avg_weight: 0,
      fcr: 0,
      cfcr: 0,
      avg_cost: 0,
      avg_rate: 0,
      profit_loss_percentage: 0,
      profit: 0,
    },
    batches: {
      count: 0,
      data: [],
      totalPages: 0,
    },
    general_costs: {
      count: 0,
      data: [],
      totalPages: 0,
    },
    general_sales: {
      count: 0,
      data: [],
      totalPages: 0,
    },
    summary: null,
  });

  const {
    season_id,
    b_page,
    b_limit,
    gc_page,
    gc_limit,
    gs_page,
    gs_limit,
    gc_purpose,
    gs_purpose,
  } = filter;

  const handleGetSeasonOverview = useCallback(
    async (override?: Filter) => {
      if (!season_id) {
        return;
      }
      const opts = searializeFilter(filter, override);
      setIsLoading(true);

      const res = await seasonOverviewApi.fetchOverview(opts);
      if (res.status === "success") {
        if (res.data) {
          setSeasonOverview(res.data);
        }
      }
      setIsLoading(false);
    },
    [
      season_id,
      b_page,
      b_limit,
      gc_page,
      gc_limit,
      gs_page,
      gs_limit,
      gc_purpose,
      gs_purpose,
    ],
  );

  useEffect(() => {
    handleGetSeasonOverview();
  }, [handleGetSeasonOverview]);

  return {
    seasonOverview,
    isLoading,
    refetch: handleGetSeasonOverview,
  };
}

export default useGetSeasonOverview;
