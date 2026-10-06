import { useCallback, useEffect, useState } from "react";
import dailyLogApi from "../api";
import type { DailyLogResponse } from "../types";

function useDailyLogs(batchId: number | null) {
  const [data, setData] = useState<DailyLogResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!batchId) {
      setData(null);
      return;
    }
    setIsLoading(true);
    const res = await dailyLogApi.fetch(batchId);
    if (res.status === "success" && res.data) {
      setData(res.data);
    } else {
      setData(null);
    }
    setIsLoading(false);
  }, [batchId]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, refetch };
}

export default useDailyLogs;
