import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { Box, Button, MenuItem, TextField } from "@mui/material";
import PageHeader from "@components/PageHeader";
import AddButton from "@components/AddButton";
import PaginationWithLimit from "@components/pagination-with-limit";
import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import EmptyContentMessage from "@components/EmptyContentMessage";
import Ternary from "@components/ternary";
import { Dialog, DialogContent } from "@components/dialog";
import useQueryParameters from "@hooks/use-query-parameters";
import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_LIMIT } from "@config";
import referralsApi, {
  type ReferralPartner,
  type ReferralPartnerForm,
} from "@api/referrals.api";
import { useForm } from "react-hook-form";
import { formatCurrency } from "@utils/currency";

const emptyForm: ReferralPartnerForm = {
  name: "",
  phone: "",
  email: "",
  code: "",
  status: "active",
  referral_bonus_type: "fixed",
  referral_bonus_value: null,
};

const formatBonus = (row: ReferralPartner) => {
  if (row.referral_bonus_type === "fixed") {
    return formatCurrency(Number(row.referral_bonus_value || 0));
  }
  if (row.referral_bonus_type === "percentage") {
    return `${row.referral_bonus_value}%`;
  }
  return "—";
};

const ReferralsPage = () => {
  const { queryParms, updateQueryParams } = useQueryParameters();
  const page = queryParms.page ? parseInt(queryParms.page) : DEFAULT_FIRST_PAGE;
  const limit = queryParms.limit
    ? parseInt(queryParms.limit)
    : DEFAULT_PAGE_LIMIT;
  const [rows, setRows] = useState<ReferralPartner[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const methods = useForm<ReferralPartnerForm>({ defaultValues: emptyForm });
  const { register, handleSubmit, reset, watch, formState } = methods;
  const bonusType = watch("referral_bonus_type");

  const refetch = useCallback(async () => {
    const res = await referralsApi.fetchAll({ page, limit });
    if (res.status === "success" && res.data) {
      setRows(res.data.data);
      setTotalPages(res.data.totalPages || 1);
    }
  }, [page, limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const onSubmit = async (payload: ReferralPartnerForm) => {
    const res = await referralsApi.create({
      ...payload,
      code: payload.code.trim().toUpperCase(),
      referral_bonus_value:
        payload.referral_bonus_type === "none"
          ? null
          : Number(payload.referral_bonus_value),
    });
    if (res.status === "success") {
      setIsOpen(false);
      reset(emptyForm);
      if (page !== DEFAULT_FIRST_PAGE) {
        updateQueryParams({ page: DEFAULT_FIRST_PAGE });
      } else {
        refetch();
      }
    }
  };

  return (
    <>
      <PageHeader
        title="Referrals"
        action={
          <AddButton
            label="Partner"
            onClick={() => {
              reset(emptyForm);
              setIsOpen(true);
            }}
          />
        }
      />
      <Table>
        <TableRow>
          {[
            "ID",
            "Name",
            "Code",
            "Bonus",
            "Companies",
            "Earned",
            "Paid",
            "Balance",
            "Status",
            "View",
          ].map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {rows.map((row, i) => (
          <TableRow key={row.id}>
            <TableCell content={i + 1} />
            <TableCell content={row.name} />
            <TableCell content={row.code} />
            <TableCell content={formatBonus(row)} />
            <TableCell content={row.companies_count ?? 0} />
            <TableCell content={formatCurrency(Number(row.total_earned || 0))} />
            <TableCell content={formatCurrency(Number(row.total_paid || 0))} />
            <TableCell content={formatCurrency(Number(row.balance || 0))} />
            <TableCell content={row.status} />
            <TableCell
              content={
                <Link
                  to={`/referrals/${row.id}`}
                  className="text-sm font-medium text-brand-primary-strong hover:underline"
                >
                  Open
                </Link>
              }
            />
          </TableRow>
        ))}
      </Table>
      <Ternary
        when={rows.length === 0}
        then={
          <EmptyContentMessage
            title="No referral partners"
            description="Create a partner and share their referral code"
          />
        }
      />
      <Box className="mt-6 flex justify-end">
        <PaginationWithLimit
          limit={limit}
          totalPages={totalPages}
          page={page}
          onChange={(p) => updateQueryParams(p)}
        />
      </Box>
      <Dialog
        isOpen={isOpen}
        headerTitle="Add Referral Partner"
        onClose={() => setIsOpen(false)}
      >
        <DialogContent>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4"
          >
            <TextField
              label="Name"
              size="small"
              {...register("name", { required: "Name is required" })}
              error={Boolean(formState.errors.name)}
              helperText={formState.errors.name?.message}
            />
            <TextField label="Phone" size="small" {...register("phone")} />
            <TextField label="Email" size="small" {...register("email")} />
            <TextField
              label="Referral Code"
              size="small"
              {...register("code", { required: "Code is required" })}
              error={Boolean(formState.errors.code)}
              helperText={formState.errors.code?.message}
            />
            <TextField
              select
              label="Referral Bonus Type"
              size="small"
              {...register("referral_bonus_type", { required: true })}
            >
              <MenuItem value="fixed">Fixed amount</MenuItem>
              <MenuItem value="percentage">Percentage</MenuItem>
              <MenuItem value="none">None</MenuItem>
            </TextField>
            {bonusType !== "none" && (
              <TextField
                label={
                  bonusType === "percentage"
                    ? "Referral Bonus (%)"
                    : "Referral Bonus (₹)"
                }
                size="small"
                type="number"
                {...register("referral_bonus_value", {
                  valueAsNumber: true,
                  required: "Bonus value is required",
                  validate: (value) =>
                    Number(value) > 0 || "Enter a positive bonus value",
                })}
                error={Boolean(formState.errors.referral_bonus_value)}
                helperText={formState.errors.referral_bonus_value?.message}
              />
            )}
            <TextField
              select
              label="Status"
              size="small"
              {...register("status")}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </TextField>
            <div className="flex justify-end gap-2">
              <Button
                variant="outlined"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="contained" type="submit">
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReferralsPage;
