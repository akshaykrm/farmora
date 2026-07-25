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
  const vendor_id = queryParms.vendor_id
    ? parseInt(queryParms.vendor_id)
    : null;

  const batch_id = queryParms.batch_id ? parseInt(queryParms.batch_id) : null;
  const category_id = queryParms.category_id
    ? parseInt(queryParms.category_id)
    : null;

  return {
    filter: {
      ...queryParms,
      page,
      limit,
      vendor_id,
      batch_id,
      category_id,
    },
    updateQueryParams,
  };
}

export default usePaginate;
