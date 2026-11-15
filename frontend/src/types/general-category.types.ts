export type GeneralCategoryKind = "expense" | "sale";

export type GeneralCategory = {
  id: number;
  name: string;
  type: GeneralCategoryKind;
  status: "active" | "inactive";
};

export type GeneralCategoryFormValues = {
  name: string;
  status: "active" | "inactive";
};
