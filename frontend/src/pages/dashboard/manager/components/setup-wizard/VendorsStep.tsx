import { useState } from "react";
import { useForm } from "react-hook-form";
import vendors from "@api/vendor.api";
import { SetupInput, StepLayout } from "./parts";
import { requiredText } from "./helpers";
import type { StepProps } from "./types";

type VendorValues = { name: string; address: string; opening_balance: string };
type Values = { supplier: VendorValues; customer: VendorValues };
type VendorType = keyof Values;

const balanceRule = (v: string | undefined) =>
  ((v ?? "").trim() !== "" && Number.isFinite(Number(v))) ||
  "Enter an opening balance (0 if none).";

const VendorsStep = ({ status, onNext, onBack, onSaved }: StepProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [savedTypes, setSavedTypes] = useState<VendorType[]>([]);
  const needs: Record<VendorType, boolean> = {
    supplier: !status.items.suppliers,
    customer: !status.items.customers,
  };
  const types = (Object.keys(needs) as VendorType[]).filter((t) => needs[t]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    mode: "onTouched",
    defaultValues: {
      supplier: status.defaults.supplier,
      customer: status.defaults.customer,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    for (const type of types) {
      if (savedTypes.includes(type)) continue;
      const vendor = values[type];
      try {
        const createdVendor: { id?: number } | undefined = await vendors.create(
          {
            name: vendor.name.trim(),
            address: vendor.address.trim(),
            opening_balance: Number(vendor.opening_balance).toFixed(2),
            vendor_type: type,
          },
        );
        setSavedTypes((prev) => [...prev, type]);
        onSaved(
          `${type === "supplier" ? "Supplier" : "Customer"} "${vendor.name.trim()}"`,
          type === "supplier" ? { supplierId: createdVendor?.id } : undefined,
        );
      } catch (error) {
        setServerError(
          error instanceof Error
            ? error.message
            : "Could not save. Please try again.",
        );
        return;
      }
    }
    onNext();
  });

  const renderVendor = (type: VendorType, heading: string, hint: string) => (
    <fieldset className="flex flex-col gap-3 rounded-xl border border-brand-border p-4 min-w-0">
      <legend className="px-1 text-sm font-semibold text-brand-ink">
        {heading}
      </legend>
      <p className="text-xs text-brand-ink-muted -mt-1">{hint}</p>
      <SetupInput
        label="Name"
        error={errors[type]?.name?.message}
        {...register(`${type}.name`, {
          validate: requiredText("Enter a name (3+ characters).", 3),
        })}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <SetupInput
          label="Address"
          error={errors[type]?.address?.message}
          {...register(`${type}.address`, {
            validate: requiredText("Enter an address (use - if unknown)."),
          })}
        />
        <SetupInput
          label="Opening balance"
          inputMode="decimal"
          error={errors[type]?.opening_balance?.message}
          {...register(`${type}.opening_balance`, { validate: balanceRule })}
        />
      </div>
    </fieldset>
  );

  return (
    <StepLayout
      title="Add a supplier and a customer"
      description="Suppliers are who you buy chicks, feed and medicine from. Customers are who you sell to."
      onSubmit={onSubmit}
      onBack={onBack}
      onSkip={onNext}
      saving={isSubmitting}
      serverError={serverError}
      done={types.length === 0}
    >
      {needs.supplier &&
        renderVendor(
          "supplier",
          "Supplier",
          "For example your feed or chick supplier.",
        )}
      {needs.customer &&
        renderVendor(
          "customer",
          "Customer",
          "For example a trader or walk-in buyers.",
        )}
    </StepLayout>
  );
};

export default VendorsStep;
