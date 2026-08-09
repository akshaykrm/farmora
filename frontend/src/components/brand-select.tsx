import { useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import {
  createFilterOptions,
  type FilterOptionsState,
} from "@mui/material/Autocomplete";
import brands from "@api/brand.api";
import type { NameResponse } from "@app-types/gen.types";

const CREATE_ID = -1;

type Props = {
  label: string;
  name: string;
  value: number | "" | null;
  options: NameResponse[];
  onChange: (v: number | null) => void;
  onBrandCreated: (brand: NameResponse) => void;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
};

const filterOptions = createFilterOptions<NameResponse>();

const BrandSelect = ({
  label,
  name,
  value,
  options,
  onChange,
  onBrandCreated,
  error,
  helperText,
  disabled,
}: Props) => {
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const selected = options.find((option) => option.id === value) || null;

  const handleCreate = async (nameInput: string) => {
    const brandName = nameInput.trim();
    if (!brandName) return;

    setCreating(true);
    setCreateError(null);
    try {
      const created = (await brands.create(brandName)) as NameResponse;
      onBrandCreated(created);
      onChange(created.id);
    } catch (err) {
      setCreateError(
        err instanceof Error ? err.message : "Failed to create brand",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleFilterOptions = (
    list: NameResponse[],
    params: FilterOptionsState<NameResponse>,
  ) => {
    const filtered = filterOptions(list, params);
    const query = params.inputValue.trim();
    if (!query) return filtered;

    const exists = list.some(
      (option) =>
        option.name.toLowerCase() === query.toLowerCase(),
    );
    if (!exists) {
      filtered.push({ id: CREATE_ID, name: query });
    }
    return filtered;
  };

  return (
    <Autocomplete
      options={options}
      value={selected}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, optionValue) =>
        option.id === optionValue.id
      }
      onChange={(_, value) => {
        if (!value) {
          onChange(null);
          return;
        }
        if (value.id === CREATE_ID) {
          handleCreate(value.name);
          return;
        }
        onChange(value.id);
      }}
      filterOptions={handleFilterOptions}
      renderOption={(props, option) => (
        <li {...props}>
          {option.id === CREATE_ID
            ? `+ Create "${option.name}"`
            : option.name}
        </li>
      )}
      disabled={disabled || creating}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          name={name}
          size="small"
          fullWidth
          error={error || Boolean(createError)}
          helperText={createError || helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {creating ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default BrandSelect;
