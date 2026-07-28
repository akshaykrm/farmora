import type { GeneralExpenseRecord } from "@app-types/general-expense.types";
import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import DataNotFound from "@components/data-not-found";
import { formatCurrency } from "@utils/currency";
import dayjs from "dayjs";
import { EditIcon } from "lucide-react";

const headers = ["Date", "Season", "Purpose", "Amount", "Action"];

type Props = {
  onEdit: (selectedId: number) => void;
  data: GeneralExpenseRecord[];
};

const GeneralExpenseTable = ({ onEdit, data }: Props) => {
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
                  className="w-6 h-6 text-gray-600 hover:text-gray-800 cursor-pointer"
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
        <DataNotFound
          title="No general expense records found"
          description="No general expense items found for the selected season and date range"
        />
      )}
    </div>
  );
};

export default GeneralExpenseTable;
