import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_LIMIT } from "@config";
import useQueryParameters from "@hooks/use-query-parameters";

function useLedgerFilter() {
  const { queryParms, updateQueryParams } = useQueryParameters();

  const page = queryParms.page ? parseInt(queryParms.page) : DEFAULT_FIRST_PAGE;
  const limit = queryParms.limit
    ? parseInt(queryParms.limit)
    : DEFAULT_PAGE_LIMIT;
  const investor_id = queryParms.investor_id
    ? queryParms.investor_id
    : null;
  const transaction_type_id = queryParms.transaction_type_id
    ? queryParms.transaction_type_id
    : null;

  return {
    filter: {
      ...queryParms,
      page,
      limit,
      investor_id,
      transaction_type_id,
    },
    updateQueryParams,
  };
}

export default useLedgerFilter;
