import type { GeneralCategoryKind } from "@app-types/general-category.types";
import SelectList from "@components/select-list";
import useGetGeneralCategories from "@hooks/use-get-general-categories";

type Props = {
  kind: GeneralCategoryKind;
  value: number | null;
  onChange: (v: number | null) => void;
};

const CategoryFilterSelect = ({ kind, value, onChange }: Props) => {
  const { data } = useGetGeneralCategories(kind);
  return (
    <SelectList
      options={data}
      value={value}
      onChange={onChange}
      label="Category"
      name="category_id"
    />
  );
};

export default CategoryFilterSelect;
