import SelectList from "@components/select-list";
import useGetBatchNameList from "@hooks/use-get-batch-names";
import useGetSeasonNames from "@hooks/use-get-season-names";
import { TextField, Button, InputAdornment } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import useGetVendorNames from "@hooks/use-get-vendor-name-list";
import IncompleteInvoiceToggle from "@components/incomplete-invoice-toggle";
import { formatCurrency } from "@utils/currency";

type Props = {
  methods: any;
  onSubmit: (payload: any) => void;
  onCancel?: () => void;
};

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <section className="rounded-lg border border-brand-border p-4">
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-brand-ink">{title}</h3>
      {description && (
        <p className="text-xs text-brand-ink-muted">{description}</p>
      )}
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 [&>*]:min-w-0">
      {children}
    </div>
  </section>
);

const SummaryItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col">
    <span className="text-[11px] uppercase tracking-wider text-brand-ink-muted">
      {label}
    </span>
    <span className="text-lg font-semibold text-brand-ink">{value}</span>
  </div>
);

const SaleForm = ({ methods, onSubmit, onCancel }: Props) => {
  const {
    handleSubmit,
    setValue,
    formState: { errors },
    clearErrors,
  } = methods;
  const err = errors as Record<string, { message?: string } | undefined>;

  const values = methods.watch();

  const seasonNames = useGetSeasonNames({ status: "active" });
  const batchNames = useGetBatchNameList({
    status: "active",
    season_id: values.season_id,
  });
  const buyersList = useGetVendorNames({ type: "customer" });

  const weight = parseFloat(values.weight) || 0;
  const birds = parseFloat(values.bird_no) || 0;
  const price = parseFloat(values.price) || 0;
  const averageWeight = birds > 0 ? weight / birds : 0;
  const amount = price * weight;

  const textProps = (name: string) => ({
    name,
    fullWidth: true,
    size: "small" as const,
    error: Boolean(err[name]),
    helperText: err[name]?.message,
  });

  const numberField = (
    name: string,
    label: string,
    unit: string,
    opts: { integer?: boolean; required?: boolean } = {},
  ) => (
    <TextField
      {...textProps(name)}
      label={label}
      required={opts.required}
      type="number"
      placeholder="0"
      value={values[name] === 0 ? "" : (values[name] ?? "")}
      onFocus={(e) => e.target.select()}
      onWheel={(e) => (e.target as HTMLInputElement).blur()}
      slotProps={{
        input: {
          endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
        },
        htmlInput: { min: 0, step: opts.integer ? 1 : "any" },
      }}
      onChange={(e) => {
        const { value } = e.target;
        setValue(name, value === "" ? "" : parseFloat(value));
        clearErrors(name);
      }}
    />
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4">
        <Section
          title="Sale Details"
          description="Who bought, and for which batch"
        >
          <SelectList
            options={seasonNames.data || []}
            value={values.season_id}
            onChange={(val) => {
              setValue("season_id", val);
              setValue("batch_id", null);
              clearErrors("season_id");
            }}
            label="Season *"
            name="season_id"
            error={Boolean(err.season_id)}
            helperText={err.season_id?.message}
          />
          <SelectList
            options={batchNames.data || []}
            value={values.batch_id}
            onChange={(val) => {
              setValue("batch_id", val);
              clearErrors("batch_id");
            }}
            label="Batch *"
            name="batch_id"
            error={Boolean(err.batch_id)}
            helperText={err.batch_id?.message}
          />
          <DatePicker
            label="Sale Date *"
            name="date"
            value={values.date ? dayjs(values.date) : null}
            format="DD-MM-YYYY"
            onChange={(v) => {
              setValue("date", v ? dayjs(v).toISOString() : "");
              clearErrors("date");
            }}
            slotProps={{
              textField: {
                fullWidth: true,
                error: Boolean(err.date),
                helperText: err.date?.message,
                size: "small",
              },
            }}
          />
          <SelectList
            options={buyersList.data}
            value={values.buyer_id}
            onChange={(val) => {
              setValue("buyer_id", val);
              clearErrors("buyer_id");
            }}
            label="Customer *"
            name="buyer_id"
            error={Boolean(err.buyer_id)}
            helperText={err.buyer_id?.message}
          />
          <TextField
            {...textProps("vehicle_no")}
            label="Vehicle Number (optional)"
            value={values.vehicle_no ?? ""}
            onChange={(e) => {
              setValue("vehicle_no", e.target.value.toUpperCase());
              clearErrors("vehicle_no");
            }}
          />
        </Section>

        <Section title="Load & Pricing" description="Totals update as you type">
          {numberField("weight", "Total Weight", "kg", { required: true })}
          {numberField("bird_no", "Number of Birds", "birds", {
            integer: true,
            required: true,
          })}
          {numberField("price", "Price per kg", "₹")}
          <div className="rounded-md bg-brand-canvas border border-brand-border px-4 py-2 grid grid-cols-2 gap-4 items-center">
            <SummaryItem
              label="Avg weight"
              value={`${averageWeight.toFixed(2)} kg`}
            />
            <SummaryItem label="Net amount" value={formatCurrency(amount)} />
          </div>
        </Section>

        <Section title="Notes">
          <TextField
            label="Payment Type"
            size="small"
            fullWidth
            disabled
            value={values.payment_type === "cash" ? "Cash" : "Credit"}
          />
          <TextField
            {...textProps("narration")}
            label="Narration (optional)"
            value={values.narration ?? ""}
            multiline
            rows={2}
            className="md:col-span-2"
            onChange={(e) => {
              setValue("narration", e.target.value);
              clearErrors("narration");
            }}
          />
          <IncompleteInvoiceToggle
            checked={Boolean(values.is_incomplete)}
            onChange={(checked) => setValue("is_incomplete", checked)}
          />
        </Section>
      </div>

      <div className="sticky bottom-0 -mx-1 mt-4 flex justify-end gap-2 bg-brand-card px-1 pt-3">
        {onCancel && (
          <Button variant="outlined" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button variant="contained" type="submit">
          Save Sale
        </Button>
      </div>
    </form>
  );
};

export default SaleForm;
