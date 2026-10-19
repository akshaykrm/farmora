import { useState } from "react";
import { useForm } from "react-hook-form";
import setup from "@api/setup.api";
import type { SetupProfile } from "@app-types/setup.types";
import { SetupInput, StepLayout } from "./parts";
import { applyServerErrors, requiredText } from "./helpers";
import type { StepProps } from "./types";

const FIELDS: (keyof SetupProfile)[] = [
  "bird_capacity",
  "state",
  "district",
  "place",
  "pincode",
];

const ProfileStep = ({ status, onNext, onBack, onSaved }: StepProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SetupProfile>({
    mode: "onTouched",
    defaultValues: status.profile,
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const payload: SetupProfile = {
      bird_capacity: String(Number(values.bird_capacity)),
      state: values.state.trim(),
      district: values.district.trim(),
      place: values.place.trim(),
      pincode: values.pincode.trim(),
    };
    const res = await setup.updateProfileFarmDetails(payload);
    if (res.status === "success") {
      onSaved(`Profile details for ${payload.place}, ${payload.district}`);
      onNext();
      return;
    }
    setServerError(applyServerErrors(res, setError, FIELDS));
  });

  return (
    <StepLayout
      title="Your farm details"
      description="Tell us where your farm is and how many birds it holds. You can change this later from your profile."
      onSubmit={onSubmit}
      onBack={onBack}
      onSkip={onNext}
      saving={isSubmitting}
      serverError={serverError}
      done={status.items.profile}
    >
      <SetupInput
        label="Bird capacity"
        type="number"
        inputMode="numeric"
        min={1}
        suffix="birds"
        placeholder="How many birds can your farm hold?"
        error={errors.bird_capacity?.message}
        {...register("bird_capacity", {
          validate: (v) =>
            (String(v ?? "").trim() !== "" && Number(v) > 0) ||
            "Enter your bird capacity.",
        })}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SetupInput
          label="State"
          placeholder="e.g. Kerala"
          error={errors.state?.message}
          {...register("state", {
            validate: requiredText("Enter your state."),
          })}
        />
        <SetupInput
          label="District"
          placeholder="e.g. Alappuzha"
          error={errors.district?.message}
          {...register("district", {
            validate: requiredText("Enter your district."),
          })}
        />
        <SetupInput
          label="Place"
          placeholder="e.g. Kozhikode"
          error={errors.place?.message}
          {...register("place", {
            validate: requiredText("Enter your place."),
          })}
        />
        <SetupInput
          label="Pincode"
          inputMode="numeric"
          maxLength={6}
          placeholder="6-digit pincode"
          error={errors.pincode?.message}
          {...register("pincode", {
            validate: (v) =>
              /^\d{6}$/.test((v ?? "").trim()) || "Enter a 6-digit pincode.",
          })}
        />
      </div>
    </StepLayout>
  );
};

export default ProfileStep;
