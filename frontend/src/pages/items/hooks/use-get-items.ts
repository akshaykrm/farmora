import { useCallback, useEffect, useState } from "react";
import type { Item } from "../types";
import item from "../api";
import { overrideFilters, type Filter } from "@utils/filters";

const useGetItems = (filter?: Filter) => {
  const [items, setItems] = useState<{
    records: Item[];
    totalPages: number;
  }>({ records: [], totalPages: 0 });

  const { page, limit } = filter || {};

  const handleFetchAllItems = useCallback(
    async (override?: Filter) => {
      const opts = overrideFilters(filter, override);

      const res = await item.fetchAll(opts);
      if (res.status === "success") {
        if (res.data) {
          const { data, totalPages } = res.data;
          setItems({ records: data, totalPages: totalPages });
        }
      }
    },
    [page, limit],
  );

  useEffect(() => {
    handleFetchAllItems();
  }, [handleFetchAllItems]);

  return { items, refetch: handleFetchAllItems };
};

export default useGetItems;
