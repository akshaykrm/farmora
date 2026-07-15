import batchOverview from "@api/batch-overview.api";
import type { BatchOverviewBatch } from "@app-types/batch-overview.types";
import { Dialog, DialogContent } from "@components/dialog";
import Ternary from "@components/ternary";
import { Button } from "@mui/material";
import dayjs from "dayjs";
import { useCallback, useState } from "react";

type Props = {
  batch: BatchOverviewBatch;
};

const BatchInformation = ({ batch }: Props) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [closingStatement, setClosingStatement] = useState("");

  const handleConfirmClose = useCallback(async () => {
    const response = await batchOverview.closeBatch(
      batch.id,
      closingStatement || undefined,
    );
    if (response.status === "success") {
      setShowConfirm(false);
      setClosingStatement("");
      const batchClosed = new CustomEvent("batchOverview:batch-closed", {
        detail: {
          status: "closed",
        },
      });
      document.dispatchEvent(batchClosed);
    }
  }, [batch.id, closingStatement]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-gray-600">Batch</p>
          <p className="text-lg font-semibold">{batch.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Season</p>
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
                <p className="text-sm text-gray-600">
                  Closed on:&nbsp;
                  {dayjs(batch.closed_on).format("DD MMM YYYY").toString()}
                </p>
                {batch.closing_statement && (
                  <p className="text-sm text-gray-500 mt-1 italic">
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
          <p className="text-sm text-gray-600 leading-relaxed">
            This action will close the batch. Once closed, you will not be
            able to add new expenses, sales, or returns. You can still view
            the batch information. This action cannot be undone.
          </p>
          <div className="mt-4">
            <label
              htmlFor="closing_statement"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Closing Statement{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="closing_statement"
              rows={3}
              value={closingStatement}
              onChange={(e) => setClosingStatement(e.target.value)}
              placeholder="Add a note about why this batch is being closed..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none resize-none"
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
    </div>
  );
};

export default BatchInformation;
