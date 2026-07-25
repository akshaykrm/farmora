import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_LIMIT } from "@config";
import useQueryParameters from "@hooks/use-query-parameters";

function usePurchaseFilter() {
  const { queryParms, updateQueryParams } = useQueryParameters();

  const page = queryParms.page ? parseInt(queryParms.page) : DEFAULT_FIRST_PAGE;
  const limit = queryParms.limit
    ? parseInt(queryParms.limit)
    : DEFAULT_PAGE_LIMIT;
  const vendor_id = queryParms.vendor_id
    ? parseInt(queryParms.vendor_id)
    : null;

  const batch_id = queryParms.batch_id ? parseInt(queryParms.batch_id) : null;
  const category_id = queryParms.category_id
    ? parseInt(queryParms.category_id)
    : null;

  return {
    filter: {
      ...queryParms,
      page,
      limit,
      vendor_id,
      batch_id,
      category_id,
    },
    updateQueryParams,
  };
}

export default usePurchaseFilter;
