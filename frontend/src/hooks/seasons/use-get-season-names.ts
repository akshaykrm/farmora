import useGetNames from "@hooks/use-get-names";
import seasons from "@pages/seasons/api";
import type { SeasonName } from "@pages/seasons/types";

const useGetSeasonNames = () => {
  const query = useGetNames<SeasonName[]>({
    queryFn: seasons.getNames,
    queryKey: "season:names",
  });

  return query;
};

export default useGetSeasonNames;
