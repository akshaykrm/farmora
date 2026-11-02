import { Dialog, DialogContent } from "@components/dialog";
import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import EmptyContentMessage from "@components/EmptyContentMessage";
import subscription from "@api/subscription.api";
import type { Subscription } from "@app-types/subscription.types";
import { Button } from "@mui/material";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EditIcon } from "lucide-react";
import RenewSubscription from "@pages/subscriptions/components/renew";
import EditSubscription from "@pages/subscriptions/components/edit";

type Props = {
  subscriber: { id: number; name: string } | null;
  onClose: () => void;
  onChanged: () => void;
};

const SubscriptionHistoryDialog = ({
  subscriber,
  onClose,
  onChanged,
}: Props) => {
  const [rows, setRows] = useState<Subscription[]>([]);
  const [editId, setEditId] = useState<number | null>(null);
  const [renewTarget, setRenewTarget] = useState<Subscription | null>(null);

  const load = useCallback(async () => {
    if (!subscriber) return;
    const data = await subscription.fetchAll({
      user_id: subscriber.id,
      page: 1,
      limit: 100,
    });
    setRows(data?.data || []);
  }, [subscriber]);

  useEffect(() => {
    if (subscriber) {
      load();
    } else {
      setRows([]);
    }
  }, [subscriber, load]);

  const handleChanged = () => {
    load();
    onChanged();
  };

  const referralPartner = useMemo(() => {
    const fromRows = rows.find((row) => row.user?.referral_partner)?.user
      ?.referral_partner;
    if (fromRows) return fromRows;
    const partnerId = rows.find((row) => row.user?.referral_partner_id)?.user
      ?.referral_partner_id;
    return partnerId ? { id: partnerId, name: `Partner #${partnerId}`, code: "" } : null;
  }, [rows]);

  return (
    <>
      <Dialog
        isOpen={Boolean(subscriber)}
        headerTitle={
          subscriber
            ? `Subscription history — ${subscriber.name}`
            : "Subscription history"
        }
        onClose={onClose}
        className="max-w-3xl"
      >
        <DialogContent>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-sm text-brand-ink-muted">
              Referral partner:{" "}
              <span className="text-brand-ink">
                {referralPartner
                  ? `${referralPartner.name}${
                      referralPartner.code ? ` (${referralPartner.code})` : ""
                    }`
                  : "Not assigned"}
              </span>
            </p>
            <Button
              variant="contained"
              size="small"
              disabled={!subscriber}
              onClick={() => {
                if (!subscriber) return;
                setRenewTarget({
                  id: 0,
                  user_id: subscriber.id,
                  package_id: rows[0]?.package_id || rows[0]?.package?.id || 0,
                  valid_from: "",
                  valid_to: "",
                  package: rows[0]?.package,
                  user: rows[0]?.user,
                });
              }}
            >
              Renew
            </Button>
          </div>
          {rows.length === 0 ? (
            <EmptyContentMessage
              title="No subscriptions"
              description="This subscriber has no subscription history yet"
            />
          ) : (
            <Table>
              <TableRow>
                {["Package", "Kind", "Valid From", "Valid To", "Edit"].map(
                  (header) => (
                    <TableHeaderCell key={header} content={header} />
                  ),
                )}
              </TableRow>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell content={row.package?.name || "-"} />
                  <TableCell content={row.kind || "-"} />
                  <TableCell
                    content={
                      row.valid_from
                        ? dayjs(row.valid_from).format("DD-MM-YYYY")
                        : "-"
                    }
                  />
                  <TableCell
                    content={
                      row.valid_to
                        ? dayjs(row.valid_to).format("DD-MM-YYYY")
                        : "-"
                    }
                  />
                  <TableCell
                    content={
                      <EditIcon
                        className="h-5 w-5 cursor-pointer text-brand-ink-muted hover:text-brand-ink-soft"
                        onClick={() => setEditId(row.id)}
                      />
                    }
                  />
                </TableRow>
              ))}
            </Table>
          )}
        </DialogContent>
      </Dialog>

      <EditSubscription
        selectedId={editId}
        onClose={() => {
          setEditId(null);
          handleChanged();
        }}
      />
      <RenewSubscription
        isShow={renewTarget !== null}
        userId={renewTarget?.user_id ?? null}
        packageId={
          renewTarget?.package_id ?? renewTarget?.package?.id ?? null
        }
        referralPartnerId={
          renewTarget?.user?.referral_partner_id ??
          referralPartner?.id ??
          null
        }
        onClose={() => {
          setRenewTarget(null);
          handleChanged();
        }}
      />
    </>
  );
};

export default SubscriptionHistoryDialog;
