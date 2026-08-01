import type { WorkingCostRecord } from "../types";
import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import DataNotFound from "@components/data-not-found";
import dayjs from "dayjs";
import { formatCurrency } from "@utils/currency";

const headers = ["Date", "Purpose", "Amount"];

type Props = {
  data: WorkingCostRecord[];
  title: string;
};

const WorkingCostTable = (props: Props) => {
  const { data, title } = props;

  return (
    <Table title={title}>
      <TableRow>
        {headers.map((header) => (
          <TableHeaderCell key={header} content={header} />
        ))}
      </TableRow>
      {data.map((item) => (
        <TableRow key={item.id}>
          <TableCell content={dayjs(item.date).format("DD-MM-YYYY")} />
          <TableCell content={item.purpose} />
          <TableCell content={formatCurrency(item.amount)} />
        </TableRow>
      ))}
      {data.length === 0 && (
        <DataNotFound
          title={`No ${title.toLowerCase()} records found`}
          description={`No ${title.toLowerCase()} data found`}
        />
      )}
    </Table>
  );
};

export default WorkingCostTable;
