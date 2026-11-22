import vendors from "@api/vendor.api";
import type { VendorName } from "@app-types/vendor.types";
import type { VendorNamesFilter } from "@pages/vendors/types";
import { useQuery } from "@tanstack/react-query";

const EMPTY: VendorName[] = [];

const useGetVendorNames = (filter?: VendorNamesFilter) => {
  const query = useQuery<VendorName[]>({
    queryKey: ["vendor:name-list", filter ?? null],
    queryFn: () => vendors.getNames(filter),
    staleTime: 30_000,
  });

  return { data: query.data ?? EMPTY };
};

export default useGetVendorNames;
