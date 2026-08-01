import Table from "@components/Table";
import dayjs from "dayjs";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import EmptyContentMessage from "@components/EmptyContentMessage";
import Ternary from "@components/ternary";
import { EditIcon } from "lucide-react";
import type { Investor } from "../types";

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
  investors: Investor[];
};

const InvestorManagementTable = ({ onEdit, investors }: Props) => {
  const isEmpty = investors.length === 0;

  return (
    <>
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {investors.map((investor, i) => (
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
          <EmptyContentMessage
            title="No investors found"
            description="Get started by creating a new investor"
          />
        }
      />
    </>
  );
};

export default InvestorManagementTable;
