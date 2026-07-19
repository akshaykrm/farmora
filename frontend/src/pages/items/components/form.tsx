import SelectList from "@components/select-list";
import useGetVendorNames from "@hooks/use-get-vendor-name-list";
import { Stack, Button, MenuItem } from "@mui/material";
import { useForm, type DefaultValues } from "react-hook-form";
import type { ItemFormValues } from "../types";
import type { ValidationError } from "@errors/api.error";
import { useEffect } from "react";
import { itemTypes } from "..";
import { RHFTextField } from "@components/form/input";

type Props = {
  defaultValues: DefaultValues<ItemFormValues>;
  onSubmit: (payload: any) => void;
  apiError: ValidationError[];
  onCancel?: () => void;
};

const ItemForm = ({ onSubmit, defaultValues, apiError, onCancel }: Props) => {
  const methods = useForm<ItemFormValues>({
    defaultValues: defaultValues,
  });

  const {
    handleSubmit,
    watch,
    formState: { errors },
    setError,
    setValue,
    reset,
    control,
  } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues]);
  const sellerList = useGetVendorNames({ type: "supplier" });
  const vendorID = watch("vendor_id");

  useEffect(() => {
    if (apiError.length > 0) {
      apiError.forEach(({ name, message }) => {
        setError(name, { message });
      });
    }
  }, [apiError]);

  return (
    <>
      <form {...methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <RHFTextField
            label="Name"
            name="name"
            control={control}
            fullWidth
            size="small"
          />
          <RHFTextField
            label="Base Price"
            name="base_price"
            control={control}
            fullWidth
            size="small"
          />

          <SelectList
            label="Choose Vendor"
            name="vendor_id"
            options={sellerList.data}
            value={vendorID}
            onChange={(v) => setValue("vendor_id", v ? v : "")}
            error={Boolean(errors.vendor_id)}
            helperText={errors.vendor_id?.message}
          />

          <RHFTextField
            label="Type"
            name="type"
            control={control}
            fullWidth
            select
            size="small"
            value={watch("type")}
          >
            {itemTypes.map(({ label, value }) => {
              return <MenuItem value={value}>{label}</MenuItem>;
            })}
          </RHFTextField>
          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button variant="outlined" type="button" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button variant="contained" type="submit">
              Submit
            </Button>
          </div>
        </Stack>
      </form>
    </>
  );
};

export default ItemForm;
