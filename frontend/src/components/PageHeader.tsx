import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

const PageHeader = ({ title, subtitle, action }: Props) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold text-brand-ink">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-brand-ink-soft">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
