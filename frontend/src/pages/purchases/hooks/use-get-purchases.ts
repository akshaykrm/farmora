import { useEffect, useState } from "react";
import type { Purchase } from "../types";
import purchase from "../api";

function useGetPurchases(filter?: Record<string, string | number | null>) {
  const [purchases, setPurchases] = useState<{
    records: Purchase[];
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
    vendor_id,
    category_id,
    batch_id,
    start_date,
    end_date,
  } = filter || {};

  useEffect(() => {
    handleFetchAllPurchases({
      page,
      limit,
      vendor_id,
      category_id,
      batch_id,
      start_date,
      end_date,
    });
  }, [page, limit, vendor_id, category_id, batch_id, start_date, end_date]);

  return purchases;
}

export default useGetPurchases;
