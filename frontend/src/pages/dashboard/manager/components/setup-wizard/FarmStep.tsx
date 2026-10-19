import { useState } from "react";
import { useForm } from "react-hook-form";
import farms from "@pages/farms/api";
import type { FarmFormValues } from "@pages/farms/types";
import { SetupInput, StepLayout } from "./parts";
import { applyServerErrors, requiredText } from "./helpers";
import type { StepProps } from "./types";

const FarmStep = ({ status, onNext, onBack, onSaved }: StepProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FarmFormValues>({
    mode: "onTouched",
    defaultValues: status.defaults.farm,
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const payload: FarmFormValues = {
      name: values.name.trim(),
      place: values.place.trim(),
      capacity: values.capacity.trim(),
    };
    const res = await farms.create(payload);
    if (res.status === "success") {
      const farmId = (res.data as { id?: number } | undefined)?.id;
      onSaved(`Farm "${payload.name}"`, { farmId });
      onNext();
      return;
    }
    setServerError(
      applyServerErrors(res, setError, ["name", "place", "capacity"]),
    );
  });

  return (
    <StepLayout
      title="Add your farm"
      description="Every batch belongs to a farm. We've filled in a suggestion you can change."
      onSubmit={onSubmit}
      onBack={onBack}
      onSkip={onNext}
      saving={isSubmitting}
      serverError={serverError}
      done={status.items.farm}
    >
      <SetupInput
        label="Farm name"
        placeholder="e.g. Green Valley Farm"
        error={errors.name?.message}
        {...register("name", {
          validate: requiredText("Enter a farm name (3+ characters).", 3),
        })}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SetupInput
          label="Place"
          placeholder="e.g. Kozhikode"
          {...register("place")}
        />
        <SetupInput
          label="Capacity"
          inputMode="numeric"
          suffix="birds"
          placeholder="e.g. 5000"
          {...register("capacity")}
        />
      </div>
    </StepLayout>
  );
};

export default FarmStep;
