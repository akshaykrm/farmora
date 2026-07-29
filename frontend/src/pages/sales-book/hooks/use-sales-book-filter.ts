import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_LIMIT } from "@config";
import useQueryParameters from "@hooks/use-query-parameters";

function useSalesBookFilter() {
  const { queryParms, updateQueryParams } = useQueryParameters();

  const page = queryParms.page ? parseInt(queryParms.page) : DEFAULT_FIRST_PAGE;
  const limit = queryParms.limit
    ? parseInt(queryParms.limit)
    : DEFAULT_PAGE_LIMIT;

  const buyer_id = queryParms.buyer_id ? parseInt(queryParms.buyer_id) : null;

  return {
    filter: {
      ...queryParms,
      page,
      limit,
      buyer_id,
    },
    updateQueryParams,
  };
}

export default useSalesBookFilter;
