import generalCategory from "@api/general-category.api";
import type {
  GeneralCategory,
  GeneralCategoryKind,
} from "@app-types/general-category.types";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const EMPTY: GeneralCategory[] = [];

export const generalCategoryKey = (kind: GeneralCategoryKind) => [
  "general-category",
  kind,
];

const useGetGeneralCategories = (kind: GeneralCategoryKind) => {
  const queryClient = useQueryClient();
  const query = useQuery<GeneralCategory[]>({
    queryKey: generalCategoryKey(kind),
    queryFn: async () => {
      const res = await generalCategory.fetchAll(kind);
      return res.status === "success" && res.data ? res.data : EMPTY;
    },
  });

  return {
    data: query.data ?? EMPTY,
    refresh: () =>
      queryClient.invalidateQueries({ queryKey: generalCategoryKey(kind) }),
  };
};

export default useGetGeneralCategories;
