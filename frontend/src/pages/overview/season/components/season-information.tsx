import { Dialog, DialogContent } from "@components/dialog";
import Ternary from "@components/ternary";
import { Button } from "@mui/material";
import dayjs from "dayjs";
import { useCallback, useState } from "react";
import seasonOverview from "../api";

type SeasonInformationProps = {
  name: string;
  batchLength: number;
  closedOn: string | null;
  season_id: number | null;
};

const SeasonInformation = (props: SeasonInformationProps) => {
  const { batchLength, name, closedOn, season_id } = props;
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirmClose = useCallback(async () => {
    if (!season_id) {
      return;
    }
    const response = await seasonOverview.closeSeason(season_id);
    if (response.status === "success") {
      setShowConfirm(false);
      const seasonClosed = new CustomEvent("seasonOverview:season-closed", {
        detail: {
          status: "closed",
        },
      });
      document.dispatchEvent(seasonClosed);
    }
  }, [season_id]);

  return (
    <section className="mb-6 border-b border-brand-border pb-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-brand-ink-soft">Season</p>
          <p className="text-lg font-semibold">{name}</p>
        </div>
        <div>
          <p className="text-sm text-brand-ink-soft">Total Batches</p>
          <p className="text-lg font-semibold">{batchLength}</p>
        </div>
        <div className="flex justify-end w-full items-center">
          <Ternary
            when={closedOn === null}
            then={
              <Button variant="contained" onClick={() => setShowConfirm(true)}>
                Close Season
              </Button>
            }
            otherwise={
              <p>
                Closed on:&nbsp;
                {dayjs(closedOn).format("DD MMM YYYY").toString()}
              </p>
            }
          />
        </div>
      </div>

      <Dialog
        isOpen={showConfirm}
        headerTitle="Close Season"
        onClose={() => setShowConfirm(false)}
      >
        <DialogContent>
          <p className="text-sm text-brand-ink-soft leading-relaxed">
            This action will close the season. Once closed, you will not be
            able to add new batches, expenses, sales, or returns. You can
            still view the season information. This action cannot be undone.
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
    </section>
  );
};

export default SeasonInformation;
