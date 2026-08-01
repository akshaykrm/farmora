import type { GeneralSalesRecord } from "@app-types/general-sales.types";
import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import EmptyContentMessage from "@components/EmptyContentMessage";
import { formatCurrency } from "@utils/currency";
import dayjs from "dayjs";
import { EditIcon } from "lucide-react";

const headers = ["Date", "Season", "Purpose", "Amount", "Action"];

type Props = {
  onEdit: (selectedId: number) => void;
  data: GeneralSalesRecord[];
};

const GeneralSalesTable = ({ onEdit, data }: Props) => {
  const isEmpty = data.length === 0;

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
                <EditIcon
                  className="w-6 h-6 text-brand-ink-muted hover:text-brand-ink-soft cursor-pointer"
                  onClick={() => {
                    onEdit(item.id);
                  }}
                />
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
    </div>
  );
};

export default GeneralSalesTable;
