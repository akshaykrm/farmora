import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import toast from "react-hot-toast";
import { Button, CircularProgress } from "@mui/material";
import { Check, Circle, Sparkles } from "lucide-react";
import { Dialog, DialogActions, DialogContent } from "@components/dialog";
import setup from "@api/setup.api";
import type { SetupStatus } from "@app-types/setup.types";
import { useAuth } from "@store/authentication/context";
import usePermissions from "@hooks/use-permissions";
import SetupWizard from "./setup-wizard/SetupWizard";

type Row = {
  key: string;
  label: string;
  hint: string;
  done: boolean;
  link: string;
  generated?: string;
};

const buildRows = (status: SetupStatus): Row[] => {
  const { items, defaults } = status;
  const missingItems = status.systemItems
    ? status.systemItems.filter((item) => !item.exists)
    : (defaults.items ?? []);
  const rows: Row[] = [
    {
      key: "profile",
      label: "Farm details",
      hint: "State, district, place, pincode and bird capacity",
      done: items.profile,
      link: "/profile",
    },
    {
      key: "farm",
      label: "Farm",
      hint: "The farm your batches are raised on",
      done: items.farm,
      link: "/configuration/farms",
      generated: `Farm "${defaults.farm.name}"`,
    },
    {
      key: "season",
      label: "Season",
      hint: "Groups your batches for reporting",
      done: items.season,
      link: "/configuration/seasons",
      generated: `Season "${defaults.season.name}" (${defaults.season.from_date} to ${defaults.season.to_date})`,
    },
    {
      key: "batch",
      label: "First batch",
      hint: "One flock on a farm during a season",
      done: items.batch,
      link: "/configuration/batches",
      generated: `Batch "${defaults.batch.name}" on that farm and season`,
    },
    {
      key: "vendors",
      label: "Supplier and customer",
      hint: "Who you buy from and sell to",
      done: items.suppliers && items.customers,
      link: "/configuration/vendors",
      generated: [
        !items.suppliers && `Supplier "${defaults.supplier.name}"`,
        !items.customers && `Customer "${defaults.customer.name}"`,
      ]
        .filter(Boolean)
        .join(" and "),
    },
  ];

  if (typeof items.items === "boolean") {
    rows.push({
      key: "items",
      label: "Items",
      hint: "General, Working Cost, Integration Cost and anything you buy",
      done: items.items,
      link: "/configuration/items",
      generated: missingItems.length
        ? `System items: ${missingItems.map((item) => item.name).join(", ")}`
        : undefined,
    });
  }

  return rows;
};

const dismissKey = (username?: string | null) =>
  `farmora:setup-dismissed:${username ?? "user"}`;

const SetupChecklistCard = () => {
  const { user } = useAuth();
  const { isSubscriber } = usePermissions();
  const queryClient = useQueryClient();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(dismissKey(user?.username)) === "1",
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  const { data: status } = useQuery({
    queryKey: ["setup-status"],
    queryFn: setup.fetchStatus,
    enabled: isSubscriber,
  });

  const generate = useMutation({
    mutationFn: setup.generateDefaults,
    onSuccess: (result) => {
      queryClient.setQueryData(["setup-status"], result.status);
      void queryClient.invalidateQueries({ queryKey: ["manager-dashboard"] });
      const count = Object.keys(result.created).length;
      toast.success(
        count
          ? "Default setup created. You can rename anything later."
          : "Everything was already set up.",
      );
      setConfirmOpen(false);
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error ? error.message : "Could not generate setup.",
      );
    },
  });

  if (!isSubscriber || !status || status.completed) {
    return wizardOpen && status ? (
      <SetupWizard status={status} onClose={() => setWizardOpen(false)} />
    ) : null;
  }

  const rows = buildRows(status);
  const doneCount = rows.filter((row) => row.done).length;
  const toGenerate = rows.filter((row) => !row.done && row.generated);

  const setDismissedPersisted = (value: boolean) => {
    if (value) localStorage.setItem(dismissKey(user?.username), "1");
    else localStorage.removeItem(dismissKey(user?.username));
    setDismissed(value);
  };

  if (dismissed) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-border bg-brand-card px-5 py-3">
        <p className="text-sm text-brand-ink-soft">
          Your setup is {doneCount} of {rows.length} done.
        </p>
        <Button size="small" onClick={() => setDismissedPersisted(false)}>
          Finish setup
        </Button>
      </div>
    );
  }

  return (
    <>
      <section
        aria-labelledby="setup-card-title"
        className="rounded-2xl border border-brand-border bg-brand-card p-5 md:p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2
              id="setup-card-title"
              className="text-lg font-bold text-brand-ink"
            >
              Set up your farm
            </h2>
            <p className="text-sm text-brand-ink-muted mt-1">
              Add the basics so you can start recording purchases and sales.
              Generate them in one click, or go step by step.
            </p>
          </div>
          <span className="text-sm font-semibold text-brand-ink-soft">
            {doneCount} of {rows.length} done
          </span>
        </div>

        <div
          className="mt-4 h-2 w-full rounded-full bg-brand-canvas overflow-hidden"
          role="progressbar"
          aria-label="Setup progress"
          aria-valuemin={0}
          aria-valuemax={rows.length}
          aria-valuenow={doneCount}
        >
          <div
            className="h-full rounded-full bg-brand-accent transition-all motion-reduce:transition-none"
            style={{ width: `${(doneCount / rows.length) * 100}%` }}
          />
        </div>

        <ul className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3">
          {rows.map((row) => (
            <li key={row.key}>
              <Link
                to={row.link}
                className="flex h-full items-start gap-3 rounded-xl border border-brand-border p-3 hover:border-brand-accent focus-visible:outline-2 focus-visible:outline-brand-accent transition-colors"
              >
                {row.done ? (
                  <Check
                    size={18}
                    className="mt-0.5 shrink-0 text-brand-accent"
                    aria-hidden="true"
                  />
                ) : (
                  <Circle
                    size={18}
                    className="mt-0.5 shrink-0 text-brand-ink-muted"
                    aria-hidden="true"
                  />
                )}
                <span className="min-w-0">
                  <span
                    className={`block text-sm font-semibold ${
                      row.done
                        ? "text-brand-ink-muted line-through"
                        : "text-brand-ink"
                    }`}
                  >
                    {row.label}
                    <span className="sr-only">
                      {row.done ? " (done)" : " (not set up)"}
                    </span>
                  </span>
                  <span className="block text-xs text-brand-ink-muted mt-0.5">
                    {row.hint}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap gap-3">
          {toGenerate.length > 0 && (
            <Button
              variant="contained"
              startIcon={<Sparkles size={16} />}
              onClick={() => setConfirmOpen(true)}
            >
              Generate defaults
            </Button>
          )}
          <Button variant="outlined" onClick={() => setWizardOpen(true)}>
            Set up step by step
          </Button>
          <Button
            variant="text"
            onClick={() => setDismissedPersisted(true)}
            sx={{ ml: { sm: "auto" } }}
          >
            Hide for now
          </Button>
        </div>
      </section>

      <Dialog
        isOpen={confirmOpen}
        headerTitle="Generate default setup"
        onClose={() => !generate.isPending && setConfirmOpen(false)}
      >
        <DialogContent>
          <p className="text-sm text-brand-ink-soft mb-3">
            We'll create the following for you. You can rename or edit any of
            them later.
          </p>
          <ul className="flex flex-col gap-2">
            {toGenerate.map((row) => (
              <li
                key={row.key}
                className="flex items-start gap-2 text-sm text-brand-ink"
              >
                <Check
                  size={16}
                  className="mt-0.5 shrink-0 text-brand-accent"
                  aria-hidden="true"
                />
                {row.generated}
              </li>
            ))}
          </ul>
          {!status.items.profile && (
            <p className="text-xs text-brand-ink-muted mt-4">
              Farm details (state, district, place, pincode, bird capacity)
              can't be generated. Add them from your profile or the step-by-step
              setup.
            </p>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setConfirmOpen(false)}
            disabled={generate.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => generate.mutate()}
            disabled={generate.isPending}
          >
            {generate.isPending && (
              <CircularProgress size={16} color="inherit" sx={{ mr: 1 }} />
            )}
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {wizardOpen && (
        <SetupWizard status={status} onClose={() => setWizardOpen(false)} />
      )}
    </>
  );
};

export default SetupChecklistCard;
