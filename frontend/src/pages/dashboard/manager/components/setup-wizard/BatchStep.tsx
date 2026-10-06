import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import farms from "@pages/farms/api";
import seasons from "@pages/seasons/api";
import batches from "@pages/batches/api";
import type { BatchFormValues } from "@pages/batches/types";
import { SetupInput, SetupSelect, StepLayout } from "./parts";
import { applyServerErrors, requiredText } from "./helpers";
import type { StepProps } from "./types";

type NameOption = { id: number; name: string };

type Props = StepProps & {
  farmId?: number;
  seasonId?: number;
};

const BatchStep = ({
  status,
  onNext,
  onBack,
  onSaved,
  farmId,
  seasonId,
}: Props) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const done = status.items.batch;

  const { data: farmOptions = [] } = useQuery<NameOption[]>({
    queryKey: ["setup-farm-names", farmId],
    queryFn: () => farms.getNames(),
    enabled: !done,
  });
  const { data: seasonOptions = [] } = useQuery<NameOption[]>({
    queryKey: ["setup-season-names", seasonId],
    queryFn: () => seasons.getNames({ status: "active" }),
    enabled: !done,
  });

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<BatchFormValues>({
    mode: "onTouched",
    defaultValues: {
      name: status.defaults.batch.name,
      farm_id: farmId ?? status.existing.farm?.id ?? "",
      season_id: seasonId ?? status.existing.season?.id ?? "",
      status: "active",
    },
  });

  useEffect(() => {
    if (getValues("farm_id") === "" && farmOptions.length) {
      setValue("farm_id", farmOptions[0].id);
    }
    if (getValues("season_id") === "" && seasonOptions.length) {
      setValue("season_id", seasonOptions[0].id);
    }
  }, [farmOptions, seasonOptions, getValues, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const payload: BatchFormValues = {
      ...values,
      name: values.name.trim(),
      status: "active",
    };
    const res = await batches.create(payload);
    if (res.status === "success") {
      onSaved(`Batch "${payload.name}"`);
      onNext();
      return;
    }
    setServerError(
      applyServerErrors(res, setError, ["name", "farm_id", "season_id"]),
    );
  });

  const missingParents =
    !done && (!farmOptions.length || !seasonOptions.length);

  return (
    <StepLayout
      title="Start your first batch"
      description="A batch is one flock you raise on a farm during a season. Purchases and sales are recorded against it."
      onSubmit={onSubmit}
      onBack={onBack}
      onSkip={onNext}
      saving={isSubmitting}
      serverError={serverError}
      done={done}
    >
      {missingParents && (
        <p className="rounded-xl border border-brand-border bg-brand-canvas px-4 py-3 text-sm text-brand-ink-soft">
          A batch needs a farm and a season. Go back to add them, or skip this
          step for now.
        </p>
      )}
      <SetupInput
        label="Batch name"
        placeholder="e.g. Batch 1"
        error={errors.name?.message}
        {...register("name", {
          validate: requiredText("Enter a batch name (3+ characters).", 3),
        })}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Controller
          name="farm_id"
          control={control}
          rules={{ validate: (v) => v !== "" || "Choose a farm." }}
          render={({ field }) => (
            <SetupSelect
              label="Farm"
              ref={field.ref}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              options={farmOptions}
              error={errors.farm_id?.message}
            />
          )}
        />
        <Controller
          name="season_id"
          control={control}
          rules={{ validate: (v) => v !== "" || "Choose a season." }}
          render={({ field }) => (
            <SetupSelect
              label="Season"
              ref={field.ref}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              options={seasonOptions}
              error={errors.season_id?.message}
            />
          )}
        />
      </div>
    </StepLayout>
  );
};

export default BatchStep;
