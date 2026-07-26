import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import type { Season } from "../types";
import dayjs from "dayjs";
import { EditIcon } from "lucide-react";
import DataNotFound from "@components/data-not-found";
import Ternary from "@components/ternary";

const headers = ["ID", "Name", "Status", "From Date", "End Date", "Action"];

type Props = {
  onEdit: (selectedId: number) => void;
  seasons: Season[];
};

const SeasonTable = ({ onEdit, seasons }: Props) => {
  const isEmpty = seasons.length === 0;

  return (
    <>
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {seasons.map((season, i) => (
          <TableRow key={season.id}>
            <TableCell content={i + 1} />
            <TableCell content={season.name} />
            <TableCell content={season.status} />
            <TableCell
              content={dayjs(season.from_date).format("DD-MM-YYYY")}
            />
            <TableCell
              content={dayjs(season.to_date).format("DD-MM-YYYY")}
            />
            <TableCell
              content={
                <EditIcon
                  className="w-6 h-6 text-gray-600 hover:text-gray-800 cursor-pointer"
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
          <DataNotFound
            title="No seasons found"
            description="Get started by creating a new season"
          />
        }
      />
    </>
  );
};

export default SeasonTable;
