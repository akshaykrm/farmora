import { useCallback, useEffect, useState } from "react";
import vendors from "../api";
import type { Vendor } from "../types";
import { overrideFilters, type Filter } from "@utils/filters";

const useGetVendors = (filter?: Filter) => {
  const [vendorsList, setVendorsList] = useState<{
    records: Vendor[];
    totalPages: number;
  }>({ records: [], totalPages: 0 });

  const { page, limit } = filter || {};

  const handleFetchAllVendors = useCallback(
    async (override?: Filter) => {
      const opts = overrideFilters(filter, override);
      const res = await vendors.fetchAll(opts);
      if (res.status === "success") {
        if (res.data) {
          const { data, totalPages } = res.data;
          setVendorsList({ records: data, totalPages });
        }
      }
    },
    [page, limit],
  );

  useEffect(() => {
    handleFetchAllVendors();
  }, [handleFetchAllVendors]);

  return { vendorsList, refetch: handleFetchAllVendors };
};

export default useGetVendors;
