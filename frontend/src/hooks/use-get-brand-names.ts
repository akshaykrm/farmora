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

  const addBrand = (brand: NameResponse) => {
    setState((prev) => {
      if (prev.some((b) => b.id === brand.id)) return prev;
      return [...prev, brand].sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    });
  };

  return { data: state, addBrand };
};

export default useGetBrandNames;
