import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import EmptyContentMessage from "@components/EmptyContentMessage";
import Ternary from "@components/ternary";
import { EditIcon } from "lucide-react";
import type { Vendor } from "../types";

const headers = [
  "ID",
  "Name",
  "Status",
  "Address",
  "Opening Balance",
  "Type",
  "Action",
];

type Props = {
  onEdit: (selectedId: number) => void;
  vendors: Vendor[];
};

const VendorTable = ({ onEdit, vendors }: Props) => {
  const isEmpty = vendors.length === 0;

  return (
    <>
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {vendors.map((vendor, i) => (
          <TableRow key={vendor.id}>
            <TableCell content={i + 1} />
            <TableCell content={vendor.name} />
            <TableCell content={vendor.status} />
            <TableCell content={vendor.address} />
            <TableCell content={vendor.opening_balance} />
            <TableCell content={vendor.vendor_type} />
            <TableCell
              content={
                <EditIcon
                  className="w-6 h-6 text-brand-ink-muted hover:text-brand-ink-soft cursor-pointer"
                  onClick={() => {
                    onEdit(vendor.id);
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
            title="No vendors found"
            description="Get started by creating a new vendor"
          />
        }
      />
    </>
  );
};

export default VendorTable;
