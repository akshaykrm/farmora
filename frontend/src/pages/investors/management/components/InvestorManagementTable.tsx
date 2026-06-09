import Table from "@components/Table";
import dayjs from "dayjs";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import DataNotFound from "@components/data-not-found";
import Ternary from "@components/ternary";
import { EditIcon } from "lucide-react";
import { useMemo } from "react";
import type { InvestorListResponse } from "../types";

const headers = [
  "ID",
  "Name",
  "Phone",
  "Email",
  "Status",
  "Crated Date",
  "Action",
];

type Props = {
  onEdit: (selectedId: number) => void;
  data: InvestorListResponse;
};

const InvestorManagementTable = (props: Props) => {
  const { onEdit, data } = props;

  const isEmpty = useMemo(() => {
    return data.data.length === 0;
  }, [data.data]);

  return (
    <>
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {data.data.map((investor, i) => (
          <TableRow key={investor.id}>
            <TableCell content={i + 1} />
            <TableCell content={investor.investor_name} />
            <TableCell content={investor.investor_phone} />
            <TableCell content={investor.investor_email ?? "-"} />
            <TableCell
              content={
                <span
                  className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                    investor.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {investor.is_active ? "Active" : "Inactive"}
                </span>
              }
            />
            <TableCell
              content={dayjs(investor.createdAt).format("DD-MM-YYYY") ?? "-"}
            />
            <TableCell
              content={
                <EditIcon
                  className="w-6 h-6 text-gray-600 hover:text-gray-800 cursor-pointer"
                  onClick={() => {
                    onEdit(investor.id);
                  }}
                />
              }
            />
          </TableRow>
        ))}
      </Table>
      <Ternary
        when={isEmpty}
        then={
          <DataNotFound
            title="No investors found"
            description="Get started by creating a new investor"
          />
        }
      />
    </>
  );
};

export default InvestorManagementTable;
