import Badge from "@components/Badge";
import { Dialog, DialogContent } from "@components/dialog";
import Ternary from "@components/ternary";
import { CalendarDays } from "lucide-react";
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

  const isClosed = Boolean(closedOn);

  return (
    <section className="mb-6 rounded-xl border border-brand-border bg-brand-card p-4 shadow-xs">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-10 h-10 shrink-0 rounded-xl bg-brand-primary-soft text-brand-accent flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-brand-ink truncate">
                {name}
              </h2>
              <Badge variant={isClosed ? "neutral" : "success"}>
                {isClosed ? "Closed" : "Active"}
              </Badge>
            </div>
            <p className="text-sm text-brand-ink-soft mt-0.5">
              Total batches: {batchLength}
            </p>
          </div>
        </div>
        <div className="flex justify-end items-center shrink-0">
          <Ternary
            when={closedOn === null}
            then={
              <Button variant="contained" onClick={() => setShowConfirm(true)}>
                Close Season
              </Button>
            }
            otherwise={
              <p className="text-sm text-brand-ink-soft">
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
