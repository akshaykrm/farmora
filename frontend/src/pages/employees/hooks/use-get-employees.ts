import { useCallback, useEffect, useState } from "react";
import type { Employee } from "../types";
import employee from "../api";
import { overrideFilters, type Filter } from "@utils/filters";

const useGetEmployees = (filter?: Filter) => {
  const [employees, setEmployees] = useState<{
    records: Employee[];
    totalPages: number;
  }>({ records: [], totalPages: 0 });

  const { page, limit } = filter || {};

  const handleFetchAllEmployees = useCallback(
    async (override?: Filter) => {
      const opts = overrideFilters(filter, override);
      const res = await employee.fetchAll(opts);
      if (res.status === "success") {
        if (res.data) {
          const { data, totalPages } = res.data;
          setEmployees({ records: data, totalPages });
        }
      }
    },
    [page, limit],
  );

  useEffect(() => {
    handleFetchAllEmployees();
  }, [handleFetchAllEmployees]);

  return { employees, refetch: handleFetchAllEmployees };
};

export default useGetEmployees;
