import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_LIMIT } from "@config";
import useQueryParameters from "@hooks/use-query-parameters";

function useIntegrationBookFilter() {
  const { queryParms, updateQueryParams } = useQueryParameters();

  const c_page = queryParms.c_page
    ? parseInt(queryParms.c_page)
    : DEFAULT_FIRST_PAGE;
  const p_page = queryParms.p_page
    ? parseInt(queryParms.p_page)
    : DEFAULT_FIRST_PAGE;

  const c_limit = queryParms.c_limit
    ? parseInt(queryParms.c_limit)
    : DEFAULT_PAGE_LIMIT;
  const p_limit = queryParms.p_limit
    ? parseInt(queryParms.p_limit)
    : DEFAULT_PAGE_LIMIT;

  const farm_id = queryParms.farm_id
    ? parseInt(queryParms.farm_id)
    : null;

  return {
    filter: {
      ...queryParms,
      c_page,
      c_limit,
      p_page,
      p_limit,
      farm_id,
    },
    updateQueryParams,
  };
}

export default useIntegrationBookFilter;
