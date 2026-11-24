import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowRight, Eye, EyeOff, Lock, TriangleAlert } from "lucide-react";
import { Button } from "@mui/material";
import toast from "react-hot-toast";
import BrandLogo from "@components/brand-logo";
import fetcherV2 from "@utils/fetcherV2";
import LoginBackground from "@pages/login/components/login-background";
import { gradients as brandGradients } from "../../theme/tokens";

const MIN_LENGTH = 8;

const fieldClass =
  "w-full rounded-xl border border-brand-border bg-brand-card py-3 pr-11 pl-11 text-sm text-brand-ink outline-none transition-shadow placeholder:text-brand-ink-muted focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30";
const errorFieldClass =
  "w-full rounded-xl border border-brand-danger bg-brand-card py-3 pr-11 pl-11 text-sm text-brand-ink outline-none transition-shadow placeholder:text-brand-ink-muted focus:border-brand-danger focus:ring-2 focus:ring-brand-danger/30";

type PasswordInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  autoFocus?: boolean;
};

const PasswordInput = ({
  id,
  label,
  value,
  onChange,
  error,
  autoFocus,
}: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-brand-ink-soft"
      >
        {label}
      </label>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-brand-ink-muted"
          aria-hidden
        />
        <input
          id={id}
          type={visible ? "text" : "password"}
          className={error ? errorFieldClass : fieldClass}
          autoComplete="new-password"
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={Boolean(error)}
        />
        <button
          type="button"
          className="absolute top-1/2 right-3 -translate-y-1/2 p-0.5 text-brand-ink-muted hover:text-brand-ink-soft"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? (
            <EyeOff className="h-[18px] w-[18px]" />
          ) : (
            <Eye className="h-[18px] w-[18px]" />
          )}
        </button>
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-medium text-brand-danger">{error}</p>
      )}
    </div>
  );
};

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const tokenLooksValid = /^[a-f0-9]{64}$/i.test(token);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{
    password?: string;
    confirm?: string;
    form?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (password.length < MIN_LENGTH) {
      next.password = `Use at least ${MIN_LENGTH} characters.`;
    }
    if (confirm !== password) {
      next.confirm = "Passwords do not match.";
    }
    setErrors(next);
    if (next.password || next.confirm) return;

    setIsSubmitting(true);
    const res = await fetcherV2<null>(
      "auth/forgot-password/reset",
      JSON.stringify({ token, new_password: password }),
      { method: "POST" },
    );
    setIsSubmitting(false);

    if (res.status === "success") {
      toast.success("Password updated. Sign in with your new password.");
      navigate("/login", { replace: true });
      return;
    }
    if (res.status === "validation_error") {
      setErrors({ form: res.error?.[0]?.message || "Check what you entered." });
    } else if (res.status === "network_error") {
      setErrors({ form: "Could not reach the server. Check your connection." });
    } else {
      setErrors({
        form: res.error?.message || "Reset link is invalid or expired.",
      });
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-brand-canvas font-sans text-brand-ink">
      <LoginBackground />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <Link to="/" className="mb-8" aria-label="Farmora home">
          <BrandLogo variant="onLight" priority className="h-11 md:h-12" />
        </Link>

        <div className="w-full max-w-[420px] rounded-3xl border border-brand-border bg-brand-card p-7 shadow-brand-xl md:p-9">
          <div className="mb-7">
            <h1 className="mb-1.5 text-2xl font-bold text-brand-ink md:text-[1.75rem]">
              Choose a new password
            </h1>
            <p className="text-sm text-brand-ink-soft">
              Use at least {MIN_LENGTH} characters. This link works once.
            </p>
          </div>

          {!tokenLooksValid ? (
            <div>
              <div className="mb-5 flex items-start gap-3 rounded-xl border border-brand-border bg-brand-card-soft p-4">
                <TriangleAlert
                  className="mt-0.5 h-5 w-5 shrink-0 text-brand-danger"
                  aria-hidden
                />
                <p className="text-sm text-brand-ink-soft" role="alert">
                  This reset link is invalid or incomplete. Request a new one
                  from the sign-in page.
                </p>
              </div>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate("/login")}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5" noValidate>
              {errors.form && (
                <p
                  role="alert"
                  className="rounded-xl border border-brand-border bg-brand-card-soft p-3 text-sm text-brand-ink"
                >
                  {errors.form}
                </p>
              )}
              <PasswordInput
                id="new-password"
                label="New password"
                value={password}
                onChange={setPassword}
                error={errors.password}
                autoFocus
              />
              <PasswordInput
                id="confirm-password"
                label="Confirm new password"
                value={confirm}
                onChange={setConfirm}
                error={errors.confirm}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isSubmitting}
                endIcon={!isSubmitting ? <ArrowRight size={18} /> : undefined}
                sx={{
                  py: 1.5,
                  borderRadius: "12px",
                  fontSize: "1rem",
                  background: brandGradients.cta,
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #2E7D32 0%, #1B5E20 100%)",
                  },
                }}
              >
                {isSubmitting ? "Saving…" : "Update password"}
              </Button>
              <p className="text-center text-sm text-brand-ink-soft">
                <Link
                  to="/login"
                  className="font-medium text-brand-accent hover:text-brand-primary"
                >
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
