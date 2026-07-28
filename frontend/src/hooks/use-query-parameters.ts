import { useSearchParams } from "react-router";
import { useMemo } from "react";

function useQueryParameters() {
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
        console.log(k, v);
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

export default useQueryParameters;
