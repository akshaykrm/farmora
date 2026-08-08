import batchOverview from "@api/batch-overview.api";
import Badge from "@components/Badge";
import { Dialog, DialogContent } from "@components/dialog";
import Ternary from "@components/ternary";
import { Boxes } from "lucide-react";
import { Button } from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import type { BatchOverviewBatch, BatchLog } from "../types";

type Props = {
  batch?: BatchOverviewBatch;
  refetch: () => void;
};

const parseBatchLogs = (closingStatement: string | null): BatchLog[] => {
  if (!closingStatement) return [];

  try {
    const parsed = JSON.parse(closingStatement);
    if (Array.isArray(parsed)) {
      return parsed
        .map((entry) =>
          typeof entry === "string"
            ? { log: entry, created_at: null }
            : {
                log: String(entry?.log ?? ""),
                created_at: entry?.created_at ?? null,
              },
        )
        .filter((entry) => entry.log.length > 0);
    }
  } catch {
    // not JSON — fall through to legacy handling
  }

  return [{ log: closingStatement, created_at: null }];
};

function BatchInformation({ batch, refetch }: Props) {
  const [showLogs, setShowLogs] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newLog, setNewLog] = useState("");
  const [logError, setLogError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!batch) return null;

  const isClosed = Boolean(batch.closed_on);
  const logs = parseBatchLogs(batch.closing_statement);
  const hasLogs = logs.length > 0;

  const handleAddLog = async () => {
    const logText = newLog.trim();
    if (!logText || submitting) return;

    setSubmitting(true);
    setLogError(null);
    const response = await batchOverview.addBatchLog(batch.id, logText);
    setSubmitting(false);

    if (response.status === "success") {
      setNewLog("");
      refetch();
    } else if (response.status === "failed") {
      setLogError(
        typeof response.data === "string"
          ? response.data
          : "Failed to add log",
      );
    } else {
      setLogError("Failed to add log. Please try again.");
    }
  };

  const handleConfirmClose = async () => {
    const response = await batchOverview.closeBatch(batch.id);
    if (response.status === "success") {
      setShowConfirm(false);
      refetch();
      const batchClosed = new CustomEvent("batchOverview:batch-closed", {
        detail: {
          status: "closed",
        },
      });
      document.dispatchEvent(batchClosed);
    }
  };

  const handleCloseLogs = () => {
    setShowLogs(false);
    setLogError(null);
  };

  return (
    <section className="mb-6 rounded-xl border border-brand-border bg-brand-card p-4 shadow-xs">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 shrink-0 rounded-xl bg-brand-primary-soft text-brand-accent flex items-center justify-center">
            <Boxes className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-brand-ink truncate">
                {batch.name}
              </h2>
              <Badge variant={isClosed ? "neutral" : "success"}>
                {isClosed ? "Closed" : "Active"}
              </Badge>
            </div>
            <p className="text-sm text-brand-ink-soft mt-0.5">
              Season: {batch.season?.name || "N/A"}
            </p>
          </div>
        </div>
        <div className="flex justify-end items-center shrink-0">
          <Ternary
            when={!isClosed}
            then={
              <div className="flex items-center gap-2">
                <Button
                  variant="outlined"
                  onClick={() => setShowLogs(true)}
                >
                  {hasLogs ? "View Logs" : "Add Logs"}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setShowConfirm(true)}
                >
                  Close Batch
                </Button>
              </div>
            }
            otherwise={
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm text-brand-ink-soft">
                    Closed on:&nbsp;
                    {dayjs(batch.closed_on).format("DD MMM YYYY").toString()}
                  </p>
                </div>
                {hasLogs && (
                  <Button variant="outlined" onClick={() => setShowLogs(true)}>
                    View Logs
                  </Button>
                )}
              </div>
            }
          />
        </div>
      </div>

      <Dialog
        isOpen={showLogs}
        headerTitle="Batch Logs"
        onClose={handleCloseLogs}
      >
        <DialogContent>
          {logs.length === 0 ? (
            <p className="text-sm text-brand-ink-soft py-6 text-center">
              No logs added yet.
            </p>
          ) : (
            <ul className="max-h-72 overflow-y-auto pr-2">
              {logs.map((entry, index) => {
                const isLast = index === logs.length - 1;
                return (
                  <li
                    key={`${entry.created_at || "legacy"}-${index}`}
                    className={`relative pl-8 ${isLast ? "pb-1" : "pb-6"}`}
                  >
                    {!isLast && (
                      <span
                        aria-hidden
                        className="absolute left-[3px] top-1.5 bottom-0 w-px bg-brand-border-strong"
                      />
                    )}
                    <span
                      aria-hidden
                      className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-brand-accent ring-4 ring-brand-primary-soft"
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-brand-ink leading-relaxed break-words">
                        {entry.log}
                      </p>
                      {entry.created_at && (
                        <p className="text-xs text-brand-ink-muted mt-1.5">
                          {dayjs(entry.created_at)
                            .format("DD MMM YYYY, hh:mm A")
                            .toString()}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {!isClosed && (
            <div className="mt-6 border-t border-brand-border pt-5">
              <label
                htmlFor="batch_log"
                className="block text-sm font-medium text-brand-ink-soft mb-2"
              >
                Add a log entry
              </label>
              <textarea
                id="batch_log"
                rows={3}
                value={newLog}
                onChange={(e) => setNewLog(e.target.value)}
                placeholder="Enter farm log..."
                className="w-full rounded-lg border border-brand-border-strong px-3 py-2 text-sm text-brand-ink placeholder:text-brand-ink-muted focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none resize-none"
              />
              <div className="flex justify-end mt-3">
                <Button
                  variant="contained"
                  onClick={handleAddLog}
                  disabled={submitting || newLog.trim().length === 0}
                >
                  {submitting ? "Adding..." : "Add Log"}
                </Button>
              </div>
              {logError && (
                <p className="text-sm text-red-600 mt-2">{logError}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        isOpen={showConfirm}
        headerTitle="Close Batch"
        onClose={() => setShowConfirm(false)}
      >
        <DialogContent>
          <p className="text-sm text-brand-ink-soft leading-relaxed">
            This action will close the batch. Once closed, you will not be able
            to add new expenses, sales, or returns. You can still view the batch
            information. This action cannot be undone.
          </p>
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outlined" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={handleConfirmClose}
            >
              Proceed
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default BatchInformation;
