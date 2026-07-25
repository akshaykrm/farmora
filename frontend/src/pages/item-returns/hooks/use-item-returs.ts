import { useEffect, useState } from "react";
import type { ItemReturn } from "../types";
import purchase from "../api";

function useGetItemReturns(filter?: Record<string, string | number | null>) {
  const [itemReturns, setPurchases] = useState<{
    records: ItemReturn[];
    totalPages: number;
  }>({
    records: [],
    totalPages: 0,
  });

  const handleFetchAllPurchases = async (
    filter?: Record<string, string | number | null>,
  ) => {
    const res = await purchase.fetchAll(filter);
    if (res.status === "success") {
      if (res.data) {
        const { data, totalPages } = res.data;
        console.log(res.data);
        setPurchases({
          records: data,
          totalPages: totalPages,
        });
      }
    }
  };

  const {
    page,
    limit,
    return_type,
    item_item_category_id,
    from_batch,
    to_batch,
    to_vendor,
    start_date,
    end_date,
  } = filter || {};

  useEffect(() => {
    handleFetchAllPurchases({
      page,
      limit,
      return_type,
      item_item_category_id,
      from_batch,
      to_batch,
      to_vendor,
      start_date,
      end_date,
    });
  }, [
    page,
    limit,
    return_type,
    item_item_category_id,
    from_batch,
    to_batch,
    to_vendor,
    start_date,
    end_date,
  ]);

  return itemReturns;
}

export default useGetItemReturns;
