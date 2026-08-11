import type { ReactNode } from "react";

type Props = {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  valueClassName?: string;
};

const CardStat = ({ label, value, icon, valueClassName = "" }: Props) => {
  return (
    <div className="h-full rounded-xl border border-brand-border bg-brand-card p-4 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2 min-w-0">
          <h3 className="text-sm font-medium capitalize text-brand-ink-soft">
            {label}
          </h3>
          <p
            className={`text-2xl font-bold tracking-tight text-brand-ink tabular-nums ${valueClassName}`}
          >
            {value}
          </p>
        </div>
        {icon && (
          <div className="w-10 h-10 shrink-0 rounded-xl bg-brand-primary-soft text-brand-accent flex items-center justify-center">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardStat;
