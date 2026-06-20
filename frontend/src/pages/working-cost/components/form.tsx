import { DatePicker } from "@mui/x-date-pickers";
import type { WorkingCostFormValues } from "../types";
import SelectList from "@components/select-list";
import useGetSeasonNames from "@hooks/use-get-season-names";
import { Button, MenuItem } from "@mui/material";
import { useForm, type DefaultValues } from "react-hook-form";
import { useEffect } from "react";
import { RHFTextField } from "@components/form/input";
import type { ValidationError } from "@errors/api.error";
import dayjs from "dayjs";

type Props = {
  defaultValues: DefaultValues<WorkingCostFormValues>;
  onSubmit: (payload: WorkingCostFormValues) => void;
  apiErrors: ValidationError[];
  onCancel?: () => void;
};

const WorkingCostForm = ({
  onSubmit,
  defaultValues,
  apiErrors,
  onCancel,
}: Props) => {
  const methods = useForm<WorkingCostFormValues>({
    defaultValues: defaultValues,
  });

  const {
    handleSubmit,
    control,
    setError,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (apiErrors.length > 0) {
      for (const error of apiErrors) {
        setError(error.name as keyof WorkingCostFormValues, {
          message: error.message,
        });
      }
    }
  }, [apiErrors, setError]);

  const seasonNames = useGetSeasonNames();
  const seasonId = watch("season_id");

  return (
    <>
      <form {...methods} onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4">
          <SelectList
            options={seasonNames.data}
            value={seasonId}
            onChange={(v) => setValue("season_id", v)}
            label="Season"
            name="season_id"
            helperText={errors.season_id?.message}
            error={Boolean(errors.season_id)}
          />

          <RHFTextField
            label="Purpose"
            name="purpose"
            control={control}
            fullWidth
            size="small"
          />

          <RHFTextField
            label="Amount"
            name="amount"
            control={control}
            fullWidth
            size="small"
            type="number"
          />

          <DatePicker
            label="Date"
            value={defaultValues.date ? dayjs(defaultValues.date) : dayjs()}
            format="DD-MM-YYYY"
            onChange={(v) => {
              setValue("date", dayjs(v).toISOString());
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
              },
            }}
          />
        </div>
        <div className="flex justify-end mt-6 gap-2">
          {onCancel && (
            <Button variant="outlined" type="button" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button variant="contained" type="submit">
            Submit
          </Button>
        </div>
      </form>
    </>
  );
};

export default WorkingCostForm;
