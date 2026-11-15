import type { ReactNode } from "react";
import { Dialog, DialogActions, DialogContent } from "@components/dialog";

export type DetailRow = {
  label: string;
  value: ReactNode;
};

type Props = {
  title: string;
  rows: DetailRow[];
  isOpen: boolean;
  onClose: () => void;
};

const ViewDetailsDialog = ({ title, rows, isOpen, onClose }: Props) => {
  return (
    <Dialog headerTitle={title} isOpen={isOpen} onClose={onClose}>
      <DialogContent>
        <dl className="divide-y divide-brand-border">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-4 py-2">
              <dt className="text-sm text-brand-ink-muted">{row.label}</dt>
              <dd className="text-sm text-brand-ink text-right break-words">
                {row.value ?? "-"}
              </dd>
            </div>
          ))}
        </dl>
      </DialogContent>
      <DialogActions>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm rounded-lg border border-brand-border text-brand-ink hover:bg-brand-border/40 cursor-pointer"
        >
          Close
        </button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewDetailsDialog;
