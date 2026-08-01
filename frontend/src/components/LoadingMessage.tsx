import { Loader2 } from "lucide-react";

type Props = {
  title?: string;
  description?: string;
};

const LoadingMessage = ({
  title = "Loading...",
  description = "Please wait while we fetch the data",
}: Props) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary-soft text-brand-primary">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
      <h3 className="text-lg font-medium mb-1 text-brand-ink">{title}</h3>
      <p className="text-sm text-brand-ink-muted">{description}</p>
    </div>
  );
};

export default LoadingMessage;
