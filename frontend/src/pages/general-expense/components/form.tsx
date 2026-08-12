import type { GeneralExpanceFormValues } from "@app-types/general-expense.types";
import { RHFTextField } from "@components/form/input";
import SelectList from "@components/select-list";
import type { ValidationError } from "@errors/api.error";
import useGetSeasonNames from "@hooks/use-get-season-names";
import { Button } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useForm, type DefaultValues } from "react-hook-form";

type Props = {
  onSubmit: (payload: any) => void;
  defaultValues: DefaultValues<GeneralExpanceFormValues>;
  apiErros: ValidationError[];
  onCancel?: () => void;
};

const GeneralExpenseForm = (props: Props) => {
  const { onSubmit, defaultValues, apiErros, onCancel } = props;
  const seasonNames = useGetSeasonNames({ status: "active" });

  const methods = useForm<GeneralExpanceFormValues>({
    defaultValues: defaultValues,
  });

  const {
    watch,
    setValue,
    handleSubmit,
    setError,
    formState: { errors },
    control,
    reset,
    clearErrors,
  } = methods;

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues]);

  useEffect(() => {
    if (apiErros.length > 0) {
      for (const error of apiErros) {
        setError(error.name, { message: error.message });
      }
    }
  }, [apiErros]);

  const values = watch();

  return (
    <>
      <form {...methods} onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 gap-4">
          <SelectList
            options={seasonNames.data}
            value={values.season_id}
            onChange={(val) => {
              setValue("season_id", val ? val : "");
              if (val) {
                clearErrors("season_id");
              }
            }}
            label="Season"
            name="season_id"
            error={Boolean(errors.season_id)}
            helperText={errors.season_id?.message}
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
            type="number"
            size="small"
          />

          <DatePicker
            label="Start Date"
            value={values.date ? dayjs(values.date) : null}
            format="DD-MM-YYYY"
            onChange={(v) => {
              setValue("date", v ? dayjs(v).toISOString() : "");
              clearErrors("date");
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                size: "small",
                error: Boolean(errors.date),
                helperText: errors.date?.message,
              },
            }}
          />

          <RHFTextField
            label="Narration"
            name="narration"
            control={control}
            fullWidth
            multiline
            rows={3}
            size="small"
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

export default GeneralExpenseForm;
