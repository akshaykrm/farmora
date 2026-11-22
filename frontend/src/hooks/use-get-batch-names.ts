import batches from "@api/batches.api";
import type { BatchName, BatchNameFilter } from "@pages/batches/types";
import { useQuery } from "@tanstack/react-query";

const EMPTY: BatchName[] = [];

function useGetBatchNameList(filter?: BatchNameFilter) {
  const { status, season_id } = filter || {};
  const query = useQuery<BatchName[]>({
    queryKey: ["batch:name-list", { status, season_id }],
    queryFn: () => batches.getNames({ status, season_id }),
    staleTime: 30_000,
  });

  return { data: query.data ?? EMPTY };
}

export default useGetBatchNameList;
