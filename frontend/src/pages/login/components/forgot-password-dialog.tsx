import { useEffect, useState, type FormEvent } from "react";
import { Mail, MailCheck } from "lucide-react";
import { Button } from "@mui/material";
import { Dialog, DialogContent } from "@components/dialog";
import fetcherV2 from "@utils/fetcherV2";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  defaultUsername?: string;
};

const fieldClass =
  "w-full rounded-xl border border-brand-border bg-brand-card py-3 pr-4 pl-11 text-sm text-brand-ink outline-none transition-shadow placeholder:text-brand-ink-muted focus:border-brand-accent focus:ring-2 focus:ring-brand-accent/30";

const ForgotPasswordDialog = ({ isOpen, onClose, defaultUsername }: Props) => {
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [sentMessage, setSentMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIdentifier(defaultUsername || "");
      setError("");
      setSentMessage("");
    }
  }, [isOpen, defaultUsername]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const value = identifier.trim();
    if (value.length < 3) {
      setError("Enter your username or email address.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    const res = await fetcherV2<null>(
      "auth/forgot-password",
      JSON.stringify({ identifier: value }),
      { method: "POST" },
    );
    setIsSubmitting(false);
    if (res.status === "success") {
      setSentMessage(
        "If an account matches, we've sent a password reset link to its email address. The link expires in 30 minutes.",
      );
    } else if (res.status === "validation_error") {
      setError(res.error?.[0]?.message || "Check what you entered.");
    } else if (res.status === "network_error") {
      setError("Could not reach the server. Check your connection.");
    } else {
      setError(res.error?.message || "Something went wrong. Try again.");
    }
  };

  return (
    <Dialog isOpen={isOpen} headerTitle="Reset password" onClose={onClose}>
      <DialogContent>
        {sentMessage ? (
          <div>
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-brand-border bg-brand-card-soft p-4">
              <MailCheck
                className="mt-0.5 h-5 w-5 shrink-0 text-brand-accent"
                aria-hidden
              />
              <p className="text-sm text-brand-ink-soft" role="status">
                {sentMessage}
              </p>
            </div>
            <p className="mb-5 text-xs text-brand-ink-muted">
              No email? Staff accounts without an email address need their
              account owner or Super Admin to reset the password.
            </p>
            <Button onClick={onClose} variant="contained">
              Back to sign in
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <p className="mb-4 text-sm text-brand-ink-soft">
              Enter your username or email address and we&apos;ll email you a
              link to choose a new password.
            </p>
            <label
              htmlFor="forgot-identifier"
              className="mb-2 block text-sm font-medium text-brand-ink-soft"
            >
              Username or email
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute top-1/2 left-3.5 h-[18px] w-[18px] -translate-y-1/2 text-brand-ink-muted"
                aria-hidden
              />
              <input
                id="forgot-identifier"
                className={fieldClass}
                placeholder="Enter your username or email"
                autoComplete="username"
                autoFocus
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                aria-invalid={Boolean(error)}
              />
            </div>
            {error && (
              <p
                className="mt-1.5 text-xs font-medium text-brand-danger"
                role="alert"
              >
                {error}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {isSubmitting ? "Sending…" : "Send reset link"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ForgotPasswordDialog;
