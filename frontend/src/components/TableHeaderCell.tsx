type Props = {
  content: React.ReactNode;
  className?: string;
};

const TableHeaderCell = ({ content, className }: Props) => {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-brand-charcoal bg-brand-mint text-left whitespace-nowrap ${className || ""}`}
    >
      {content}
    </th>
  );
};

export default TableHeaderCell;
