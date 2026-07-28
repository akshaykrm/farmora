import type { GeneralSalesFormValues } from "@app-types/general-sales.types";
import SelectList from "@components/select-list";
import useGetSeasonNames from "@hooks/use-get-season-names";
import { TextField, Button } from "@mui/material";
import { useForm, type DefaultValues } from "react-hook-form";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import type { ValidationError } from "@errors/api.error";
import { useEffect } from "react";

type Props = {
  defaultValues: DefaultValues<GeneralSalesFormValues>;
  onSubmit: (payload: any) => void;
  apiError: ValidationError[];
  onCancel?: () => void;
};

const GeneralSalesForm = (props: Props) => {
  const { onSubmit, onCancel, defaultValues, apiError } = props;
  const seasonNames = useGetSeasonNames();

  const methods = useForm({ defaultValues });

  const {
    watch,
    setValue,
    handleSubmit,
    register,
    setError,
    formState: { errors },
    clearErrors,
  } = methods;

  const values = watch();

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
        <div className="grid grid-cols-1 gap-4">
          <SelectList
            options={seasonNames.data}
            value={values.season_id}
            onChange={(val) => {
              (setValue as any)("season_id", val);
            }}
            label="Season"
            name="season_id"
            error={Boolean(errors.season_id)}
            helperText={errors.season_id?.message}
          />

          <TextField
            label="Purpose"
            {...(register as any)("purpose")}
            fullWidth
            error={Boolean(errors.purpose)}
            helperText={errors.purpose?.message}
            size="small"
          />

          <TextField
            label="Amount"
            {...(register as any)("amount")}
            fullWidth
            type="number"
            error={Boolean(errors.amount)}
            helperText={errors.amount?.message}
            size="small"
          />

          <DatePicker
            label="Date"
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

          <TextField
            label="Narration"
            {...(register as any)("narration")}
            fullWidth
            multiline
            rows={3}
            error={Boolean(errors.narration)}
            helperText={errors.narration?.message}
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

export default GeneralSalesForm;
