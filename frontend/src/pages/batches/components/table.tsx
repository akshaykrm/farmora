import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { EditIcon } from "lucide-react";
import EmptyContentMessage from "@components/EmptyContentMessage";
import Ternary from "@components/ternary";
import type { Batch } from "../types";

const headers = ["ID", "Name", "Status", "Farm Name", "Season Name", "Action"];

type Props = {
  onEdit: (selectedId: number) => void;
  batches: Batch[];
};

const BatchTable = ({ onEdit, batches }: Props) => {
  const isEmpty = batches.length === 0;

  return (
    <>
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {batches.map((season, i) => (
          <TableRow key={season.id}>
            <TableCell content={i + 1} />
            <TableCell content={season.name} />
            <TableCell
              content={<span className="capitalize">{season.status}</span>}
            />
            <TableCell content={season.farm?.name || "-"} />
            <TableCell content={season.season?.name || "-"} />
            <TableCell
              content={
                <EditIcon
                  className="w-6 h-6 text-brand-ink-muted hover:text-brand-ink-soft cursor-pointer"
                  onClick={() => {
                    onEdit(season.id);
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
            title="No batches found"
            description="Get started by creating a new batch"
          />
        }
      />
    </>
  );
};

export default BatchTable;
