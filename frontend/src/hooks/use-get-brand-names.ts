import brands from "@api/brand.api";
import type { NameResponse } from "@app-types/gen.types";
import { useState, useEffect } from "react";

const useGetBrandNames = () => {
  const [state, setState] = useState<NameResponse[]>([]);

  useEffect(() => {
    brands
      .getNames()
      .then((data: NameResponse[]) => {
        setState(data);
      })
      .catch((err) => {
        console.log(err);
        setState([]);
      });
  }, []);

  return { data: state };
};

export default useGetBrandNames;
