import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  Autocomplete,
  Box,
  Button,
  TextField,
} from "@mui/material";
import PageHeader from "@components/PageHeader";
import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { Dialog, DialogContent } from "@components/dialog";
import referralsApi, {
  type ReferralPartnerDetail,
} from "@api/referrals.api";
import { formatCurrency } from "@utils/currency";
import dayjs from "dayjs";
import fetcherV2 from "@utils/fetcherV2";
import type { ListResponse } from "@app-types/response.types";
import toast from "react-hot-toast";

type ManagerOption = {
  id: number;
  name: string;
  username: string;
  referral_partner_id?: number | null;
};

const txnLabel = (type: string) => {
  switch (type) {
    case "initial_bonus":
      return "Initial Subscription";
    case "renewal_bonus":
      return "Renewal";
    case "manual_link_bonus":
      return "Manual Link";
    case "payment":
      return "Payment";
    default:
      return type;
  }
};

const ReferralDetailPage = () => {
  const { partnerId } = useParams();
  const id = Number(partnerId);
  const [detail, setDetail] = useState<ReferralPartnerDetail | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [managers, setManagers] = useState<ManagerOption[]>([]);
  const [selectedManager, setSelectedManager] = useState<ManagerOption | null>(
    null,
  );

  const refetch = useCallback(async () => {
    if (!id) return;
    const res = await referralsApi.fetchById(id);
    if (res.status === "success" && res.data) {
      setDetail(res.data);
    }
  }, [id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const loadManagers = async () => {
      const res = await fetcherV2<ListResponse<ManagerOption>>("users", null, {
        method: "GET",
        filter: { user_type: "manager", limit: 100, page: 1 },
      });
      if (res.status === "success" && res.data) {
        setManagers(
          (res.data.data || []).filter((user) => !user.referral_partner_id),
        );
      }
    };
    loadManagers();
  }, [detail?.companies_count]);

  const onPay = async () => {
    const value = Number(amount);
    if (!(value > 0)) {
      toast.error("Enter a valid amount");
      return;
    }
    const res = await referralsApi.recordPayment(id, {
      amount: value,
      remarks,
    });
    if (res.status === "success") {
      toast.success("Payment recorded");
      setPayOpen(false);
      setAmount("");
      setRemarks("");
      refetch();
    } else if (res.status === "failed") {
      toast.error(typeof res.data === "string" ? res.data : "Payment failed");
    }
  };

  const onLink = async () => {
    if (!selectedManager) {
      toast.error("Select a company");
      return;
    }
    const res = await referralsApi.linkCompany(id, selectedManager.id);
    if (res.status === "success") {
      toast.success("Company linked");
      setLinkOpen(false);
      setSelectedManager(null);
      refetch();
    } else if (res.status === "failed") {
      toast.error(typeof res.data === "string" ? res.data : "Link failed");
    }
  };

  if (!detail) {
    return <p className="text-sm text-brand-ink-muted">Loading…</p>;
  }

  return (
    <>
      <PageHeader
        title={detail.name}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outlined" onClick={() => setLinkOpen(true)}>
              Link Company
            </Button>
            <Button variant="contained" onClick={() => setPayOpen(true)}>
              Record Payment
            </Button>
          </div>
        }
      />
      <p className="mb-4 text-sm text-brand-ink-soft">
        Code: <span className="font-semibold text-brand-ink">{detail.code}</span>
        {" · "}
        Bonus:{" "}
        <span className="font-semibold text-brand-ink">
          {detail.referral_bonus_type === "fixed"
            ? formatCurrency(Number(detail.referral_bonus_value || 0))
            : detail.referral_bonus_type === "percentage"
              ? `${detail.referral_bonus_value}% of package`
              : "Uses package bonus"}
        </span>
        {" · "}
        <Link to="/referrals" className="text-brand-primary-strong hover:underline">
          Back to list
        </Link>
      </p>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Companies", String(detail.companies_count ?? 0)],
          ["Total Earned", formatCurrency(Number(detail.total_earned || 0))],
          ["Total Paid", formatCurrency(Number(detail.total_paid || 0))],
          ["Balance", formatCurrency(Number(detail.balance || 0))],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-brand-border bg-brand-card p-4"
          >
            <p className="text-xs uppercase tracking-wide text-brand-ink-muted">
              {label}
            </p>
            <p className="mt-1 text-xl font-semibold text-brand-ink">{value}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-2 text-base font-semibold text-brand-ink">
        Referred Companies
      </h2>
      <Table>
        <TableRow>
          {["Company", "Username", "Package", "Valid To"].map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {detail.companies.map((company) => (
          <TableRow key={company.id}>
            <TableCell content={company.name} />
            <TableCell content={company.username} />
            <TableCell content={company.current_package?.name || "-"} />
            <TableCell
              content={
                company.valid_to
                  ? dayjs(company.valid_to).format("DD-MM-YYYY")
                  : "-"
              }
            />
          </TableRow>
        ))}
      </Table>

      <h2 className="mb-2 mt-8 text-base font-semibold text-brand-ink">
        Bonus History
      </h2>
      <Table>
        <TableRow>
          {["Company", "Package", "Transaction", "Amount", "Date"].map(
            (header) => (
              <TableHeaderCell key={header} content={header} />
            ),
          )}
        </TableRow>
        {detail.ledger.map((txn) => (
          <TableRow key={txn.id}>
            <TableCell content={txn.company?.name || "-"} />
            <TableCell content={txn.package_name || "-"} />
            <TableCell content={txnLabel(txn.type)} />
            <TableCell content={formatCurrency(Number(txn.amount))} />
            <TableCell
              content={dayjs(txn.created_at).format("DD-MM-YYYY HH:mm")}
            />
          </TableRow>
        ))}
      </Table>

      <Dialog
        isOpen={payOpen}
        headerTitle="Record Payment"
        onClose={() => setPayOpen(false)}
      >
        <DialogContent>
          <div className="grid grid-cols-1 gap-4">
            <TextField
              label="Amount"
              size="small"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <TextField
              label="Remarks"
              size="small"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            <Box className="flex justify-end gap-2">
              <Button variant="outlined" onClick={() => setPayOpen(false)}>
                Cancel
              </Button>
              <Button variant="contained" onClick={onPay}>
                Save
              </Button>
            </Box>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        isOpen={linkOpen}
        headerTitle="Manually Link Company"
        onClose={() => setLinkOpen(false)}
      >
        <DialogContent>
          <div className="grid grid-cols-1 gap-4">
            <Autocomplete
              options={managers}
              getOptionLabel={(option) =>
                `${option.name} (@${option.username})`
              }
              value={selectedManager}
              onChange={(_, value) => setSelectedManager(value)}
              renderInput={(params) => (
                <TextField {...params} label="Company" size="small" />
              )}
            />
            <Box className="flex justify-end gap-2">
              <Button variant="outlined" onClick={() => setLinkOpen(false)}>
                Cancel
              </Button>
              <Button variant="contained" onClick={onLink}>
                Link & Credit Bonus
              </Button>
            </Box>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReferralDetailPage;
