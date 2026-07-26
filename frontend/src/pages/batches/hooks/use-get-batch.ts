import { useCallback, useEffect, useState } from "react";
import type { Batch } from "../types";
import batch from "../api";
import { overrideFilters, type Filter } from "@utils/filters";

const useGetBatches = (filter?: Filter) => {
  const [batches, setBatches] = useState<{
    records: Batch[];
    totalPages: number;
  }>({ records: [], totalPages: 0 });

  const { page, limit } = filter || {};

  const handleFetchAllBatches = useCallback(
    async (override?: Filter) => {
      const opts = overrideFilters(filter, override);
      const res = await batch.fetchAll(opts);
      if (res.status === "success") {
        if (res.data) {
          const { data, totalPages } = res.data;
          setBatches({ records: data, totalPages });
        }
      }
    },
    [page, limit],
  );

  useEffect(() => {
    handleFetchAllBatches();
  }, [handleFetchAllBatches]);

  return { batches, refetch: handleFetchAllBatches };
};

export default useGetBatches;
