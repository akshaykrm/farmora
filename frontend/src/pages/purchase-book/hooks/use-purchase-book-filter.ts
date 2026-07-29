import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_LIMIT } from "@config";
import useQueryParameters from "@hooks/use-query-parameters";

function usePurchaseBookFilter() {
  const { queryParms, updateQueryParams } = useQueryParameters();

  const page = queryParms.page ? parseInt(queryParms.page) : DEFAULT_FIRST_PAGE;
  const limit = queryParms.limit
    ? parseInt(queryParms.limit)
    : DEFAULT_PAGE_LIMIT;

  const vendor_id = queryParms.vendor_id
    ? parseInt(queryParms.vendor_id)
    : null;

  return {
    filter: {
      ...queryParms,
      page,
      limit,
      vendor_id,
    },
    updateQueryParams,
  };
}

export default usePurchaseBookFilter;
