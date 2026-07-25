import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_LIMIT } from "@config";
import useQueryParameters from "@hooks/use-query-parameters";

function useItemReturnFilter() {
  const { queryParms, updateQueryParams } = useQueryParameters();

  const page = queryParms.page ? parseInt(queryParms.page) : DEFAULT_FIRST_PAGE;
  const limit = queryParms.limit
    ? parseInt(queryParms.limit)
    : DEFAULT_PAGE_LIMIT;

  const from_batch = queryParms.from_batch
    ? parseInt(queryParms.from_batch)
    : null;

  const to_batch = queryParms.to_batch ? parseInt(queryParms.to_batch) : null;
  const to_vendor = queryParms.to_vendor
    ? parseInt(queryParms.to_vendor)
    : null;

  const return_type = queryParms.return_type || "all";
  const item_category_id = queryParms.item_category_id
    ? parseInt(queryParms.item_category_id)
    : null;

  return {
    filter: {
      ...queryParms,
      page,
      limit,
      from_batch,
      return_type,
      item_category_id,
      to_batch,
      to_vendor,
    },
    updateQueryParams,
  };
}

export default useItemReturnFilter;
