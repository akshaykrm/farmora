import { useEffect, useState } from "react";
import type { PurchaseFormValues } from "../types";
import purchase from "../api";

const useGetPurchaseById = (selectedId: number | null) => {
  const [dataLoaded, setdataLoaded] = useState(false);
  const [selectedData, setSelectedData] = useState<PurchaseFormValues>({
    invoice_number: "",
    net_amount: 0,
    total_price: 0,
    quantity: 0,
    vendor_id: null,
    season_id: null,
    discount_price: 0,
    price_per_unit: 0,
    category_id: null,
    batch_id: null,
    assign_quantity: 0,
    invoice_date: "",
    payment_type: "credit",
  });

  useEffect(() => {
    const handleGetPurchaseById = async (id: number) => {
      const res = await purchase.fetchById(id);
      if (res.status === "success") {
        if (res.data) {
          const {
            vendor,
            category,
            season,
            batch,
            payment_type,
            net_amount,
            invoice_number,
            invoice_date,
            price_per_unit,
            discount_price,
            quantity,
            assign_quantity,
            total_price,
          } = res.data;

          setSelectedData({
            vendor_id: vendor.id,
            category_id: category.id,
            season_id: season.id,
            batch_id: batch.id,
            payment_type,
            net_amount,
            invoice_number,
            invoice_date,
            price_per_unit,
            discount_price,
            quantity,
            assign_quantity,
            total_price,
          });
          setdataLoaded(true);
        }
      }
    };

    if (selectedId) {
      handleGetPurchaseById(selectedId);
    }
  }, [selectedId]);

  return { dataLoaded, selectedData };
};

export default useGetPurchaseById;
