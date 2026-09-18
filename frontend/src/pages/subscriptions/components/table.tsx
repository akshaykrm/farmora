import subscription from "@api/subscription.api";
import type { Subscription } from "@app-types/subscription.types";
import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { EditIcon, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import EmptyContentMessage from "@components/EmptyContentMessage";
import Ternary from "@components/ternary";
import dayjs from "dayjs";

const headers = [
  "ID",
  "User",
  "Package",
  "Valid From",
  "Valid To",
  "Action",
];

type Props = {
  onEdit: (selectedId: number) => void;
  onRenew: (sub: Subscription) => void;
};

const SubscriptionTable = ({ onEdit, onRenew }: Props) => {
  const [rows, setRows] = useState<Subscription[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await subscription.fetchAll();
      setRows(res.data || []);
    };
    load();
  }, []);

  return (
    <>
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {rows.map((sub, i) => (
          <TableRow key={sub.id}>
            <TableCell content={i + 1} />
            <TableCell content={sub.user?.name || "-"} />
            <TableCell content={sub.package?.name || "-"} />
            <TableCell content={dayjs(sub.valid_from).format("DD-MM-YYYY")} />
            <TableCell content={dayjs(sub.valid_to).format("DD-MM-YYYY")} />
            <TableCell
              content={
                <div className="flex items-center gap-3">
                  <EditIcon
                    className="h-5 w-5 cursor-pointer text-brand-ink-muted hover:text-brand-ink-soft"
                    onClick={() => onEdit(sub.id)}
                  />
                  <button
                    type="button"
                    title="Renew"
                    onClick={() => onRenew(sub)}
                    className="rounded-md p-0.5 text-brand-ink-muted hover:text-brand-ink-soft"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>
              }
            />
          </TableRow>
        ))}
      </Table>
      <Ternary
        when={rows.length === 0}
        then={
          <EmptyContentMessage
            title="No subscriptions found"
            description="Get started by creating a new subscription"
          />
        }
      />
    </>
  );
};

export default SubscriptionTable;
