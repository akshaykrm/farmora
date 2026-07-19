import { useState } from "react";
import type { BalanceSheetFilterRequest, BalanceSheetResponse } from "../types";
import balanceSheet from "../api";

const useGetBalanceSheet = () => {
  const [balanceSheetData, setBalanceSheetData] =
    useState<BalanceSheetResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalanceSheet = async (filter: BalanceSheetFilterRequest) => {
    setIsLoading(true);
    setError(null);

    const {
      status,
      data,
      error: fetchError,
    } = await balanceSheet.fetchBalanceSheet(filter);

    if (status === "success" && data) {
      setBalanceSheetData(data);
    } else {
      setError(fetchError?.message || "Failed to fetch cash flow");
    }

    setIsLoading(false);
  };

  return {
    balanceSheetData,
    isLoading,
    error,
    fetchBalanceSheet,
  };
};

export default useGetBalanceSheet;
