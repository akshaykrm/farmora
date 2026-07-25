import { useSearchParams } from "react-router";
import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_LIMIT } from "@config";
import { useMemo } from "react";

function useQueryParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const updateQueryParams = (
    update: Record<string, string | number | null>,
  ) => {
    if (!update) {
      return;
    }
    const params = new URLSearchParams(searchParams);
    for (const k in update) {
      const v = update[k];
      const isValidInvalidValue = v === null || v === "";
      if (isValidInvalidValue) {
        params.delete(k);
      } else {
        params.set(k, v.toString());
      }
    }

    setSearchParams(params);
  };

  const convertedSearchParms: Record<string, string> = useMemo(() => {
    const obj: Record<string, string> = {};
    for (const [k, v] of searchParams.entries()) {
      if (v) {
        obj[k] = v;
      }
    }
    return obj;
  }, [searchParams]);
  return { queryParms: convertedSearchParms, updateQueryParams };
}

function usePaginate() {
  const { queryParms, updateQueryParams } = useQueryParams();

  const page = queryParms.page ? parseInt(queryParms.page) : DEFAULT_FIRST_PAGE;
  const limit = queryParms.limit
    ? parseInt(queryParms.limit)
    : DEFAULT_PAGE_LIMIT;

  return {
    filter: {
      ...queryParms,
      page,
      limit,
    },
    updateQueryParams,
  };
}

export default usePaginate;
