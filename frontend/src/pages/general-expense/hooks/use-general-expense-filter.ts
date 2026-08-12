import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_LIMIT } from "@config";
import useQueryParameters from "@hooks/use-query-parameters";

function useGeneralExpenseFilter() {
  const { queryParms, updateQueryParams } = useQueryParameters();

  const page = queryParms.page ? parseInt(queryParms.page) : DEFAULT_FIRST_PAGE;
  const limit = queryParms.limit
    ? parseInt(queryParms.limit)
    : DEFAULT_PAGE_LIMIT;
  const season_id = queryParms.season_id
    ? parseInt(queryParms.season_id)
    : null;

  const purpose = queryParms.purpose ? queryParms.purpose : "";

  return {
    filter: {
      ...queryParms,
      page,
      limit,
      purpose,
      season_id,
    },
    updateQueryParams,
  };
}

export default useGeneralExpenseFilter;
