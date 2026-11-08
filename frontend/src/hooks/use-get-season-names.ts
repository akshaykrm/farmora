import seasons from "@pages/seasons/api";
import type { SeasonName, SeasonNameFilter } from "@pages/seasons/types";
import { useQuery } from "@tanstack/react-query";

const EMPTY: SeasonName[] = [];

const useGetSeasonNames = (filter?: SeasonNameFilter) => {
  const { status } = filter || {};
  const query = useQuery<SeasonName[]>({
    queryKey: ["season:names", { status }],
    queryFn: () => seasons.getNames({ status }),
    staleTime: 30_000,
  });

  return { data: query.data ?? EMPTY };
};

export default useGetSeasonNames;
