import { useEffect, useState } from "react";
import type { Purchase } from "../types";
import purchase from "../api";

function useGetPurchases(filter?: Record<string, string | number>) {
  const [purchaseList, setPurchaseList] = useState<Purchase[]>([]);

  const handleFetchAllPurchases = async (
    filter?: Record<string, string | number>,
  ) => {
    const res = await purchase.fetchAll(filter);
    if (res.status === "success") {
      if (res.data) {
        setPurchaseList(res.data.data);
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

  return purchaseList;
}

export default useGetPurchases;
