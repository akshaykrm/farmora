import { useCallback, useEffect, useState } from "react";
import farm from "../api";
import type { Farm } from "../types";
import { overrideFilters, type Filter } from "@utils/filters";

const useGetFarms = (filter?: Filter) => {
  const [farms, setFarms] = useState<{
    records: Farm[];
    totalPages: number;
  }>({ records: [], totalPages: 0 });

  const { page, limit } = filter || {};

  const handleGetFarms = useCallback(
    async (override?: Filter) => {
      const opts = overrideFilters(filter, override);
      const res = await farm.fetchAll(opts);
      if (res.status === "success") {
        if (res.data) {
          const { data, totalPages } = res.data;
          setFarms({ records: data, totalPages: totalPages });
        }
      }
    },
    [page, limit],
  );

  useEffect(() => {
    handleGetFarms();
  }, [handleGetFarms]);

  return { farms, refetch: handleGetFarms };
};

export default useGetFarms;
