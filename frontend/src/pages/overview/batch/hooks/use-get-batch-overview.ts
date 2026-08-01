import { overrideFilters, type Filter } from "@utils/filters";
import batchOverview from "../api";
import type {
  BatchOverviewBatch,
  BatchOverviewExpense,
  BatchOverviewReturn,
  BatchOverviewSale,
  OverviewCalculculation,
} from "../types";
import { useCallback, useEffect, useState } from "react";

function searializeFilter(filter: Filter, override?: Filter) {
  const {
    e_page,
    e_limit,
    s_page,
    s_limit,
    f_limit,
    f_page,
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
      f_limit,
      f_page,
      batch_id,
      start_date,
      end_date,
    },
    override,
  );
}

function useGetBatchOverview(filter: Filter) {
  const [expenses, setExpenses] = useState<BatchOverviewExpense[]>([]);
  const [sales, setSales] = useState<BatchOverviewSale[]>([]);
  const [returns, setReturns] = useState<BatchOverviewReturn[]>([]);
  const [batch, setBatch] = useState<BatchOverviewBatch | null>(null);

  const [overviewCalculations, setOverviewCalculations] =
    useState<OverviewCalculculation>({
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
    });

  const {
    e_page,
    e_limit,
    s_page,
    s_limit,
    f_limit,
    f_page,
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

      const res = await batchOverview.fetchOverview(opts);
      if (res.status === "success") {
        if (res.data) {
          const { expenses, returns, sales, batch, overviewCalculations } =
            res.data;
          setOverviewCalculations(overviewCalculations);
          setExpenses(expenses);
          setSales(sales);
          setReturns(returns);
          setBatch(batch);
        }
      }
    },
    [
      e_page,
      e_limit,
      s_page,
      s_limit,
      f_limit,
      f_page,
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
    expenses,
    sales,
    returns,
    batch,
    overviewCalculations,
    refetch: handleGetBatchOverview,
  };
}

export default useGetBatchOverview;
