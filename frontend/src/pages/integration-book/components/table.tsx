import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import DataNotFound from "@components/data-not-found";
import dayjs from "dayjs";
import { formatCurrency } from "@utils/currency";

const headers = ["Date", "Purpose", "Amount"];

type IntegrationBookRow = {
  id: number;
  date: string;
  name: string;
  net_amount: string;
};

type Props = {
  data: IntegrationBookRow[];
  title: string;
};

const IntegrationBookTable = (props: Props) => {
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
          <TableCell content={item.name} />
          <TableCell content={formatCurrency(parseFloat(item.net_amount))} />
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

export default IntegrationBookTable;
