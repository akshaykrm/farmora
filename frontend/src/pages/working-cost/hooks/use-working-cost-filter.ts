import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_LIMIT } from "@config";
import useQueryParameters from "@hooks/use-query-parameters";

function useWorkingCostFilter() {
  const { queryParms, updateQueryParams } = useQueryParameters();

  const e_page = queryParms.e_page
    ? parseInt(queryParms.e_page)
    : DEFAULT_FIRST_PAGE;
  const i_page = queryParms.i_page
    ? parseInt(queryParms.i_page)
    : DEFAULT_FIRST_PAGE;

  const i_limit = queryParms.i_limit
    ? parseInt(queryParms.i_limit)
    : DEFAULT_PAGE_LIMIT;
  const e_limit = queryParms.e_limit
    ? parseInt(queryParms.e_limit)
    : DEFAULT_PAGE_LIMIT;

  const season_id = queryParms.season_id
    ? parseInt(queryParms.season_id)
    : null;

  return {
    filter: {
      ...queryParms,
      e_page,
      e_limit,
      i_page,
      i_limit,
      season_id,
    },
    updateQueryParams,
  };
}

export default useWorkingCostFilter;
