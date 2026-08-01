import seasons from "@pages/seasons/api";
import type { SeasonName } from "@pages/seasons/types";
import { useState, useEffect } from "react";

const useGetSeasonNameList = () => {
  const [state, setState] = useState<SeasonName[]>([]);

  useEffect(() => {
    seasons
      .getNames()
      .then((data) => setState(data))
      .catch((err) => {
        console.log(err);
        setState([]);
      });
  }, []);

  return { data: state };
};

export default useGetSeasonNameList;
