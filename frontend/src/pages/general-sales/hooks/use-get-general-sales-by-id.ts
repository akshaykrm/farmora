import generalSales from "@api/general-sales.api";
import type { GeneralSalesFormValues } from "@app-types/general-sales.types";
import { useEffect, useState } from "react";

function useGetGeneralSalesById(selectedId: number | null) {
  const [dataLoaded, setdataLoaded] = useState(false);
  const [selectedData, setSelectedData] = useState<GeneralSalesFormValues>({
    amount: 0,
    purpose: "",
    date: null,
    season_id: null,
    narration: "",
  });

  useEffect(() => {
    const handleGetGeneralSalesById = async (id: number) => {
      const res = await generalSales.fetchById(id);
      if (res.status === "success") {
        if (res.data) {
          const { amount, purpose, season_id, narration, date } = res.data;
          setSelectedData({
            amount,
            purpose,
            date,
            season_id,
            narration,
          });
        }
      }
      setdataLoaded(true);
    };

    if (selectedId) {
      handleGetGeneralSalesById(selectedId);
    }
  }, [selectedId]);

  return { selectedData, dataLoaded };
}

export default useGetGeneralSalesById;
