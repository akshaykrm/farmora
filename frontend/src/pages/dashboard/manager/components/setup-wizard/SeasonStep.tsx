import { useState } from "react";
import { useForm } from "react-hook-form";
import seasons from "@pages/seasons/api";
import type { SeasonFormValues } from "@pages/seasons/types";
import { SetupInput, StepLayout } from "./parts";
import { applyServerErrors, requiredText } from "./helpers";
import type { StepProps } from "./types";

type Values = Omit<SeasonFormValues, "status">;

const SeasonStep = ({ status, onNext, onBack, onSaved }: StepProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    mode: "onTouched",
    defaultValues: status.defaults.season,
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const payload: SeasonFormValues = {
      name: values.name.trim(),
      from_date: values.from_date,
      to_date: values.to_date,
      status: "active",
    };
    const res = await seasons.create(payload);
    if (res.status === "success") {
      const seasonId = (res.data as { id?: number } | undefined)?.id;
      onSaved(`Season "${payload.name}"`, { seasonId });
      onNext();
      return;
    }
    setServerError(
      applyServerErrors(res, setError, ["name", "from_date", "to_date"]),
    );
  });

  return (
    <StepLayout
      title="Create a season"
      description="Seasons group your batches for reporting, for example one per year."
      onSubmit={onSubmit}
      onBack={onBack}
      onSkip={onNext}
      saving={isSubmitting}
      serverError={serverError}
      done={status.items.season}
    >
      <SetupInput
        label="Season name"
        placeholder="e.g. Season 2026"
        error={errors.name?.message}
        {...register("name", {
          validate: requiredText("Enter a season name (3+ characters).", 3),
        })}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SetupInput
          label="Start date"
          type="date"
          error={errors.from_date?.message}
          {...register("from_date", {
            validate: requiredText("Choose a start date."),
          })}
        />
        <SetupInput
          label="End date"
          type="date"
          error={errors.to_date?.message}
          {...register("to_date", {
            validate: (v) =>
              !v
                ? "Choose an end date."
                : v > getValues("from_date") ||
                  "End date must be after the start date.",
          })}
        />
      </div>
    </StepLayout>
  );
};

export default SeasonStep;
