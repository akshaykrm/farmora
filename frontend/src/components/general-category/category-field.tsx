import type { GeneralCategoryKind } from "@app-types/general-category.types";
import SelectList from "@components/select-list";
import useGetGeneralCategories from "@hooks/use-get-general-categories";
import { useMemo, useState } from "react";
import ManageCategoriesDialog from "./manage-categories-dialog";

type Props = {
  kind: GeneralCategoryKind;
  value: number | "" | null;
  onChange: (v: number | null) => void;
  error?: boolean;
  helperText?: string;
};

const CategoryField = ({ kind, value, onChange, error, helperText }: Props) => {
  const { data } = useGetGeneralCategories(kind);
  const [isManaging, setManaging] = useState(false);

  // inactive categories stay selectable only when already chosen
  const options = useMemo(
    () => data.filter((c) => c.status === "active" || c.id === value),
    [data, value],
  );

  return (
    <div>
      <SelectList
        options={options}
        value={value}
        onChange={onChange}
        label="Category"
        name="category_id"
        error={error}
        helperText={helperText}
      />
      <button
        type="button"
        className="mt-1 text-xs text-brand-ink-soft hover:text-brand-ink underline"
        onClick={() => setManaging(true)}
      >
        Manage categories
      </button>
      <ManageCategoriesDialog
        kind={kind}
        isOpen={isManaging}
        onClose={() => setManaging(false)}
      />
    </div>
  );
};

export default CategoryField;
