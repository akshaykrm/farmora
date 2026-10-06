import { useEffect, useMemo, useState } from "react";
import type { Ref, SelectHTMLAttributes } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@mui/material";
import { Lock, Plus, Trash2 } from "lucide-react";
import setup from "@api/setup.api";
import type {
  SetupExtraItemType,
  SetupSystemItem,
  SetupSystemItemType,
} from "@app-types/setup.types";
import { itemTypes } from "@pages/items";
import { SetupInput, SetupSelect, StepLayout } from "./parts";
import { applyServerErrors } from "./helpers";
import type { StepProps } from "./types";

type SystemRow = {
  type: SetupSystemItemType;
  name: string;
  base_price: string;
};

type ExtraRow = {
  name: string;
  type: SetupExtraItemType | "";
  base_price: string;
  vendor_id: number | "";
};

type Values = {
  system: SystemRow[];
  extra: ExtraRow[];
};

const SYSTEM_TYPES: string[] = ["integration", "working", "general"];

const EXTRA_TYPE_OPTIONS = itemTypes.filter(
  (option) => !SYSTEM_TYPES.includes(option.value),
);

const QUICK_ADD: { name: string; type: SetupExtraItemType }[] = [
  { name: "Chicks", type: "chick" },
  { name: "Starter Feed", type: "STARTER" },
  { name: "Finisher Feed", type: "FINISHER" },
  { name: "Medicine", type: "medicine" },
];

const nameRule = (v: string | undefined) =>
  (v ?? "").trim().length >= 3 || "Enter a name (3+ characters).";

const priceRule = (v: string | undefined) =>
  ((v ?? "").trim() !== "" && Number(v) >= 0) || "Enter a price (0 or more).";

type Props = StepProps & { supplierId?: number };

const ItemsStep = ({ status, onNext, onBack, onSaved, supplierId }: Props) => {
  const [serverError, setServerError] = useState<string | null>(null);

  const systemItems: SetupSystemItem[] = useMemo(
    () =>
      status.systemItems ??
      (status.defaults.items ?? []).map((item) => ({
        ...item,
        id: null,
        exists: false,
      })),
    [status.systemItems, status.defaults.items],
  );

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["setup-supplier-names", supplierId],
    queryFn: setup.fetchSuppliers,
  });

  const defaultSupplier: number | "" =
    supplierId ?? status.existing?.supplier?.id ?? suppliers.at(0)?.id ?? "";

  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    mode: "onTouched",
    defaultValues: {
      system: systemItems.map((item) => ({
        type: item.type,
        name: item.name,
        base_price: String(item.base_price ?? 0),
      })),
      extra: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "extra" });

  useEffect(() => {
    if (defaultSupplier === "") return;
    getValues("extra").forEach((row, index) => {
      if (row.vendor_id === "")
        setValue(`extra.${index}.vendor_id`, defaultSupplier);
    });
  }, [defaultSupplier, getValues, setValue]);

  const addRow = (preset?: { name: string; type: SetupExtraItemType }) =>
    append({
      name: preset?.name ?? "",
      type: preset?.type ?? "",
      base_price: "0",
      vendor_id: defaultSupplier,
    });

  const extraNames = fields.map((field) => field.name.trim().toLowerCase());
  const noSupplier = !isLoading && suppliers.length === 0;

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const res = await setup.saveItems({
      system: values.system.map((row) => ({
        type: row.type,
        name: row.name.trim(),
        base_price: Number(row.base_price),
      })),
      extra: values.extra.map((row) => ({
        name: row.name.trim(),
        type: row.type as SetupExtraItemType,
        base_price: Number(row.base_price),
        vendor_id: Number(row.vendor_id),
      })),
    });

    if (res.status !== "success") {
      setServerError(
        applyServerErrors(res, setError, []) ?? "Could not save items.",
      );
      return;
    }

    const added = [
      ...values.system
        .filter((row) => !systemItems.find((s) => s.type === row.type)?.exists)
        .map((row) => row.name.trim()),
      ...values.extra.map((row) => row.name.trim()),
    ];
    onSaved(added.length ? `Items: ${added.join(", ")}` : "Items updated");
    onNext();
  });

  const extraCount = fields.length;

  return (
    <StepLayout
      title="Set up your items"
      description="Items are used when recording purchases and expenses. Adjust names and base prices as needed; you can change them any time."
      onSubmit={onSubmit}
      onBack={onBack}
      onSkip={onNext}
      saving={isSubmitting}
      serverError={serverError}
      submitLabel={
        extraCount
          ? `Save ${systemItems.length + extraCount} items and continue`
          : "Save items and continue"
      }
    >
      <fieldset className="flex flex-col gap-3 min-w-0">
        <legend className="text-sm font-semibold text-brand-ink mb-1">
          System items
        </legend>
        <p className="flex items-start gap-2 text-xs text-brand-ink-muted -mt-1">
          <Lock size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          Required for general expenses, working cost and integration book.
        </p>
        {systemItems.map((item, index) => (
          <div
            key={item.type}
            className="grid grid-cols-1 sm:grid-cols-[1fr_10rem] items-start gap-3 rounded-xl border border-brand-border-strong p-3"
          >
            <SetupInput
              label="Name"
              error={errors.system?.[index]?.name?.message}
              {...register(`system.${index}.name`, { validate: nameRule })}
            />
            <SetupInput
              label="Base price"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              error={errors.system?.[index]?.base_price?.message}
              {...register(`system.${index}.base_price`, {
                validate: priceRule,
              })}
            />
            {item.exists && (
              <p className="sm:col-span-2 text-xs text-brand-accent">
                Already added
              </p>
            )}
          </div>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-3 min-w-0">
        <legend className="text-sm font-semibold text-brand-ink mb-1">
          Other items{" "}
          <span className="font-normal text-brand-ink-muted">(optional)</span>
        </legend>

        {noSupplier ? (
          <p className="rounded-xl border border-brand-border bg-brand-canvas px-4 py-3 text-sm text-brand-ink-soft">
            Other items are bought from a supplier. Go back to the Vendors step
            to add one, or add these later from the Items page.
          </p>
        ) : (
          <>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="relative grid grid-cols-1 sm:grid-cols-2 items-start gap-3 rounded-xl border border-brand-border-strong p-3 pr-12"
              >
                <button
                  type="button"
                  onClick={() => remove(index)}
                  aria-label={`Remove ${field.name || "item"}`}
                  className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg text-brand-ink-muted hover:bg-brand-danger-soft hover:text-brand-danger focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-accent/25"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
                <SetupInput
                  label="Name"
                  error={errors.extra?.[index]?.name?.message}
                  {...register(`extra.${index}.name`, { validate: nameRule })}
                />
                <TypeSelect
                  label="Type"
                  error={errors.extra?.[index]?.type?.message}
                  {...register(`extra.${index}.type`, {
                    validate: (v) => v !== "" || "Choose a type.",
                  })}
                />
                <Controller
                  name={`extra.${index}.vendor_id`}
                  control={control}
                  rules={{ validate: (v) => v !== "" || "Choose a supplier." }}
                  render={({ field: f }) => (
                    <SetupSelect
                      label="Supplier"
                      ref={f.ref}
                      value={f.value}
                      onChange={f.onChange}
                      onBlur={f.onBlur}
                      options={suppliers}
                      error={errors.extra?.[index]?.vendor_id?.message}
                    />
                  )}
                />
                <SetupInput
                  label="Base price"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  error={errors.extra?.[index]?.base_price?.message}
                  {...register(`extra.${index}.base_price`, {
                    validate: priceRule,
                  })}
                />
              </div>
            ))}

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outlined"
                size="small"
                startIcon={<Plus size={16} aria-hidden="true" />}
                onClick={() => addRow()}
              >
                Add item
              </Button>
              {QUICK_ADD.map((preset) => {
                const added = extraNames.includes(preset.name.toLowerCase());
                return (
                  <button
                    key={preset.name}
                    type="button"
                    disabled={added}
                    onClick={() => addRow(preset)}
                    className="rounded-full border border-brand-border-strong px-3 py-1.5 text-xs font-medium text-brand-ink-soft hover:border-brand-accent hover:text-brand-accent disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-accent/25"
                  >
                    + {preset.name}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </fieldset>
    </StepLayout>
  );
};

type TypeSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  ref?: Ref<HTMLSelectElement>;
};

const TypeSelect = ({ label, error, ...selectProps }: TypeSelectProps) => (
  <div className="flex flex-col gap-1.5 min-w-0">
    <label className="flex flex-col gap-1.5 text-sm font-medium text-brand-ink-soft">
      {label}
      <select
        aria-invalid={error ? true : undefined}
        className={`w-full min-h-11 px-3 py-2.5 rounded-xl border bg-brand-card text-brand-ink font-normal outline-none focus-visible:ring-4 focus-visible:ring-brand-accent/25 focus-visible:border-brand-accent ${
          error ? "border-brand-danger" : "border-brand-border-strong"
        }`}
        {...selectProps}
      >
        <option value="">Select…</option>
        {EXTRA_TYPE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
    {error && <p className="text-xs text-brand-danger">{error}</p>}
  </div>
);

export default ItemsStep;
