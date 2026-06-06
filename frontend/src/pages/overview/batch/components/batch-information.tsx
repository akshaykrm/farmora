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

  const handleConfirmClose = useCallback(async () => {
    const response = await batchOverview.closeBatch(batch.id);
    if (response.status === "success") {
      setShowConfirm(false);
      const batchClosed = new CustomEvent("batchOverview:batch-closed", {
        detail: {
          status: "closed",
        },
      });
      document.dispatchEvent(batchClosed);
    }
  }, [batch.id]);

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
              <p>
                Closed on:&nbsp;
                {dayjs(batch.closed_on).format("DD MMM YYYY").toString()}
              </p>
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
          <div className="flex justify-end mt-6 gap-2">
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
