import { useMemo, useState } from "react";
import { Button, MenuItem, TextField } from "@mui/material";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { Dialog, DialogContent } from "@components/dialog";
import { formatCurrency } from "@utils/currency";
import packages from "@api/packages.api";
import subscription from "@api/subscription.api";
import type { ManagerDashboardData } from "@app-types/dashboard.types";
import type { NameResponse } from "@app-types/gen.types";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  subscriptionInfo: ManagerDashboardData["subscription"];
};

const SubscriptionStatusCard = ({ subscriptionInfo }: Props) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [packageId, setPackageId] = useState<number | "">("");
  const [packageOptions, setPackageOptions] = useState<NameResponse[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const warning = Boolean(subscriptionInfo?.expiring_soon);

  const expiryText = useMemo(() => {
    if (!subscriptionInfo?.valid_to) return "-";
    return dayjs(subscriptionInfo.valid_to).format("DD MMM YYYY");
  }, [subscriptionInfo?.valid_to]);

  const openRenew = async () => {
    const names = await packages.getNames();
    setPackageOptions(names);
    setPackageId(subscriptionInfo?.package?.id || names[0]?.id || "");
    setOpen(true);
  };

  const onRenew = async () => {
    if (!packageId) {
      toast.error("Select a package");
      return;
    }
    setSubmitting(true);
    try {
      await subscription.renew({ package_id: Number(packageId) });
      toast.success("Subscription renewed");
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["manager-dashboard"] });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to renew subscription",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!subscriptionInfo) {
    return (
      <div className="rounded-xl border border-brand-border bg-brand-card p-5">
        <p className="text-sm font-medium text-brand-ink">Current package</p>
        <p className="mt-1 text-sm text-brand-ink-muted">
          No active subscription found.
        </p>
      </div>
    );
  }

  return (
    <>
      <div
        className={`rounded-xl border p-5 ${
          warning
            ? "border-amber-300 bg-amber-50"
            : "border-brand-border bg-brand-card"
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-ink-muted">
              Current package
            </p>
            <p className="mt-1 text-lg font-semibold text-brand-ink">
              {subscriptionInfo.package?.name || "Unknown"}
            </p>
            <p className="mt-1 text-sm text-brand-ink-soft">
              {subscriptionInfo.package
                ? formatCurrency(subscriptionInfo.package.price)
                : "-"}
              {" · "}
              Expires {expiryText}
              {" · "}
              {subscriptionInfo.days_remaining} day
              {subscriptionInfo.days_remaining === 1 ? "" : "s"} left
            </p>
            {warning && (
              <p className="mt-2 text-sm font-medium text-amber-800">
                Your package expires within 10 days. Renew to avoid interruption.
              </p>
            )}
          </div>
          <Button variant="contained" onClick={openRenew}>
            Renew package
          </Button>
        </div>
      </div>

      <Dialog
        isOpen={open}
        headerTitle="Renew Package"
        onClose={() => setOpen(false)}
      >
        <DialogContent>
          <div className="grid grid-cols-1 gap-4">
            <TextField
              select
              label="Package"
              size="small"
              value={packageId}
              onChange={(e) => setPackageId(Number(e.target.value))}
            >
              {packageOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.name}
                </MenuItem>
              ))}
            </TextField>
            <div className="flex justify-end gap-2">
              <Button variant="outlined" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={onRenew}
                disabled={submitting}
              >
                {submitting ? "Renewing…" : "Confirm Renew"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscriptionStatusCard;
