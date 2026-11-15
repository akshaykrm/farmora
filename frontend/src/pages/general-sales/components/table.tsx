import type { GeneralSalesRecord } from "@app-types/general-sales.types";
import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import EmptyContentMessage from "@components/EmptyContentMessage";
import { formatCurrency } from "@utils/currency";
import dayjs from "dayjs";
import { EditIcon, EyeIcon } from "lucide-react";
import { useState } from "react";
import ViewDetailsDialog from "@components/view-details-dialog";

const headers = ["Date", "Season", "Purpose", "Amount", "Action"];

type Props = {
  onEdit: (selectedId: number) => void;
  data: GeneralSalesRecord[];
};

const GeneralSalesTable = ({ onEdit, data }: Props) => {
  const isEmpty = data.length === 0;
  const [viewing, setViewing] = useState<GeneralSalesRecord | null>(null);

  return (
    <div className="w-full">
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell content={dayjs(item.date).format("DD-MM-YYYY")} />
            <TableCell
              content={item.season?.name || `Season ${item.season_id}`}
            />
            <TableCell content={item.purpose} />
            <TableCell content={formatCurrency(item.amount || 0)} />
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
        ))}
      </Table>
      {isEmpty && (
        <EmptyContentMessage
          title="No general sales records found"
          description="No general sales items found for the selected season and date range"
        />
      )}
      <ViewDetailsDialog
        title="General Sales Details"
        isOpen={viewing !== null}
        onClose={() => setViewing(null)}
        rows={[
          {
            label: "Date",
            value: viewing ? dayjs(viewing.date).format("DD-MM-YYYY") : "-",
          },
          {
            label: "Season",
            value:
              viewing?.season?.name ||
              (viewing ? `Season ${viewing.season_id}` : "-"),
          },
          { label: "Purpose", value: viewing?.purpose },
          { label: "Amount", value: formatCurrency(viewing?.amount || 0) },
          { label: "Narration", value: viewing?.narration || "-" },
        ]}
      />
    </div>
  );
};

export default GeneralSalesTable;
