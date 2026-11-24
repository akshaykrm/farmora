import { useState } from "react";
import { Alert, Button, TextField } from "@mui/material";
import { Dialog, DialogContent } from "@components/dialog";
import subscriptionApi from "@api/subscription.api";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  subscription: { id: number; valid_from: string; valid_to: string };
  subscriberName: string;
  onClose: () => void;
  onSaved: () => void;
};

export default function UpdateSubscriptionDaysDialog({
  subscription,
  subscriberName,
  onClose,
  onSaved,
}: Props) {
  const [days, setDays] = useState("10");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const queryClient = useQueryClient();
  const number = Number(days);
  const valid =
    days.trim() !== "" &&
    Number.isInteger(number) &&
    number !== 0 &&
    Math.abs(number) <= 3650;
  const expiry = valid ? dayjs(subscription.valid_to).add(number, "day") : null;
  const datesValid = expiry?.isAfter(dayjs(subscription.valid_from));
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!valid || !datesValid || busy) return;
    setBusy(true);
    setError("");
    try {
      await subscriptionApi.updateDays(
        subscription.id,
        number,
        subscription.valid_to,
      );
      await queryClient.invalidateQueries({ queryKey: ["manager-dashboard"] });
      toast.success("Subscription days updated");
      onSaved();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not update subscription days",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog
      isOpen
      headerTitle={`Update subscription days — ${subscriberName}`}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <DialogContent>
        <form onSubmit={save} className="space-y-4">
          <p className="text-sm text-brand-ink-muted">
            Current expiry:{" "}
            {dayjs(subscription.valid_to).format("DD MMM YYYY, HH:mm")}
          </p>
          <TextField
            fullWidth
            required
            label="Days to add or remove"
            type="number"
            value={days}
            onChange={(event) => setDays(event.target.value)}
            slotProps={{ htmlInput: { min: -3650, max: 3650, step: 1 } }}
            helperText="Use a positive number to extend, or a negative number to shorten. Up to 3650 days."
            error={!valid}
          />
          {expiry && (
            <p className="text-sm font-medium text-brand-ink">
              New expiry: {expiry.format("DD MMM YYYY, HH:mm")}
            </p>
          )}
          {valid && !datesValid && (
            <Alert severity="error">
              Expiry must be after the subscription start date.
            </Alert>
          )}
          <p className="text-sm text-brand-ink-muted">
            This changes access time only. It does not collect a payment or
            change admin approval.
          </p>
          {error && <Alert severity="error">{error}</Alert>}
          <div className="flex justify-end gap-2">
            <Button variant="outlined" disabled={busy} onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={busy || !valid || !datesValid}
            >
              {busy ? "Saving…" : "Update days"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
