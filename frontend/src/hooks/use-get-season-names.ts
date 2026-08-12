import seasons from "@pages/seasons/api";
import type { SeasonName, SeasonNameFilter } from "@pages/seasons/types";
import { useState, useEffect } from "react";

const useGetSeasonNames = (filter?: SeasonNameFilter) => {
  const [state, setState] = useState<SeasonName[]>([]);

  const { status } = filter || {};
  useEffect(() => {
    seasons
      .getNames({ status })
      .then((data) => setState(data))
      .catch((err) => {
        console.log(err);
        setState([]);
      });
  }, [status]);

  return { data: state };
};

export default useGetSeasonNames;
