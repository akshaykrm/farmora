import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { Button } from "@mui/material";
import { Check } from "lucide-react";
import { Dialog, DialogContent } from "@components/dialog";
import type { SetupStatus } from "@app-types/setup.types";
import ProfileStep from "./ProfileStep";
import FarmStep from "./FarmStep";
import SeasonStep from "./SeasonStep";
import BatchStep from "./BatchStep";
import VendorsStep from "./VendorsStep";
import ItemsStep from "./ItemsStep";
import type { SavedIds } from "./types";

type StepKey =
  "profile" | "farm" | "season" | "batch" | "vendors" | "items" | "done";

const STEPS: { key: StepKey; label: string }[] = [
  { key: "profile", label: "Details" },
  { key: "farm", label: "Farm" },
  { key: "season", label: "Season" },
  { key: "batch", label: "Batch" },
  { key: "vendors", label: "Vendors" },
  { key: "items", label: "Items" },
  { key: "done", label: "Done" },
];

const isStepDone = (key: StepKey, status: SetupStatus) => {
  switch (key) {
    case "profile":
      return status.items.profile;
    case "farm":
      return status.items.farm;
    case "season":
      return status.items.season;
    case "batch":
      return status.items.batch;
    case "vendors":
      return status.items.suppliers && status.items.customers;
    case "items":
      return status.items.items ?? true;
    default:
      return false;
  }
};

type Props = {
  status: SetupStatus;
  onClose: () => void;
};

const SetupWizard = ({ status, onClose }: Props) => {
  const queryClient = useQueryClient();
  const [stepIndex, setStepIndex] = useState(() => {
    const firstMissing = STEPS.findIndex(
      (step) => step.key !== "done" && !isStepDone(step.key, status),
    );
    return firstMissing === -1 ? STEPS.length - 1 : firstMissing;
  });
  const [created, setCreated] = useState<string[]>([]);
  const [farmId, setFarmId] = useState<number | undefined>();
  const [seasonId, setSeasonId] = useState<number | undefined>();
  const [supplierId, setSupplierId] = useState<number | undefined>();

  const step = STEPS[stepIndex];
  const next = () => setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  const back = stepIndex > 0 ? () => setStepIndex((i) => i - 1) : undefined;

  const onSaved = (summary: string, extra?: SavedIds) => {
    setCreated((prev) => [...prev, summary]);
    if (extra?.farmId) setFarmId(extra.farmId);
    if (extra?.seasonId) setSeasonId(extra.seasonId);
    if (extra?.supplierId) setSupplierId(extra.supplierId);
    void queryClient.invalidateQueries({ queryKey: ["setup-status"] });
    void queryClient.invalidateQueries({ queryKey: ["manager-dashboard"] });
  };

  const stepProps = { status, onNext: next, onBack: back, onSaved };

  return (
    <Dialog
      isOpen
      headerTitle="Set up your farm"
      onClose={onClose}
      className="max-w-4xl"
    >
      <DialogContent>
        <ol
          className="flex flex-wrap items-center gap-x-2 gap-y-3 mb-6"
          aria-label="Setup progress"
        >
          {STEPS.map((item, index) => {
            const complete =
              index < stepIndex ||
              (item.key !== "done" && isStepDone(item.key, status));
            const active = index === stepIndex;
            return (
              <li
                key={item.key}
                aria-current={active ? "step" : undefined}
                className="flex items-center gap-2 shrink-0"
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold border ${
                    active
                      ? "bg-brand-accent border-brand-accent text-white"
                      : complete
                        ? "bg-brand-canvas border-brand-accent text-brand-accent"
                        : "border-brand-border-strong text-brand-ink-muted"
                  }`}
                  aria-hidden="true"
                >
                  {complete && !active ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={`text-sm font-semibold ${
                    active ? "text-brand-ink" : "text-brand-ink-muted"
                  }`}
                >
                  {item.label}
                  {complete && !active && (
                    <span className="sr-only"> (completed)</span>
                  )}
                </span>
                {index < STEPS.length - 1 && (
                  <span
                    className="h-px w-5 bg-brand-border-strong"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>

        {step.key === "profile" && <ProfileStep {...stepProps} />}
        {step.key === "farm" && <FarmStep {...stepProps} />}
        {step.key === "season" && <SeasonStep {...stepProps} />}
        {step.key === "batch" && (
          <BatchStep {...stepProps} farmId={farmId} seasonId={seasonId} />
        )}
        {step.key === "vendors" && <VendorsStep {...stepProps} />}
        {step.key === "items" && (
          <ItemsStep {...stepProps} supplierId={supplierId} />
        )}
        {step.key === "done" && (
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-xl font-bold text-brand-ink">
                {created.length ? "You're all set" : "Setup summary"}
              </h3>
              <p className="text-sm text-brand-ink-muted mt-1">
                {created.length
                  ? "Here's what was added to your account."
                  : "Nothing new was added. You can finish setup any time from the dashboard."}
              </p>
            </div>
            {created.length > 0 && (
              <ul className="flex flex-col gap-2">
                {created.map((summary) => (
                  <li
                    key={summary}
                    className="flex items-center gap-2 text-sm text-brand-ink-soft"
                  >
                    <Check
                      size={16}
                      className="text-brand-accent shrink-0"
                      aria-hidden="true"
                    />
                    {summary}
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                component={Link}
                to="/configuration/batches"
                variant="outlined"
                onClick={onClose}
              >
                View batches
              </Button>
              <Button
                component={Link}
                to="/expense/purchase"
                variant="outlined"
                onClick={onClose}
              >
                Record a purchase
              </Button>
              <Button variant="contained" onClick={onClose} sx={{ ml: "auto" }}>
                Go to dashboard
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SetupWizard;
