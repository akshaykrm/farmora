import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Check, CircleCheck, X } from "lucide-react";
import { useNavigate } from "react-router";
import auth from "@api/auth.api";
import type { ManagerRegistrationPayload } from "@app-types/auth.types";
import { BASIC_FEATURES } from "../content/landing-content";
import {
  digitsOnly,
  passwordStrength,
  validators,
} from "./registration-validation";
import "./registration-flow.css";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  packageId: number;
  packageName: string;
};

type FormValues = {
  name: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  referral_code: string;
  bird_capacity: string;
  state: string;
  district: string;
  place: string;
  pincode: string;
};

type FieldName = keyof FormValues;
type ValidatedField = keyof typeof validators;

const STEP_1_FIELDS: ValidatedField[] = [
  "name",
  "email",
  "phone",
  "username",
  "password",
];
const STEP_2_FIELDS: ValidatedField[] = [
  "bird_capacity",
  "state",
  "district",
  "place",
  "pincode",
];

const DEFAULT_VALUES: FormValues = {
  name: "",
  email: "",
  phone: "",
  username: "",
  password: "",
  referral_code: "",
  bird_capacity: "",
  state: "",
  district: "",
  place: "",
  pincode: "",
};

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

const ManagerRegistrationDialog = ({
  isOpen,
  onClose,
  packageId,
  packageName,
}: Props) => {
  const navigate = useNavigate();
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;

  const [step, setStep] = useState<1 | 2>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<"skipped" | "complete" | null>(null);
  const [skipped, setSkipped] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const {
    register,
    control,
    trigger,
    getValues,
    getFieldState,
    setFocus,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: DEFAULT_VALUES,
  });

  const password = watch("password");
  const strength = passwordStrength(password ?? "");

  const mutation = useMutation({
    mutationFn: (variables: {
      payload: ManagerRegistrationPayload;
      skipped: boolean;
    }) => auth.registerManager(variables.payload),
    onSuccess: (_data, variables) => {
      setSubmitError(null);
      setResult(variables.skipped ? "skipped" : "complete");
    },
    onError: (error: unknown) => {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.",
      );
    },
  });

  const resetFlow = () => {
    reset(DEFAULT_VALUES);
    setStep(1);
    setShowPassword(false);
    setShowReferral(false);
    setSubmitError(null);
    setResult(null);
    setSkipped(false);
    mutation.reset();
  };

  const handleClose = () => {
    if (mutation.isPending) return;
    resetFlow();
    onClose();
  };

  const goToLogin = () => {
    resetFlow();
    onClose();
    navigate("/login");
  };

  useEffect(() => {
    if (!isOpen) return;
    openerRef.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      openerRef.current?.focus?.();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (result) {
      successHeadingRef.current?.focus();
      return;
    }
    setFocus(step === 1 ? "name" : "bird_capacity");
  }, [isOpen, step, result, setFocus]);

  const revalidateIfInvalid = (name: FieldName) => {
    if (getFieldState(name).error) void trigger(name);
  };

  const describedBy = (name: FieldName, extra?: string) =>
    [errors[name] ? id(`${name}-error`) : null, extra]
      .filter(Boolean)
      .join(" ") || undefined;

  const a11y = (name: FieldName, extra?: string) => ({
    id: id(name),
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": describedBy(name, extra),
  });

  const field = (name: ValidatedField) => ({
    ...register(name, {
      validate: validators[name],
      onChange: () => revalidateIfInvalid(name),
    }),
    ...a11y(name),
  });

  const errorText = (name: FieldName) =>
    errors[name] ? (
      <p id={id(`${name}-error`)} className="rf-error">
        {errors[name]?.message}
      </p>
    ) : null;

  const validateStep = async (fields: ValidatedField[]) => {
    const ok = await trigger(fields);
    if (!ok) {
      const firstInvalid = fields.find((name) => getFieldState(name).invalid);
      if (firstInvalid) setFocus(firstInvalid);
    }
    return ok;
  };

  const submit = (skipFarm: boolean) => {
    const values = getValues();
    const farm = {
      bird_capacity: values.bird_capacity.trim()
        ? String(Number(values.bird_capacity))
        : "",
      state: values.state.trim(),
      district: values.district.trim(),
      place: values.place.trim(),
      pincode: values.pincode.trim(),
    };
    const noFarmDetails =
      skipFarm || Object.values(farm).every((value) => value === "");
    setSkipped(skipFarm);
    setSubmitError(null);

    const payload: ManagerRegistrationPayload = {
      name: values.name.trim(),
      username: values.username.trim(),
      email: values.email.trim(),
      phone: digitsOnly(values.phone),
      password: values.password,
      referral_code: values.referral_code.trim().toUpperCase(),
      status: 1,
      package_id: packageId,
      bird_capacity: skipFarm ? "" : farm.bird_capacity,
      state: skipFarm ? "" : farm.state,
      district: skipFarm ? "" : farm.district,
      place: skipFarm ? "" : farm.place,
      pincode: skipFarm ? "" : farm.pincode,
    };

    mutation.mutate({ payload, skipped: noFarmDetails });
  };

  const handleContinue = async () => {
    if (await validateStep(STEP_1_FIELDS)) setStep(2);
  };

  const handleCreateAccount = async () => {
    if (mutation.isPending) return;
    if (await validateStep(STEP_2_FIELDS)) submit(false);
  };

  const handleSkip = () => {
    if (mutation.isPending) return;
    submit(true);
  };

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step === 1) void handleContinue();
    else void handleCreateAccount();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      handleClose();
      return;
    }
    if (event.key !== "Tab" || !cardRef.current) return;
    const focusables = Array.from(
      cardRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  if (!isOpen) return null;

  const titleId = id("title");
  const pending = mutation.isPending;

  return (
    <div className="reg-flow" onKeyDown={handleKeyDown}>
      <div
        ref={cardRef}
        className="rf-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <aside className="rf-aside">
          <span className="rf-brand">
            <span className="rf-brand-dot" aria-hidden="true" />
            Farm Management
          </span>
          <h2>Run your farm from one place</h2>
          <p className="rf-aside-copy">
            Track batches, feed, expenses and sales for every poultry farm you
            manage. Profit and loss, cost per kg and reports update as you go,
            so you always know where each batch stands.
          </p>
          <section className="rf-package" aria-label="Basic package">
            <div className="rf-package-head">
              <h3 className="rf-package-title">Basic package</h3>
              {packageName && (
                <span className="rf-package-badge">{packageName}</span>
              )}
            </div>
            <ul>
              {BASIC_FEATURES.map((feature) => (
                <li key={feature}>
                  <Check size={14} aria-hidden="true" />
                  {feature}
                </li>
              ))}
            </ul>
          </section>
        </aside>

        <div className="rf-main">
          <button
            type="button"
            className="rf-close"
            onClick={handleClose}
            disabled={pending}
            aria-label="Close registration"
          >
            <X size={20} aria-hidden="true" />
          </button>

          {result ? (
            <div className="rf-success" role="status">
              <span className="rf-success-icon" aria-hidden="true">
                <CircleCheck size={30} />
              </span>
              <h2
                id={titleId}
                ref={successHeadingRef}
                tabIndex={-1}
                className="rf-title"
              >
                Account created
              </h2>
              <p>
                {result === "skipped"
                  ? "Your account has been created. You can add your farm details later from your profile."
                  : "Your account and farm details have been saved. You can sign in and start managing your farm."}
              </p>
              <button
                type="button"
                className="rf-btn rf-btn--primary"
                onClick={goToLogin}
              >
                Go to login
              </button>
            </div>
          ) : (
            <>
              <ol className="rf-steps" aria-label="Registration progress">
                <li
                  className="rf-step"
                  data-state={step === 1 ? "active" : "done"}
                  aria-current={step === 1 ? "step" : undefined}
                >
                  <span className="rf-step-num" aria-hidden="true">
                    {step === 1 ? "1" : <Check size={14} strokeWidth={3} />}
                  </span>
                  Account
                  {step === 2 && (
                    <span className="rf-sr-only">(completed)</span>
                  )}
                </li>
                <li
                  className="rf-step-line"
                  data-done={step === 2}
                  aria-hidden="true"
                />
                <li
                  className="rf-step"
                  data-state={step === 2 ? "active" : "pending"}
                  aria-current={step === 2 ? "step" : undefined}
                >
                  <span className="rf-step-num" aria-hidden="true">
                    2
                  </span>
                  Your farm
                </li>
              </ol>

              <h2 id={titleId} className="rf-title">
                {step === 1 ? "Create your account" : "Tell us about your farm"}
              </h2>
              <p className="rf-subtitle">
                {step === 1
                  ? "Step 1 of 2. It takes about a minute."
                  : "Step 2 of 2. This helps set up your dashboard. You can skip it and add it later."}
              </p>

              <form
                className="rf-form"
                noValidate
                autoComplete="off"
                onSubmit={handleFormSubmit}
              >
                {step === 1 ? (
                  <>
                    <fieldset className="rf-fieldset">
                      <legend className="rf-legend">Your details</legend>
                      <div className="rf-field">
                        <label className="rf-label" htmlFor={id("name")}>
                          Full name
                        </label>
                        <input
                          className="rf-input"
                          type="text"
                          autoComplete="name"
                          placeholder="e.g. Anil Kumar"
                          {...field("name")}
                        />
                        {errorText("name")}
                      </div>
                      <div className="rf-row">
                        <div className="rf-field">
                          <label className="rf-label" htmlFor={id("email")}>
                            Email
                          </label>
                          <input
                            className="rf-input"
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            placeholder="name@example.com"
                            {...field("email")}
                          />
                          {errorText("email")}
                        </div>
                        <div className="rf-field">
                          <label className="rf-label" htmlFor={id("phone")}>
                            Phone number
                          </label>
                          <input
                            className="rf-input"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="98765 43210"
                            {...field("phone")}
                          />
                          {errorText("phone")}
                        </div>
                      </div>
                    </fieldset>

                    <fieldset className="rf-fieldset">
                      <legend className="rf-legend">Login</legend>
                      <div className="rf-row">
                        <div className="rf-field">
                          <label className="rf-label" htmlFor={id("username")}>
                            Username
                          </label>
                          <Controller
                            name="username"
                            control={control}
                            rules={{ validate: validators.username }}
                            render={({ field: f }) => (
                              <input
                                ref={f.ref}
                                name="reg-user"
                                value={f.value}
                                onBlur={f.onBlur}
                                onChange={(e) => {
                                  f.onChange(e.target.value);
                                  revalidateIfInvalid("username");
                                }}
                                className="rf-input"
                                type="text"
                                autoComplete="off"
                                autoCapitalize="none"
                                spellCheck={false}
                                placeholder="Choose a username"
                                {...a11y("username")}
                              />
                            )}
                          />
                          {errorText("username")}
                        </div>
                        <div className="rf-field">
                          <label className="rf-label" htmlFor={id("password")}>
                            Password
                          </label>
                          <div className="rf-control">
                            <Controller
                              name="password"
                              control={control}
                              rules={{ validate: validators.password }}
                              render={({ field: f }) => (
                                <input
                                  ref={f.ref}
                                  name="reg-pass"
                                  value={f.value}
                                  onBlur={f.onBlur}
                                  onChange={(e) => {
                                    f.onChange(e.target.value);
                                    revalidateIfInvalid("password");
                                  }}
                                  className="rf-input rf-input--with-toggle"
                                  type={showPassword ? "text" : "password"}
                                  autoComplete="new-password"
                                  placeholder="At least 8 characters"
                                  {...a11y("password", id("strength"))}
                                />
                              )}
                            />
                            <button
                              type="button"
                              className="rf-toggle"
                              onClick={() => setShowPassword((v) => !v)}
                              aria-label={
                                showPassword ? "Hide password" : "Show password"
                              }
                              aria-pressed={showPassword}
                              aria-controls={id("password")}
                            >
                              {showPassword ? "Hide" : "Show"}
                            </button>
                          </div>
                          <div
                            className="rf-meter"
                            data-level={strength.level}
                            aria-hidden="true"
                          >
                            {[1, 2, 3, 4].map((segment) => (
                              <span
                                key={segment}
                                className="rf-meter-seg"
                                data-on={strength.score >= segment}
                              />
                            ))}
                          </div>
                          <span
                            id={id("strength")}
                            className="rf-sr-only"
                            aria-live="polite"
                          >
                            {strength.label
                              ? `Password strength: ${strength.label}`
                              : ""}
                          </span>
                          {errorText("password")}
                          {!errors.password && strength.label && (
                            <span className="rf-meter-label" aria-hidden="true">
                              {strength.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </fieldset>

                    {!showReferral && (
                      <button
                        type="button"
                        className="rf-link"
                        aria-expanded={false}
                        aria-controls={id("referral-panel")}
                        onClick={() => {
                          setShowReferral(true);
                          requestAnimationFrame(() =>
                            setFocus("referral_code"),
                          );
                        }}
                      >
                        Have a referral code?
                      </button>
                    )}
                    <div id={id("referral-panel")} hidden={!showReferral}>
                      {showReferral && (
                        <div className="rf-field">
                          <label
                            className="rf-label"
                            htmlFor={id("referral_code")}
                          >
                            Referral code
                            <span className="rf-optional">(optional)</span>
                          </label>
                          <Controller
                            name="referral_code"
                            control={control}
                            render={({ field: f }) => (
                              <input
                                ref={f.ref}
                                name="referral_code"
                                id={id("referral_code")}
                                value={f.value}
                                onBlur={f.onBlur}
                                onChange={(e) =>
                                  f.onChange(e.target.value.toUpperCase())
                                }
                                className="rf-input rf-input--uppercase"
                                type="text"
                                autoComplete="off"
                                autoCapitalize="characters"
                                spellCheck={false}
                                placeholder="e.g. FARM25"
                              />
                            )}
                          />
                        </div>
                      )}
                    </div>

                    {submitError && (
                      <p className="rf-alert" role="alert">
                        {submitError}
                      </p>
                    )}

                    <div className="rf-actions">
                      <button
                        type="button"
                        className="rf-btn rf-btn--ghost"
                        onClick={handleClose}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="rf-btn rf-btn--primary">
                        Continue
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rf-field">
                      <label className="rf-label" htmlFor={id("bird_capacity")}>
                        Bird capacity
                      </label>
                      <div className="rf-control">
                        <input
                          className="rf-input rf-input--with-suffix"
                          type="number"
                          inputMode="numeric"
                          min={1}
                          step={1}
                          placeholder="How many birds can your farm hold?"
                          {...field("bird_capacity")}
                        />
                        <span className="rf-suffix" aria-hidden="true">
                          birds
                        </span>
                      </div>
                      {errorText("bird_capacity")}
                    </div>
                    <div className="rf-row">
                      <div className="rf-field">
                        <label className="rf-label" htmlFor={id("state")}>
                          State
                        </label>
                        <input
                          className="rf-input"
                          type="text"
                          autoComplete="address-level1"
                          placeholder="e.g. Kerala"
                          {...field("state")}
                        />
                        {errorText("state")}
                      </div>
                      <div className="rf-field">
                        <label className="rf-label" htmlFor={id("district")}>
                          District
                        </label>
                        <input
                          className="rf-input"
                          type="text"
                          placeholder="e.g. Alappuzha"
                          {...field("district")}
                        />
                        {errorText("district")}
                      </div>
                    </div>
                    <div className="rf-row">
                      <div className="rf-field">
                        <label className="rf-label" htmlFor={id("place")}>
                          Place
                        </label>
                        <input
                          className="rf-input"
                          type="text"
                          autoComplete="address-level2"
                          placeholder="e.g. Kozhikode"
                          {...field("place")}
                        />
                        {errorText("place")}
                      </div>
                      <div className="rf-field">
                        <label className="rf-label" htmlFor={id("pincode")}>
                          Pincode
                        </label>
                        <input
                          className="rf-input"
                          type="text"
                          inputMode="numeric"
                          autoComplete="postal-code"
                          maxLength={6}
                          placeholder="6-digit pincode"
                          {...field("pincode")}
                        />
                        {errorText("pincode")}
                      </div>
                    </div>

                    {submitError && (
                      <p className="rf-alert" role="alert">
                        {submitError}
                      </p>
                    )}

                    <div className="rf-actions">
                      <button
                        type="button"
                        className="rf-btn rf-btn--ghost"
                        onClick={() => setStep(1)}
                        disabled={pending}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        className="rf-btn rf-btn--ghost"
                        onClick={handleSkip}
                        disabled={pending}
                      >
                        {pending && skipped && (
                          <span className="rf-spinner" aria-hidden="true" />
                        )}
                        Skip for now
                      </button>
                      <button
                        type="submit"
                        className="rf-btn rf-btn--primary"
                        disabled={pending}
                      >
                        {pending && !skipped && (
                          <span className="rf-spinner" aria-hidden="true" />
                        )}
                        {pending && !skipped
                          ? "Creating account..."
                          : "Create account"}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerRegistrationDialog;
