import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_LIMIT } from "@config";
import useQueryParameters from "@hooks/use-query-parameters";

function useBatchOverviewFilter() {
  const { queryParms, updateQueryParams } = useQueryParameters();

  const e_page = queryParms.e_page
    ? parseInt(queryParms.e_page)
    : DEFAULT_FIRST_PAGE;

  const e_limit = queryParms.e_limit
    ? parseInt(queryParms.e_limit)
    : DEFAULT_PAGE_LIMIT;

  const s_page = queryParms.s_page
    ? parseInt(queryParms.s_page)
    : DEFAULT_FIRST_PAGE;

  const s_limit = queryParms.s_limit
    ? parseInt(queryParms.s_limit)
    : DEFAULT_PAGE_LIMIT;

  const r_page = queryParms.r_page
    ? parseInt(queryParms.r_page)
    : DEFAULT_FIRST_PAGE;

  const r_limit = queryParms.r_limit
    ? parseInt(queryParms.r_limit)
    : DEFAULT_PAGE_LIMIT;

  const season_id = queryParms.season_id
    ? parseInt(queryParms.season_id)
    : null;

  const batch_id = queryParms.batch_id ? parseInt(queryParms.batch_id) : null;

  return {
    filter: {
      ...queryParms,
      e_page,
      e_limit,
      s_page,
      s_limit,
      r_limit,
      r_page,
      season_id,
      batch_id,
    },
    updateQueryParams,
  };
}

export default useBatchOverviewFilter;
