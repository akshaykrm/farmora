import dayjs from "dayjs";
import { IconButton, Tooltip } from "@mui/material";
import { Pencil, Trash2 } from "lucide-react";
import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { ClipText } from "@components/narration";
import type { DailyLogRow } from "../types";

type Props = {
  rows: DailyLogRow[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (row: DailyLogRow) => void;
  onDelete: (row: DailyLogRow) => void;
};

const headers = [
  "Date",
  "Age",
  "Mort",
  "Cum Mort",
  "Issued Feed",
  "Cons Feed",
  "Total Cons",
  "Feed Stock",
  "Birds Alive",
  "Avg Wt (kg)",
  "Remarks",
];

const num = (value: number | null) =>
  value === null || value === undefined
    ? "-"
    : Number.isInteger(value)
      ? String(value)
      : value.toFixed(2);

const LogTable = ({ rows, canEdit, canDelete, onEdit, onDelete }: Props) => {
  const showActions = canEdit || canDelete;

  return (
    <>
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
          {showActions && <TableHeaderCell content="" />}
        </TableRow>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell content={dayjs(row.date).format("DD-MM-YYYY")} />
            <TableCell content={row.age ?? "-"} />
            <TableCell content={row.mortality} />
            <TableCell content={row.cum_mortality} />
            <TableCell content={row.issued_feed ? num(row.issued_feed) : "-"} />
            <TableCell content={num(row.consumed_feed)} />
            <TableCell content={num(row.total_consumption)} />
            <TableCell
              content={num(row.feed_stock)}
              className={row.feed_stock < 0 ? "!text-red-600" : ""}
            />
            <TableCell content={row.birds_alive} />
            <TableCell content={num(row.avg_body_weight)} />
            <TableCell content={<ClipText value={row.remarks || "-"} />} />
            {showActions && (
              <TableCell
                content={
                  <div className="flex justify-end gap-1">
                    {canEdit && (
                      <Tooltip title="Edit" arrow>
                        <IconButton size="small" onClick={() => onEdit(row)}>
                          <Pencil className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                    )}
                    {canDelete && (
                      <Tooltip title="Delete" arrow>
                        <IconButton size="small" onClick={() => onDelete(row)}>
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                }
              />
            )}
          </TableRow>
        ))}
      </Table>
      {rows.length === 0 && (
        <div className="bg-brand-canvas p-6 text-center text-brand-ink-muted">
          No daily logs recorded yet
        </div>
      )}
    </>
  );
};

export default LogTable;
