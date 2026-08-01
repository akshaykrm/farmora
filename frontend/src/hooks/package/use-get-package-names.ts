import type { NameResponse } from "@app-types/gen.types";
import useGetNames from "@hooks/use-get-names";
import fetcher from "@utils/fetcher";

export type PackageName = {
  id: number;
  name: string;
};

const useGetPackageNames = () => {
  const query = useGetNames<PackageName[]>({
    queryFn: async (): Promise<NameResponse[]> => {
      const data = await fetcher("packages/names");
      return data;
    },

    queryKey: "package:names",
  });

  return query;
};

export default useGetPackageNames;
