import { useId } from "react";
import type { FormEvent, InputHTMLAttributes, ReactNode, Ref } from "react";
import { Button, CircularProgress } from "@mui/material";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  suffix?: string;
  ref?: Ref<HTMLInputElement>;
};

export const SetupInput = ({
  label,
  error,
  suffix,
  className,
  ...inputProps
}: InputProps) => {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className={`flex flex-col gap-1.5 min-w-0 ${className ?? ""}`}>
      <label htmlFor={id} className="text-sm font-medium text-brand-ink-soft">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={`w-full min-h-11 px-3.5 py-2.5 rounded-xl border bg-brand-card text-brand-ink outline-none transition-shadow focus-visible:ring-4 focus-visible:ring-brand-accent/25 focus-visible:border-brand-accent ${
            error ? "border-brand-danger" : "border-brand-border-strong"
          } ${suffix ? "pr-16" : ""}`}
          {...inputProps}
        />
        {suffix && (
          <span
            className="absolute right-3.5 text-sm text-brand-ink-muted pointer-events-none"
            aria-hidden="true"
          >
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-xs text-brand-danger">
          {error}
        </p>
      )}
    </div>
  );
};

type SelectProps = {
  label: string;
  error?: string;
  value: number | "";
  options: { id: number; name: string }[];
  onChange: (value: number | "") => void;
  onBlur?: () => void;
  ref?: Ref<HTMLSelectElement>;
};

export const SetupSelect = ({
  label,
  error,
  value,
  options,
  onChange,
  onBlur,
  ref,
}: SelectProps) => {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <label htmlFor={id} className="text-sm font-medium text-brand-ink-soft">
        {label}
      </label>
      <select
        id={id}
        ref={ref}
        value={value}
        onBlur={onBlur}
        onChange={(e) =>
          onChange(e.target.value === "" ? "" : Number(e.target.value))
        }
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full min-h-11 px-3 py-2.5 rounded-xl border bg-brand-card text-brand-ink outline-none focus-visible:ring-4 focus-visible:ring-brand-accent/25 focus-visible:border-brand-accent ${
          error ? "border-brand-danger" : "border-brand-border-strong"
        }`}
      >
        <option value="">Select…</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      {error && (
        <p id={errorId} className="text-xs text-brand-danger">
          {error}
        </p>
      )}
    </div>
  );
};

type StepLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack?: () => void;
  onSkip: () => void;
  saving: boolean;
  serverError?: string | null;
  done?: boolean;
  submitLabel?: string;
};

export const StepLayout = ({
  title,
  description,
  children,
  onSubmit,
  onBack,
  onSkip,
  saving,
  serverError,
  done,
  submitLabel = "Save and continue",
}: StepLayoutProps) => (
  <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
    <div>
      <h3 className="text-xl font-bold text-brand-ink">{title}</h3>
      <p className="text-sm text-brand-ink-muted mt-1">{description}</p>
    </div>

    {done ? (
      <p className="rounded-xl border border-brand-border bg-brand-canvas px-4 py-3 text-sm text-brand-ink-soft">
        This is already set up. You can continue to the next step.
      </p>
    ) : (
      children
    )}

    {serverError && (
      <p
        role="alert"
        className="rounded-xl border border-brand-danger bg-brand-danger-soft px-4 py-3 text-sm text-brand-danger-strong"
      >
        {serverError}
      </p>
    )}

    <div className="flex flex-wrap gap-3 pt-1">
      {onBack && (
        <Button
          type="button"
          variant="outlined"
          onClick={onBack}
          disabled={saving}
        >
          Back
        </Button>
      )}
      {!done && (
        <Button type="button" variant="text" onClick={onSkip} disabled={saving}>
          Skip
        </Button>
      )}
      <Button
        type={done ? "button" : "submit"}
        variant="contained"
        disabled={saving}
        onClick={done ? onSkip : undefined}
        sx={{ ml: "auto" }}
      >
        {saving && (
          <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
        )}
        {done ? "Continue" : submitLabel}
      </Button>
    </div>
  </form>
);
