import type {
  GeneralCategory,
  GeneralCategoryFormValues,
  GeneralCategoryKind,
} from "@app-types/general-category.types";
import fetcher from "@utils/fetcher";
import fetcherV2 from "@utils/fetcherV2";

export const categoryBasePath = (kind: GeneralCategoryKind) =>
  kind === "expense" ? "general-expenses/categories" : "general-sales/categories";

const generalCategory = {
  fetchAll: (kind: GeneralCategoryKind, status?: "active" | "inactive") =>
    fetcherV2<GeneralCategory[]>(categoryBasePath(kind), null, {
      method: "GET",
      filter: { status },
    }),
  create: (kind: GeneralCategoryKind, payload: GeneralCategoryFormValues) =>
    fetcherV2<GeneralCategory>(categoryBasePath(kind), JSON.stringify(payload), {
      method: "POST",
    }),
  updateById: (
    kind: GeneralCategoryKind,
    id: number,
    payload: GeneralCategoryFormValues,
  ) =>
    fetcherV2<GeneralCategory>(
      `${categoryBasePath(kind)}/${id}`,
      JSON.stringify(payload),
      { method: "PUT" },
    ),
  // DELETE answers 204 with no body, which fetcherV2 cannot parse
  deleteById: (kind: GeneralCategoryKind, id: number) =>
    fetcher(`${categoryBasePath(kind)}/${id}`, null, { method: "DELETE" }),
};

export default generalCategory;
