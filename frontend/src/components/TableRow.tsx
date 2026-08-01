import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

const TableRow = ({ children, className }: Props) => {
  return (
    <tr
      className={`border-b border-brand-border hover:bg-brand-canvas ${className || ""}`}
    >
      {children}
    </tr>
  );
};

export default TableRow;
