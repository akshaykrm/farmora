import vendors from "@pages/vendors/api";
import type { VendorName, VendorNamesFilter } from "@pages/vendors/types";
import { useState, useEffect } from "react";

const useGetVendorNames = (filter?: VendorNamesFilter) => {
  const [state, setState] = useState<VendorName[]>([]);

  useEffect(() => {
    vendors
      .getNames(filter)
      .then((data: VendorName[]) => {
        setState(data);
      })
      .catch((err) => {
        console.log(err);
        setState([]);
      });
  }, []);

  return { data: state };
};

export default useGetVendorNames;
