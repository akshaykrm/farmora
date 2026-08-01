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

  const f_page = queryParms.f_page
    ? parseInt(queryParms.f_page)
    : DEFAULT_FIRST_PAGE;

  const f_limit = queryParms.f_limit
    ? parseInt(queryParms.f_limit)
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
      f_limit,
      f_page,
      season_id,
      batch_id,
    },
    updateQueryParams,
  };
}

export default useBatchOverviewFilter;
