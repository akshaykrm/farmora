import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  icon: ReactNode;
};

const SectionHeader = ({ title, icon }: SectionHeaderProps) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="p-1.5 bg-brand-success-soft text-brand-success rounded-lg">{icon}</div>
    <h2 className="text-lg font-bold text-brand-ink tracking-tight">{title}</h2>
  </div>
);

export default SectionHeader;
