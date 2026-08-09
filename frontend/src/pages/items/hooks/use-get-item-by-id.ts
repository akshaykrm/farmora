import { useEffect, useState } from "react";
import type { ItemFormValues } from "../types";
import employee from "../api";

const defaultValues: ItemFormValues = {
  base_price: "",
  name: null,
  brand_id: "",
  type: "",
  vendor_id: "",
};

const useGetItemById = (selectedId: number | null) => {
  const [dataLoaded, setdataLoaded] = useState(false);
  const [selectedData, setSelectedData] =
    useState<ItemFormValues>(defaultValues);

  useEffect(() => {
    const handleGetItemById = async (id: number) => {
      const res = await employee.fetchById(id);
      if (res.status === "success") {
        if (res.data) {
          const { name, type, base_price, vendor_id, brand_id } = res.data;
          setSelectedData({
            name,
            type,
            base_price,
            vendor_id,
            brand_id: brand_id ?? "",
          });
          setdataLoaded(true);
        }
      }
    };

    if (selectedId) {
      handleGetItemById(selectedId);
    } else {
      setSelectedData(defaultValues);
    }
  }, [selectedId]);

  return { dataLoaded, selectedData };
};

export default useGetItemById;
