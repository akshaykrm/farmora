import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { EditIcon, EyeIcon } from "lucide-react";
import { useState } from "react";
import ViewDetailsDialog from "@components/view-details-dialog";
import { formatCurrency } from "@utils/currency";
import Tooltip from "@mui/material/Tooltip";
import EmptyContentMessage from "@components/EmptyContentMessage";
import Ternary from "@components/ternary";
import dayjs from "dayjs";
import type { Sale } from "@app-types/sales.types";
import Badge from "@components/Badge";

const headers = [
  "ID",
  "Date",
  "Season",
  "Batch",
  "Customer",
  "Vehicle No",
  "Weight (kg)",
  "Birds",
  "Avg Weight",
  "Price",
  "Amount",
  "Narration",
  "Payment",
  "Action",
];

type Props = {
  onEdit: (selectedId: number) => void;
  data: Sale[];
};

const SalesTable = ({ onEdit, data }: Props) => {
  const isEmpty = data.length === 0;
  const [viewing, setViewing] = useState<Sale | null>(null);

  return (
    <div className="w-full">
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {data.map((sale, i) => (
          <TableRow key={sale.id}>
            <TableCell
              content={
                <div className="flex flex-col items-start gap-1">
                  <span>{i + 1}</span>
                  {sale.is_incomplete && (
                    <Badge variant="warning">Incomplete</Badge>
                  )}
                </div>
              }
            />
            <TableCell content={dayjs(sale.date).format("DD-MM-YYYY")} />
            <TableCell content={sale.season?.name} />
            <TableCell content={sale.batch?.name} />
            <TableCell content={sale.buyer?.name} />
            <TableCell content={sale.vehicle_no || "-"} />
            <TableCell content={sale.weight} />
            <TableCell content={sale.bird_no} />
            <TableCell content={sale.avg_weight} />
            <TableCell content={`${sale.price}`} />
            <TableCell content={`${sale.amount}`} />
            <TableCell
              content={
                <Tooltip
                  title={sale.narration}
                  placement="top"
                  arrow
                  disableHoverListener={!sale.narration}
                >
                  <span className="block max-w-40 truncate cursor-pointer">
                    {sale.narration || "-"}
                  </span>
                </Tooltip>
              }
            />
            <TableCell
              content={
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    sale.payment_type === "cash"
                      ? "bg-brand-success-soft text-brand-success-strong"
                      : "bg-brand-warning-soft text-brand-warning-strong"
                  }`}
                >
                  {sale.payment_type.toUpperCase()}
                </span>
              }
            />
            <TableCell
              content={
                <div className="flex items-center gap-3">
                  <EyeIcon
                    className="w-6 h-6 text-brand-ink-muted hover:text-brand-ink-soft cursor-pointer"
                    onClick={() => setViewing(sale)}
                  />
                  <EditIcon
                  className="w-6 h-6 text-brand-ink-muted hover:text-brand-ink-soft cursor-pointer"
                  onClick={() => {
                    onEdit(sale.id);
                  }}
                />
                </div>
              }
            />
          </TableRow>
        ))}
      </Table>
      <ViewDetailsDialog
        title="Sale Details"
        isOpen={viewing !== null}
        onClose={() => setViewing(null)}
        rows={[
          { label: "Date", value: viewing ? dayjs(viewing.date).format("DD-MM-YYYY") : "-" },
          { label: "Season", value: viewing?.season?.name || "-" },
          { label: "Batch", value: viewing?.batch?.name || "-" },
          { label: "Customer", value: viewing?.buyer?.name || "-" },
          { label: "Vehicle No", value: viewing?.vehicle_no || "-" },
          { label: "Weight (kg)", value: viewing?.weight ?? "-" },
          { label: "Birds", value: viewing?.bird_no ?? "-" },
          { label: "Avg Weight", value: viewing?.avg_weight ?? "-" },
          { label: "Price", value: formatCurrency(viewing?.price ?? 0) },
          { label: "Amount", value: formatCurrency(viewing?.amount ?? 0) },
          { label: "Payment", value: viewing?.payment_type.toUpperCase() ?? "-" },
          { label: "Narration", value: viewing?.narration || "-" },
        ]}
      />
      <Ternary
        when={isEmpty}
        then={
          <EmptyContentMessage
            title="No sales found"
            description="Get started by creating a new sale"
          />
        }
      />
    </div>
  );
};

export default SalesTable;
