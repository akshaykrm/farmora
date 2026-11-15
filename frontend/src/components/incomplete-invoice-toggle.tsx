import { Checkbox, FormControlLabel } from "@mui/material";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const IncompleteInvoiceToggle = ({ checked, onChange }: Props) => (
  <div className="col-span-full rounded-md border border-brand-warning-soft bg-brand-warning-soft/40 px-3 py-1">
    <FormControlLabel
      control={
        <Checkbox
          size="small"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
      }
      label={
        <span className="text-sm text-brand-ink">
          Mark as incomplete
          <span className="block text-xs text-brand-ink-muted">
            Needs further editing. Incomplete invoices block closing the batch
            or season and show up on the dashboard.
          </span>
        </span>
      }
    />
  </div>
);

export default IncompleteInvoiceToggle;
