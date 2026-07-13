import batches from "@api/batches.api";
import type { BatchName, BatchNameFilter } from "@pages/batches/types";
import { useState, useEffect } from "react";

function useGetBatchNameList(filter?: BatchNameFilter) {
  const [state, setState] = useState<BatchName[]>([]);

  const { status, season_id } = filter || {};
  useEffect(() => {
    batches
      .getNames({ status, season_id })
      .then((data) => setState(data))
      .catch((err) => {
        console.log(err);
        setState([]);
      });
  }, [status, season_id]);

  return { data: state };
}

export default useGetBatchNameList;
