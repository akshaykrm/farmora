import type { ReactNode } from "react";

type Props = {
  title?: string;
  children: ReactNode;
  className?: string;
};

const FilterCard = ({ title, children, className = "" }: Props) => {
  return (
    <section className={`mb-6 border-b border-brand-border pb-5 ${className}`}>
      {title && (
        <h3 className="mb-4 text-sm font-semibold text-brand-ink">
          {title}
        </h3>
      )}
      {children}
    </section>
  );
};

export default FilterCard;
