import PasswordField from "@components/PasswordField";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Collapse,
  FormControlLabel,
  Switch,
  TextField,
} from "@mui/material";
import fetcher from "@utils/fetcher";

type EmailSettings = {
  sender_email: string;
  sender_name: string;
  smtp_host: string;
  smtp_port: number | null;
  smtp_secure: boolean;
  frontend_url: string;
  password_configured: boolean;
  encryption_configured: boolean;
  active_source: "settings" | "env" | "none" | "error";
};

type Draft = {
  sender_email: string;
  sender_name: string;
  smtp_host: string;
  smtp_port: string;
  smtp_secure: boolean;
  frontend_url: string;
};

const toDraft = (data?: EmailSettings): Draft => ({
  sender_email: data?.sender_email || "",
  sender_name: data?.sender_name || "",
  smtp_host: data?.smtp_host || "",
  smtp_port: data?.smtp_port ? String(data.smtp_port) : "",
  smtp_secure: data?.smtp_secure ?? true,
  frontend_url:
    data?.frontend_url ||
    (typeof window !== "undefined" ? window.location.origin : ""),
});

const errorMessage = (cause: unknown, fallback: string) =>
  cause instanceof Error ? cause.message : fallback;

export default function EmailSettingsCard() {
  const settings = useQuery<EmailSettings>({
    queryKey: ["email-settings"],
    queryFn: () => fetcher("settings/email"),
  });
  const [edits, setEdits] = useState<Partial<Draft>>({});
  const [password, setPassword] = useState("");
  const [showSmtp, setShowSmtp] = useState<boolean | null>(null);
  const [testTo, setTestTo] = useState("");
  const [busy, setBusy] = useState<"" | "save" | "test">("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const draft = { ...toDraft(settings.data), ...edits };
  const smtpOpen = showSmtp ?? Boolean(settings.data?.smtp_host);
  const set = (field: keyof Draft, value: string | boolean) => {
    setEdits((current) => ({ ...current, [field]: value }));
    setNotice("");
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy("save");
    setError("");
    setNotice("");
    try {
      const host = smtpOpen ? draft.smtp_host.trim() : "";
      await fetcher(
        "settings/email",
        JSON.stringify({
          sender_email: draft.sender_email.trim(),
          sender_name: draft.sender_name.trim(),
          password,
          smtp_host: host,
          smtp_port: host && draft.smtp_port ? Number(draft.smtp_port) : null,
          smtp_secure: draft.smtp_secure,
          frontend_url: draft.frontend_url.trim(),
        }),
        { method: "PUT" },
      );
      setPassword("");
      setEdits({});
      await settings.refetch();
      setNotice("Email settings saved. Send a test email to confirm they work.");
    } catch (cause) {
      setError(errorMessage(cause, "Unable to save email settings"));
    } finally {
      setBusy("");
    }
  };

  const sendTest = async () => {
    setBusy("test");
    setError("");
    setNotice("");
    try {
      const result: { to: string } = await fetcher(
        "settings/email/test",
        JSON.stringify({ to: testTo.trim() }),
        { method: "POST" },
      );
      setNotice(`Test email sent to ${result.to}. Check that inbox (and spam).`);
    } catch (cause) {
      setError(errorMessage(cause, "Test email failed"));
    } finally {
      setBusy("");
    }
  };

  const data = settings.data;
  const canTest = data && data.active_source !== "none";

  return (
    <form
      onSubmit={save}
      className="space-y-5 rounded-xl border border-brand-border bg-brand-card p-6"
    >
      <h2 className="text-xl font-semibold text-brand-ink">Email</h2>
      <p className="text-sm text-brand-ink-muted">
        Used to send password reset links. For Gmail, turn on 2-Step
        Verification and create an app password at
        myaccount.google.com/apppasswords. The password is encrypted and never
        shown after saving.
      </p>
      {settings.error && (
        <Alert severity="error">{settings.error.message}</Alert>
      )}
      {data && !data.encryption_configured && (
        <Alert severity="error">
          Server encryption key is missing. Configure
          PAYMENT_SETTINGS_ENCRYPTION_KEY before saving credentials.
        </Alert>
      )}
      {data?.active_source === "env" && (
        <Alert severity="info">
          Emails currently use EMAIL_USER / EMAIL_PASS from the server .env.
          Saving here replaces them.
        </Alert>
      )}
      {data?.active_source === "none" && (
        <Alert severity="warning">
          Email is not set up, so password reset emails are not being sent.
        </Alert>
      )}
      {error && <Alert severity="error">{error}</Alert>}
      {notice && <Alert severity="success">{notice}</Alert>}

      <TextField
        fullWidth
        required
        type="email"
        label="Sender email"
        value={draft.sender_email}
        onChange={(e) => set("sender_email", e.target.value)}
        placeholder="notifications@yourdomain.com"
        autoComplete="off"
      />
      <TextField
        fullWidth
        label="Sender name"
        value={draft.sender_name}
        onChange={(e) => set("sender_name", e.target.value)}
        placeholder="Farmora"
        helperText="Optional. Shown as the sender in the inbox."
        autoComplete="off"
      />
      <PasswordField
        fullWidth
        label="App password"
        value={password}
        onChange={(event) => {
          setPassword(event.target.value);
          setNotice("");
        }}
        autoComplete="new-password"
        helperText={
          data?.password_configured
            ? "Password saved. Leave blank to keep it."
            : "Required for first-time setup."
        }
      />
      <TextField
        fullWidth
        required
        label="App URL for reset links"
        value={draft.frontend_url}
        onChange={(e) => set("frontend_url", e.target.value)}
        placeholder="https://farmora.in"
        helperText="Reset emails link to this address + /reset-password."
        autoComplete="off"
      />

      <FormControlLabel
        control={
          <Switch
            checked={smtpOpen}
            onChange={(_, checked) => setShowSmtp(checked)}
          />
        }
        label={
          <span className="text-sm text-brand-ink-soft">
            Use a custom SMTP server instead of Gmail
          </span>
        }
      />
      <Collapse in={smtpOpen} unmountOnExit>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
          <TextField
            label="SMTP host"
            value={draft.smtp_host}
            onChange={(e) => set("smtp_host", e.target.value)}
            placeholder="smtp.yourprovider.com"
            autoComplete="off"
          />
          <TextField
            label="Port"
            type="number"
            value={draft.smtp_port}
            onChange={(e) => set("smtp_port", e.target.value)}
            placeholder="465"
            slotProps={{ htmlInput: { min: 1, max: 65535 } }}
          />
        </div>
        <FormControlLabel
          className="mt-2"
          control={
            <Switch
              checked={draft.smtp_secure}
              onChange={(_, checked) => set("smtp_secure", checked)}
            />
          }
          label={
            <span className="text-sm text-brand-ink-soft">
              Use SSL/TLS (usually on for port 465, off for 587)
            </span>
          }
        />
      </Collapse>

      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          variant="contained"
          disabled={
            Boolean(busy) || settings.isPending || !data?.encryption_configured
          }
        >
          {busy === "save" ? "Saving…" : "Save email settings"}
        </Button>
      </div>

      <div className="border-t border-brand-border pt-5">
        <p className="mb-3 text-sm font-medium text-brand-ink-soft">
          Send a test email
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <TextField
            fullWidth
            size="small"
            type="email"
            label="Send to"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
            placeholder="Leave blank to use your own email"
            autoComplete="off"
          />
          <Button
            type="button"
            variant="outlined"
            disabled={Boolean(busy) || !canTest}
            onClick={sendTest}
            sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
          >
            {busy === "test" ? "Sending…" : "Send test email"}
          </Button>
        </div>
        <p className="mt-2 text-xs text-brand-ink-muted">
          Uses the saved settings. Save first if you changed anything above.
        </p>
      </div>
    </form>
  );
}
