import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, TextField } from "@mui/material";
import PageTitle from "@components/PageTitle";
import fetcher from "@utils/fetcher";

type Settings = {
  key_id: string;
  secret_configured: boolean;
  encryption_configured: boolean;
};

export default function SettingsPage() {
  const settings = useQuery<Settings>({
    queryKey: ["razorpay-settings"],
    queryFn: () => fetcher("settings/razorpay"),
  });
  const [keyId, setKeyId] = useState<string | null>(null);
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [connection, setConnection] = useState("");
  const value = keyId ?? settings.data?.key_id ?? "";
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    setConnection("");
    try {
      await fetcher(
        "settings/razorpay",
        JSON.stringify({
          key_id: value.trim(),
          key_secret: secret,
        }),
        { method: "PUT" },
      );
      setSecret("");
      await settings.refetch();
      setSaved(true);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to save settings",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="max-w-2xl space-y-6">
      <PageTitle title="Settings" />
      <form
        onSubmit={save}
        className="space-y-5 rounded-xl border border-brand-border bg-brand-card p-6"
      >
        <h2 className="text-xl font-semibold text-brand-ink">
          Razorpay payments
        </h2>
        <p className="text-sm text-brand-ink-muted">
          Add credentials from your Razorpay Dashboard. Start with test keys.
          Secrets are encrypted and never displayed after saving.
        </p>
        {settings.error && (
          <Alert severity="error">{settings.error.message}</Alert>
        )}
        {settings.data && !settings.data.encryption_configured && (
          <Alert severity="error">
            Server encryption key is missing. Configure
            PAYMENT_SETTINGS_ENCRYPTION_KEY before saving credentials.
          </Alert>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {saved && (
          <Alert severity="success">
            Credentials saved. Checkout will use these keys. Credentials have
            not been validated against Razorpay.
          </Alert>
        )}
        {connection && <Alert severity="success">{connection}</Alert>}
        {value.startsWith("rzp_live_") && (
          <Alert severity="warning">
            Live keys charge real money. Use test keys until checkout testing is
            complete.
          </Alert>
        )}
        <TextField
          fullWidth
          required
          label="Razorpay key ID"
          value={value}
          onChange={(event) => {
            setKeyId(event.target.value);
            setSaved(false);
          }}
          placeholder="rzp_test_…"
          autoComplete="off"
        />
        <TextField
          fullWidth
          label="Key secret"
          type="password"
          value={secret}
          onChange={(event) => setSecret(event.target.value)}
          autoComplete="new-password"
          helperText={
            settings.data?.secret_configured
              ? "Secret saved. Leave blank to keep it. Enter a new secret when changing key ID."
              : "Required for first-time setup."
          }
        />
        <Button
          type="submit"
          variant="contained"
          disabled={
            busy || settings.isPending || !settings.data?.encryption_configured
          }
        >
          {busy ? "Saving…" : "Save Razorpay settings"}
        </Button>
        <Button
          type="button"
          disabled={busy || !settings.data?.secret_configured}
          onClick={async () => {
            setBusy(true);
            setError("");
            setConnection("");
            try {
              const result = await fetcher("settings/razorpay/test", "{}", {
                method: "POST",
              });
              setConnection(
                `Connected to Razorpay ${result.mode} mode. No payment was made.`,
              );
            } catch (cause) {
              setError(
                cause instanceof Error
                  ? cause.message
                  : "Connection check failed",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          Test saved connection
        </Button>
      </form>
    </div>
  );
}
