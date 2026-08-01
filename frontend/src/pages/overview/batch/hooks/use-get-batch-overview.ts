import { overrideFilters, type Filter } from "@utils/filters";
import batchOverviewApi from "../api";
import type { BatchOverviewResponse } from "../types";
import { useCallback, useEffect, useState } from "react";

function searializeFilter(filter: Filter, override?: Filter) {
  const {
    e_page,
    e_limit,
    s_page,
    s_limit,
    r_limit,
    r_page,
    batch_id,
    start_date,
    end_date,
  } = filter;

  return overrideFilters(
    {
      e_page,
      e_limit,
      s_page,
      s_limit,
      r_limit,
      r_page,
      batch_id,
      start_date,
      end_date,
    },
    override,
  );
}

function useGetBatchOverview(filter: Filter) {
  const [batchOverview, setBatchOverview] = useState<BatchOverviewResponse>({
    expenses: {
      count: 0,
      data: [],
      totalPages: 0,
    },
    returns: {
      count: 0,
      data: [],
      totalPages: 0,
    },
    sales: {
      count: 0,
      data: [],
      totalPages: 0,
    },
    overviewCalculations: {
      total_expense: 0,
      avg_weight: 0,
      cfcr: 0,
      fcr: 0,
      total_purchase_feeds: 0,
      total_purchase_amount: 0,
      total_returned_feeds: 0,
      total_returned_amount: 0,
      total_sale_birds: 0,
      total_sale_weight: 0,
      total_sale_amount: 0,
    },
  });

  const {
    e_page,
    e_limit,
    s_page,
    s_limit,
    r_limit,
    r_page,
    season_id,
    batch_id,
    start_date,
    end_date,
  } = filter;

  const handleGetBatchOverview = useCallback(
    async (override?: Filter) => {
      if (!batch_id) {
        return;
      }
      const opts = searializeFilter(filter, override);

      const res = await batchOverviewApi.fetchOverview(opts);
      if (res.status === "success") {
        if (res.data) {
          const { expenses, returns, sales, batch, overviewCalculations } =
            res.data;
          setBatchOverview({
            expenses,
            returns,
            sales,
            batch,
            overviewCalculations,
          });
        }
      }
    },
    [
      e_page,
      e_limit,
      s_page,
      s_limit,
      r_limit,
      r_page,
      season_id,
      batch_id,
      start_date,
      end_date,
    ],
  );

  useEffect(() => {
    handleGetBatchOverview();
  }, [handleGetBatchOverview]);

  return {
    batchOverview,
    refetch: handleGetBatchOverview,
  };
}

export default useGetBatchOverview;
