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

const feedHeader = "bg-brand-canvas";

const headers: { label: string; className?: string }[] = [
  { label: "Date" },
  { label: "Age" },
  { label: "Mortality" },
  { label: "Cum. Mortality" },
  { label: "Birds Alive" },
  { label: "Feed Issued", className: feedHeader },
  { label: "Feed Consumed", className: feedHeader },
  { label: "Total Consumed", className: feedHeader },
  { label: "Feed Stock", className: feedHeader },
  { label: "Avg Wt (kg)" },
  { label: "Remarks" },
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
    <Table>
      <TableRow>
        {headers.map((header) => (
          <TableHeaderCell
            key={header.label}
            content={header.label}
            className={header.className}
          />
        ))}
        {showActions && <TableHeaderCell content="" />}
      </TableRow>
      {rows.map((row) => (
        <TableRow key={row.id}>
          <TableCell
            content={dayjs(row.date).format("DD-MM-YYYY")}
            className="font-medium !text-brand-ink"
          />
          <TableCell content={row.age === null ? "-" : `Day ${row.age}`} />
          <TableCell
            content={row.mortality}
            className={row.mortality > 0 ? "font-semibold !text-red-600" : ""}
          />
          <TableCell content={row.cum_mortality} />
          <TableCell
            content={row.birds_alive.toLocaleString()}
            className="font-semibold !text-brand-ink"
          />
          <TableCell
            content={row.issued_feed ? num(row.issued_feed) : "-"}
            className="bg-brand-canvas/40"
          />
          <TableCell
            content={num(row.consumed_feed)}
            className="bg-brand-canvas/40"
          />
          <TableCell
            content={num(row.total_consumption)}
            className="bg-brand-canvas/40"
          />
          <TableCell
            content={num(row.feed_stock)}
            className={`bg-brand-canvas/40 font-semibold ${row.feed_stock < 0 ? "!text-red-600" : "!text-brand-ink"}`}
          />
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
  );
};

export default LogTable;
