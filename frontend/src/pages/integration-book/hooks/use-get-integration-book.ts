import { useCallback, useEffect, useState } from "react";
import type { IntegrationBookResponse } from "../types";
import integrationBook from "../api";
import { overrideFilters, type Filter } from "@utils/filters";

const useGetIntegrationBook = (filter: Filter) => {
  const [integrationBookList, setIntegrationBookList] =
    useState<IntegrationBookResponse>({
      credit: {
        count: 0,
        totalPages: 0,
        data: [],
      },
      paid: {
        count: 0,
        totalPages: 0,
        data: [],
      },
    });

  const { c_page, c_limit, p_page, p_limit, farm_id, start_date, end_date } =
    filter;

  const handleFetchAllIntegrationBook = useCallback(
    async (override?: Filter) => {
      if (!farm_id) {
        return;
      }
      const opts = overrideFilters(
        { c_page, c_limit, p_page, p_limit, farm_id, start_date, end_date },
        override,
      )

      const res = await integrationBook.fetchAll(opts);

      if (res.status === "success") {
        if (res.data) {
          const { credit, paid, summary } = res.data;
          setIntegrationBookList({
            credit,
            paid,
            summary,
          });
        }
      }
    },
    [c_page, c_limit, p_page, p_limit, farm_id, start_date, end_date],
  );

  useEffect(() => {
    handleFetchAllIntegrationBook();
  }, [handleFetchAllIntegrationBook]);

  return { integrationBookList, refetch: handleFetchAllIntegrationBook };
};

export default useGetIntegrationBook;
