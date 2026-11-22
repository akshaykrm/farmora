import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_LIMIT } from "@config";
import useQueryParameters from "@hooks/use-query-parameters";

function useSeasonOverviewFilter() {
  const { queryParms, updateQueryParams } = useQueryParameters();

  const b_page = queryParms.b_page
    ? parseInt(queryParms.b_page)
    : DEFAULT_FIRST_PAGE;

  const b_limit = queryParms.b_limit
    ? parseInt(queryParms.b_limit)
    : DEFAULT_PAGE_LIMIT;

  const gc_page = queryParms.gc_page
    ? parseInt(queryParms.gc_page)
    : DEFAULT_FIRST_PAGE;

  const gc_limit = queryParms.gc_limit
    ? parseInt(queryParms.gc_limit)
    : DEFAULT_PAGE_LIMIT;

  const gs_page = queryParms.gs_page
    ? parseInt(queryParms.gs_page)
    : DEFAULT_FIRST_PAGE;

  const gs_limit = queryParms.gs_limit
    ? parseInt(queryParms.gs_limit)
    : DEFAULT_PAGE_LIMIT;

  const season_id = queryParms.season_id
    ? parseInt(queryParms.season_id)
    : null;

  const gc_purpose = queryParms.gc_purpose ? queryParms.gc_purpose : "";
  const gs_purpose = queryParms.gs_purpose ? queryParms.gs_purpose : "";

  const b_search = queryParms.b_search || "";
  const b_close_from = queryParms.b_close_from || "";
  const b_close_to = queryParms.b_close_to || "";
  const b_sort_by = queryParms.b_sort_by || "";
  const b_sort_order = queryParms.b_sort_order === "desc" ? "desc" : "asc";

  return {
    filter: {
      ...queryParms,
      b_page,
      b_limit,
      gc_page,
      gc_limit,
      gs_page,
      gs_limit,
      season_id,
      gc_purpose,
      gs_purpose,
      b_search,
      b_close_from,
      b_close_to,
      b_sort_by,
      b_sort_order,
    },
    updateQueryParams,
  };
}

export default useSeasonOverviewFilter;
