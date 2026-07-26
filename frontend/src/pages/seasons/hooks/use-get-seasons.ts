import { useCallback, useEffect, useState } from "react";
import type { Season } from "../types";
import seasons from "../api";
import { overrideFilters, type Filter } from "@utils/filters";

const useGetSeasons = (filter?: Filter) => {
  const [seasonsList, setSeasonsList] = useState<{
    records: Season[];
    totalPages: number;
  }>({ records: [], totalPages: 0 });

  const { page, limit } = filter || {};

  const handleFetchAllSeasons = useCallback(
    async (override?: Filter) => {
      const opts = overrideFilters(filter, override);
      const res = await seasons.fetchAll(opts);
      if (res.status === "success") {
        if (res.data) {
          const { data, totalPages } = res.data;
          setSeasonsList({ records: data, totalPages });
        }
      }
    },
    [page, limit],
  );

  useEffect(() => {
    handleFetchAllSeasons();
  }, [handleFetchAllSeasons]);

  return { seasonsList, refetch: handleFetchAllSeasons };
};

export default useGetSeasons;
