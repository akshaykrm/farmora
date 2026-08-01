import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  title?: string;
  className?: string;
};

const Table = ({ children, title, className = "" }: Props) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      {title && (
        <h3 className="px-4 pt-4 pb-3 text-sm font-semibold uppercase tracking-wide text-brand-ink">
          {title}
        </h3>
      )}
      <table className="min-w-full bg-brand-card border-collapse">
        <tbody>{children}</tbody>
      </table>
    </div>
  );
};

export default Table;
