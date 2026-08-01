import vendors from "@pages/vendors/api";
import type { VendorName } from "@pages/vendors/types";
import { useState, useEffect } from "react";

const useGetBuyerNameList = () => {
  const [state, setState] = useState<VendorName[]>([]);

  useEffect(() => {
    vendors
      .getNames()
      .then((data: VendorName[]) => {
        setState(data.filter(({ vendor_type }) => vendor_type === "supplier"));
      })
      .catch((err) => {
        console.log(err);
        setState([]);
      });
  }, []);

  return { data: state };
};

export default useGetBuyerNameList;
