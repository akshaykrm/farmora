import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_LIMIT } from "@config";
import useQueryParameters from "@hooks/use-query-parameters";

function useBalanceSheetFilter() {
  const { queryParms, updateQueryParams } = useQueryParameters();

  const page = queryParms.page ? parseInt(queryParms.page) : DEFAULT_FIRST_PAGE;

  return {
    page,
    updateQueryParams,
  };
}

export default useBalanceSheetFilter;
