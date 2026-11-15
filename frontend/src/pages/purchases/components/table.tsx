import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { EditIcon, EyeIcon } from "lucide-react";
import { useMemo, useState } from "react";
import ViewDetailsDialog from "@components/view-details-dialog";
import EmptyContentMessage from "@components/EmptyContentMessage";
import Ternary from "@components/ternary";
import dayjs from "dayjs";
import type { Purchase } from "../types";
import { formatCurrency } from "@utils/currency";
import Badge from "@components/Badge";

const headers = [
  "Invoice Number",
  "Invoice Date",
  "Supplier Name",
  "Item",
  "Batch",
  "Quantity",
  "Price",
  "Total Amount",
  "Action",
];

type Props = {
  onEdit: (selectedId: number) => void;
  data: Purchase[];
};

const ItemTable = ({ onEdit, data }: Props) => {
  const [viewing, setViewing] = useState<Purchase | null>(null);
  const isEmpty = useMemo(() => {
    return data.length === 0;
  }, [data]);

  return (
    <>
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {data.map((item) => {
          return (
            <TableRow key={item.id}>
              <TableCell
                content={
                  <div className="flex flex-col items-start gap-1">
                    <span>{item.invoice_number}</span>
                    {item.is_incomplete && (
                      <Badge variant="warning">Incomplete</Badge>
                    )}
                  </div>
                }
              />
              <TableCell
                content={dayjs(item.invoice_date).format("DD-MM-YYYY")}
              />
              <TableCell content={item.vendor?.name} />
              <TableCell
                content={
                  item.category ? (
                    <div>
                      <p>{item.category.name}</p>
                      <p className="text-xs capitalize text-brand-ink-muted">
                        {item.category.type}
                      </p>
                    </div>
                  ) : (
                    "-"
                  )
                }
              />
              <TableCell content={item.batch?.name || "-"} />
              <TableCell content={item.quantity || "-"} />
              <TableCell content={formatCurrency(item.price_per_unit)} />
              <TableCell content={formatCurrency(item.total_price)} />
              <TableCell
                content={
                  <div className="flex items-center gap-3">
                  <EyeIcon
                    className="w-6 h-6 text-brand-ink-muted hover:text-brand-ink-soft cursor-pointer"
                    onClick={() => setViewing(item)}
                  />
                  <EditIcon
                    className="w-6 h-6 text-brand-ink-muted hover:text-brand-ink-soft cursor-pointer"
                    onClick={() => {
                      onEdit(item.id);
                    }}
                  />
                </div>
                }
              />
            </TableRow>
          );
        })}
      </Table>

      <ViewDetailsDialog
        title="Purchase Details"
        isOpen={viewing !== null}
        onClose={() => setViewing(null)}
        rows={[
          { label: "Invoice Number", value: viewing?.invoice_number || "-" },
          { label: "Invoice Date", value: viewing ? dayjs(viewing.invoice_date).format("DD-MM-YYYY") : "-" },
          { label: "Supplier", value: viewing?.vendor?.name || "-" },
          { label: "Item", value: viewing?.category?.name || "-" },
          { label: "Batch", value: viewing?.batch?.name || "-" },
          { label: "Quantity", value: viewing?.quantity || "-" },
          { label: "Price", value: formatCurrency(viewing?.price_per_unit ?? 0) },
          { label: "Total Price", value: formatCurrency(viewing?.total_price ?? 0) },
          { label: "Discount", value: formatCurrency(viewing?.discount_price ?? 0) },
          { label: "Net Amount", value: formatCurrency(viewing?.net_amount ?? 0) },
          { label: "Payment", value: <span className="capitalize">{viewing?.payment_type || "-"}</span> },
          { label: "Narration", value: viewing?.narration || "-" },
        ]}
      />
      <Ternary
        when={isEmpty}
        then={
          <EmptyContentMessage
            title="No purchases found"
            description="Try adjusting your filters or create a new purchase"
          />
        }
      />
    </>
  );
};

export default ItemTable;
