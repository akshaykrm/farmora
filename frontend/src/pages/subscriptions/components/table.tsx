import subscription from "@api/subscription.api";
import type { Subscription } from "@app-types/subscription.types";
import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import useGetAll from "@hooks/use-get-all";
import { EditIcon } from "lucide-react";
import { useMemo } from "react";
import EmptyContentMessage from "@components/EmptyContentMessage";
import LoadingMessage from "@components/LoadingMessage";
import Ternary from "@components/ternary";
import dayjs from "dayjs";

const headers = [
  "ID",
  "User",
  "Package",
  "Valid From",
  "Valid To",
  "Status",
  "Action",
];

type Props = {
  onEdit: (selectedId: number) => void;
};

const SubscriptionTable = ({ onEdit }: Props) => {
  const subscriptionList = useGetAll<Subscription>({
    queryFn: () => subscription.fetchAll(),
    queryKey: ["subscription:all"],
  });

  const isEmpty = useMemo(() => {
    return subscriptionList.data?.data?.length === 0;
  }, [subscriptionList.data]);

  const isFirstLoading = useMemo(() => {
    return (
      subscriptionList.isLoading || (isEmpty && !subscriptionList.isFetched)
    );
  }, [subscriptionList.isLoading, isEmpty, subscriptionList.isFetched]);

  return (
    <Ternary
      when={isFirstLoading}
      then={<LoadingMessage />}
      otherwise={
        <>
          <Table>
            <TableRow>
              {headers.map((header) => (
                <TableHeaderCell key={header} content={header} />
              ))}
            </TableRow>
            {subscriptionList.data?.data?.map((sub, i) => (
              <TableRow key={sub.id}>
                <TableCell content={i + 1} />
                <TableCell content={sub.user?.name || "-"} />
                <TableCell content={sub.package?.name || "-"} />
                <TableCell
                  content={dayjs(sub.valid_from).format("DD-MM-YYYY")}
                />
                <TableCell content={dayjs(sub.valid_to).format("DD-MM-YYYY")} />
                <TableCell content={sub.status || "-"} />
                <TableCell
                  content={
                    <EditIcon
                      className="w-6 h-6 text-brand-ink-muted hover:text-brand-ink-soft cursor-pointer"
                      onClick={() => {
                        onEdit(sub.id);
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
                title="No subscriptions found"
                description="Get started by creating a new subscription"
              />
            }
          />
        </>
      }
    />
  );
};

export default SubscriptionTable;
