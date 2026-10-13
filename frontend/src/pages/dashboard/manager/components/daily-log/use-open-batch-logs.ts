import { useCallback, useEffect, useState } from "react";
import dailyLogApi from "@pages/overview/batch/daily-log/api";
import type { OpenBatchLogStatus } from "@pages/overview/batch/daily-log/types";

function useOpenBatchLogs() {
  const [data, setData] = useState<OpenBatchLogStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const refetch = useCallback(async () => {
    const res = await dailyLogApi.fetchOpenBatches();
    if (res.status === "success" && res.data) {
      setData(res.data);
      setFailed(false);
    } else {
      setFailed(true);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, failed, refetch };
}

export default useOpenBatchLogs;
