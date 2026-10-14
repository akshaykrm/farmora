import { useMemo } from "react";
import { Autocomplete, Checkbox, TextField } from "@mui/material";
import type { NameResponse } from "@app-types/gen.types";

type Props = {
  name: string;
  label: string;
  options?: NameResponse[];
  value: number[];
  onChange: (ids: number[]) => void;
};

const MultiSelectList = ({
  name,
  label,
  options = [],
  value,
  onChange,
}: Props) => {
  const selected = useMemo(
    () => options.filter((option) => value.includes(option.id)),
    [options, value],
  );

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      limitTags={1}
      size="small"
      options={options}
      value={selected}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, current) => option.id === current.id}
      onChange={(_, values) => onChange(values.map((option) => option.id))}
      renderOption={(props, option, { selected: isSelected }) => {
        const { key, ...rest } = props;
        return (
          <li key={key} {...rest}>
            <Checkbox size="small" checked={isSelected} sx={{ mr: 1, p: 0 }} />
            {option.name}
          </li>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          name={name}
          label={label}
          size="small"
          fullWidth
        />
      )}
    />
  );
};

export default MultiSelectList;
