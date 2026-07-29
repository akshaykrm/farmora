import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_LIMIT } from "@config";
import useQueryParameters from "@hooks/use-query-parameters";

function useSalesFilter() {
  const { queryParms, updateQueryParams } = useQueryParameters();

  const page = queryParms.page ? parseInt(queryParms.page) : DEFAULT_FIRST_PAGE;
  const limit = queryParms.limit
    ? parseInt(queryParms.limit)
    : DEFAULT_PAGE_LIMIT;

  const season_id = queryParms.season_id
    ? parseInt(queryParms.season_id)
    : null;

  const batch_id = queryParms.batch_id ? parseInt(queryParms.batch_id) : null;

  const buyer_name = queryParms.buyer_name
    ? parseInt(queryParms.buyer_name)
    : "";

  return {
    filter: {
      ...queryParms,
      page,
      limit,
      buyer_name,
      season_id,
      batch_id,
    },
    updateQueryParams,
  };
}

export default useSalesFilter;
