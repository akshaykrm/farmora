type Props = {
  content: React.ReactNode;
  className?: string;
};

const TableHeaderCell = ({ content, className }: Props) => {
  return (
    <th
      className={`whitespace-nowrap bg-brand-card-soft px-4 py-3 text-left text-xs font-semibold tracking-wider text-brand-ink uppercase ${className || ""}`}
    >
      {content}
    </th>
  );
};

export default TableHeaderCell;
