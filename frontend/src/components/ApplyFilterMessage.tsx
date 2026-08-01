import { SlidersHorizontal } from "lucide-react";

type Props = {
  title?: string;
  description?: string;
};

const ApplyFilterMessage = ({
  title = "Apply filters",
  description = "Select the filters above and click Apply to view data",
}: Props) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary-soft text-brand-accent">
        <SlidersHorizontal className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-medium mb-1 text-brand-ink">{title}</h3>
      <p className="text-sm text-brand-ink-muted">{description}</p>
    </div>
  );
};

export default ApplyFilterMessage;
