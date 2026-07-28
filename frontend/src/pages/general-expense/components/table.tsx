import type { GeneralExpenseRecord } from "@app-types/general-expense.types";
import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import DataNotFound from "@components/data-not-found";
import dayjs from "dayjs";
import { EditIcon } from "lucide-react";
import { roundNumber } from "@utils/number";
import { Box, Pagination } from "@mui/material";

const headers = ["Date", "Season", "Purpose", "Amount", "Action"];

type Props = {
  onEdit: (selectedId: number) => void;
  data: GeneralExpenseRecord[];
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
};

const GeneralExpenseTable = ({ onEdit, data, page, limit, onPageChange }: Props) => {
  const isEmpty = data.length === 0;

  const totalAmount = data.reduce(
    (acc, item) => acc + (parseFloat(item.amount.toString()) || 0),
    0,
  );

  const totalPages = Math.ceil(data.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedData = data.slice(startIndex, startIndex + limit);

  return (
    <div className="w-full">
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {paginatedData.map((item) => (
          <TableRow key={item.id}>
            <TableCell content={dayjs(item.date).format("DD-MM-YYYY")} />
            <TableCell
              content={item.season?.name || `Season ${item.season_id}`}
            />
            <TableCell content={item.purpose} />
            <TableCell content={item.amount || 0} />
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
      {!isEmpty && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
          <h5 className="text-md font-semibold text-gray-800">
            Total Amount: ₹{roundNumber(totalAmount)}
          </h5>
        </div>
      )}
      {totalPages > 1 && (
        <Box className="flex justify-end mt-4">
          <Pagination
            count={totalPages}
            size="small"
            page={page}
            onChange={(_, p) => onPageChange(p)}
          />
        </Box>
      )}
    </div>
  );
};

export default GeneralExpenseTable;
