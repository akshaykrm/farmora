import Card from "@mui/material/Card";
import type { ReactNode } from "react";

type Props = {
  title?: string;
  children: ReactNode;
  className?: string;
};

const FilterCard = ({ title, children, className = "" }: Props) => {
  return (
    <Card className={`p-6 mb-6 ${className}`}>
      {title && (
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-ink">
          {title}
        </h3>
      )}
      {children}
    </Card>
  );
};

export default FilterCard;
