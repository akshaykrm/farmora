import batchOverview from "@api/batch-overview.api";
import { Dialog, DialogContent } from "@components/dialog";
import Ternary from "@components/ternary";
import { Button } from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import type { BatchOverviewBatch } from "../types";

type Props = {
  batch?: BatchOverviewBatch;
  refetch: () => void;
};

function BatchInformation({ batch, refetch }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [closingStatement, setClosingStatement] = useState("");

  if (!batch) return null;

  const handleConfirmClose = async () => {
    const response = await batchOverview.closeBatch(
      batch.id,
      closingStatement || undefined,
    );
    if (response.status === "success") {
      setShowConfirm(false);
      setClosingStatement("");
      refetch();
      const batchClosed = new CustomEvent("batchOverview:batch-closed", {
        detail: {
          status: "closed",
        },
      });
      document.dispatchEvent(batchClosed);
    }
  };

  return (
    <section className="mb-6 border-b border-brand-border pb-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-brand-ink-soft">Batch</p>
          <p className="text-lg font-semibold">{batch.name}</p>
        </div>
        <div>
          <p className="text-sm text-brand-ink-soft">Season</p>
          <p className="text-lg font-semibold">{batch.season?.name || "N/A"}</p>
        </div>
        <div className="flex justify-end items-center">
          <Ternary
            when={!batch.closed_on}
            then={
              <Button variant="contained" onClick={() => setShowConfirm(true)}>
                Close Batch
              </Button>
            }
            otherwise={
              <div className="text-right">
                <p className="text-sm text-brand-ink-soft">
                  Closed on:&nbsp;
                  {dayjs(batch.closed_on).format("DD MMM YYYY").toString()}
                </p>
                {batch.closing_statement && (
                  <p className="text-sm text-brand-ink-muted mt-1 italic">
                    "{batch.closing_statement}"
                  </p>
                )}
              </div>
            }
          />
        </div>
      </div>

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
          <div className="mt-4">
            <label
              htmlFor="closing_statement"
              className="block text-sm font-medium text-brand-ink-soft mb-1"
            >
              Closing Statement{" "}
              <span className="text-brand-ink-muted font-normal">(optional)</span>
            </label>
            <textarea
              id="closing_statement"
              rows={3}
              value={closingStatement}
              onChange={(e) => setClosingStatement(e.target.value)}
              placeholder="Add a note about why this batch is being closed..."
              className="w-full rounded-lg border border-brand-border-strong px-3 py-2 text-sm text-brand-ink placeholder:text-brand-ink-muted focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none resize-none"
            />
          </div>
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
