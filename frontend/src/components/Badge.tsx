import type { ReactNode } from "react";

type Variant = "success" | "warning" | "danger" | "info" | "neutral";

const variantClasses: Record<Variant, string> = {
  success: "bg-brand-success-soft text-brand-success-strong",
  warning: "bg-brand-warning-soft text-brand-warning-strong",
  danger: "bg-brand-danger-soft text-brand-danger-strong",
  info: "bg-brand-info-soft text-brand-info-strong",
  neutral: "bg-brand-card-soft text-brand-ink-soft",
};

type Props = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

const Badge = ({ children, variant = "neutral", className = "" }: Props) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
