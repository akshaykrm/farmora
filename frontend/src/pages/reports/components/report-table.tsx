import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import PaginationWithLimit from "@components/pagination-with-limit";
import type { ReportColumn, ReportSection } from "../types";
import { formatReportValue } from "../format";

const alignRight = (column: ReportColumn) =>
  column.type === "number" || column.type === "currency" ? "text-right" : "";

type Props = {
  section: ReportSection;
  onPageChange: (update: { page?: number; limit?: number }) => void;
};

const ReportTable = ({ section, onPageChange }: Props) => {
  const { columns, rows, total, pagination } = section;
  const [first] = columns;

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card shadow-sm">
      <Table title={section.title}>
        <TableRow>
          {columns.map((column) => (
            <TableHeaderCell
              key={column.key}
              content={column.header}
              className={alignRight(column)}
            />
          ))}
        </TableRow>
        {rows.map((row, index) => (
          <TableRow key={index}>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                content={formatReportValue(row[column.key], column.type)}
                className={`tabular-nums ${alignRight(column)}`}
              />
            ))}
          </TableRow>
        ))}
        {rows.length > 0 && total && (
          <TableRow className="bg-brand-card-soft font-semibold">
            {columns.map((column) => (
              <TableCell
                key={column.key}
                content={
                  column.key === first.key
                    ? String(total[column.key] ?? "Total")
                    : total[column.key] === undefined
                      ? ""
                      : formatReportValue(total[column.key], column.type)
                }
                className={`tabular-nums text-brand-ink ${alignRight(column)}`}
              />
            ))}
          </TableRow>
        )}
      </Table>
      {rows.length === 0 && (
        <p className="px-4 py-8 text-center text-sm text-brand-ink-muted">
          No records for the selected filters
        </p>
      )}
      {pagination && (
        <div className="px-4 pb-4">
          <PaginationWithLimit
            page={pagination.page}
            limit={pagination.limit}
            limits={[25, 50, 100, 200]}
            totalPages={pagination.totalPages}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default ReportTable;
