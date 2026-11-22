import PageHeader from "@components/PageHeader";
import AddButton from "@components/AddButton";
import { useCallback, useEffect, useState } from "react";
import { Box, Button, MenuItem, TextField } from "@mui/material";
import PaginationWithLimit from "@components/pagination-with-limit";
import useQueryParameters from "@hooks/use-query-parameters";
import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_LIMIT } from "@config";
import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { EditIcon, Trash2 } from "lucide-react";
import EmptyContentMessage from "@components/EmptyContentMessage";
import Ternary from "@components/ternary";
import { Dialog, DialogContent } from "@components/dialog";
import packages, { type PackageFormValues } from "@api/packages.api";
import { rolesApi, type Role } from "@api/roles.api";
import ExportMenu from "@components/ExportMenu";
import PackagePriceDisplay from "@components/PackagePriceDisplay";
import type { Package } from "@app-types/package.types";
import type { ValidationError } from "@errors/api.error";
import { useForm } from "react-hook-form";
import usePermissions from "@hooks/use-permissions";
import toast from "react-hot-toast";

const emptyForm: PackageFormValues = {
  name: "",
  description: "",
  actual_price: 0,
  discount_price: 0,
  duration: 1,
  batch_limit: null,
  user_limit: null,
  status: "active",
  referral_bonus_type: "none",
  referral_bonus_value: null,
  role_id: null,
};

const PackagesPage = () => {
  const { can } = usePermissions();
  const { queryParms, updateQueryParams } = useQueryParameters();
  const page = queryParms.page ? parseInt(queryParms.page) : DEFAULT_FIRST_PAGE;
  const limit = queryParms.limit
    ? parseInt(queryParms.limit)
    : DEFAULT_PAGE_LIMIT;
  const [rows, setRows] = useState<Package[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [apiErrors, setApiErrors] = useState<ValidationError[]>([]);
  const [systemRoles, setSystemRoles] = useState<Role[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Package | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const methods = useForm<PackageFormValues>({ defaultValues: emptyForm });
  const { register, handleSubmit, reset, watch, formState } = methods;
  const bonusType = watch("referral_bonus_type");

  const refetch = useCallback(async () => {
    const res = await packages.fetchAll({ page, limit });
    if (res.status === "success" && res.data) {
      setRows(res.data.data);
      setTotalPages(res.data.totalPages || 1);
    }
  }, [page, limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    rolesApi.fetchAll({ kind: "system", limit: 100, page: 1 }).then((res) => {
      if (res.status === "success" && res.data) {
        setSystemRoles(res.data.data);
      }
    });
  }, []);

  const openCreate = () => {
    setSelectedId(null);
    reset(emptyForm);
    setApiErrors([]);
    setIsOpen(true);
  };

  const onDelete = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      const res = await packages.deleteById(deleteTarget.id);
      if (res.status !== "success") {
        setDeleteError(
          res.error?.message || "Could not delete package. Please try again.",
        );
        return;
      }
      setDeleteTarget(null);
      toast.success("Package deleted");
      if (rows.length === 1 && page > 1) updateQueryParams(page - 1);
      else await refetch();
    } finally {
      setIsDeleting(false);
    }
  };

  const openEdit = async (id: number) => {
    setSelectedId(id);
    const res = await packages.fetchById(id);
    if (res.status === "success" && res.data) {
      reset({
        name: res.data.name,
        description: res.data.description || "",
        actual_price: Number(res.data.actual_price),
        discount_price: Number(res.data.discount_price ?? 0),
        duration: res.data.duration,
        batch_limit: res.data.batch_limit ?? null,
        user_limit: res.data.user_limit ?? null,
        status: res.data.status,
        referral_bonus_type: res.data.referral_bonus_type || "none",
        referral_bonus_value:
          res.data.referral_bonus_value == null
            ? null
            : Number(res.data.referral_bonus_value),
        role_id: res.data.role_id ?? res.data.role?.id ?? null,
      });
    }
    setApiErrors([]);
    setIsOpen(true);
  };

  const onSubmit = async (payload: PackageFormValues) => {
    const body = {
      ...payload,
      role_id: payload.role_id ? Number(payload.role_id) : null,
    };
    const res = selectedId
      ? await packages.updateById(selectedId, body)
      : await packages.create(body);
    if (res.status === "success") {
      setIsOpen(false);
      refetch();
    } else if (res.status === "validation_error") {
      setApiErrors(res.error);
    }
  };

  useEffect(() => {
    apiErrors.forEach((error) => {
      methods.setError(error.name as keyof PackageFormValues, {
        message: error.message,
      });
    });
  }, [apiErrors, methods]);

  return (
    <>
      <PageHeader
        title="Packages"
        action={
          <div className="flex gap-2">
            <ExportMenu
              permission="package:export"
              endpoint="packages/export"
              filter={{}}
              filename="packages"
            />
            <AddButton label="Package" onClick={openCreate} />
          </div>
        }
      />
      <Table>
        <TableRow>
          {[
            "ID",
            "Name",
            "Price",
            "Duration",
            "Batch limit",
            "User limit",
            "System Role",
            "Referral Bonus",
            "Status",
            "Edit",
            ...(can("package:delete") ? ["Delete"] : []),
          ].map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {rows.map((row, i) => (
          <TableRow key={row.id}>
            <TableCell content={i + 1} />
            <TableCell content={row.name} />
            <TableCell
              content={
                <PackagePriceDisplay
                  pkg={row}
                  duration={row.duration}
                  size="compact"
                />
              }
            />
            <TableCell content={row.duration} />
            <TableCell content={row.batch_limit ?? "Unlimited"} />
            <TableCell content={row.user_limit ?? "Unlimited"} />
            <TableCell content={row.role?.name || "—"} />
            <TableCell
              content={
                row.referral_bonus_type === "fixed"
                  ? `₹${row.referral_bonus_value}`
                  : row.referral_bonus_type === "percentage"
                    ? `${row.referral_bonus_value}%`
                    : "None"
              }
            />
            <TableCell content={row.status} />
            <TableCell
              content={
                <EditIcon
                  className="h-6 w-6 cursor-pointer text-brand-ink-muted hover:text-brand-ink-soft"
                  onClick={() => openEdit(row.id)}
                />
              }
            />
            {can("package:delete") && (
              <TableCell
                content={
                  <button
                    type="button"
                    aria-label={`Delete ${row.name}`}
                    className="cursor-pointer text-brand-danger"
                    onClick={() => {
                      setDeleteError("");
                      setDeleteTarget(row);
                    }}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                }
              />
            )}
          </TableRow>
        ))}
      </Table>
      <Ternary
        when={rows.length === 0}
        then={
          <EmptyContentMessage
            title="No packages found"
            description="Create a package for subscribers to choose"
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
        isOpen={deleteTarget !== null}
        headerTitle="Delete package"
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
      >
        <DialogContent>
          <p>
            Delete <strong>{deleteTarget?.name}</strong>? It will be removed
            from the package list and signup choices.
          </p>
          <p className="mt-2 text-sm text-brand-ink-muted">
            Packages linked to subscribers or checkout orders cannot be deleted.
            You can set them to inactive instead.
          </p>
          {deleteError && (
            <p role="alert" className="mt-3 text-sm text-brand-danger">
              {deleteError}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outlined"
              disabled={isDeleting}
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={isDeleting}
              onClick={onDelete}
            >
              {isDeleting ? "Deleting..." : "Delete package"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        isOpen={isOpen}
        headerTitle={selectedId ? "Edit Package" : "Add Package"}
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
              {...register("name")}
              error={Boolean(formState.errors.name)}
              helperText={formState.errors.name?.message}
            />
            <TextField
              label="Description"
              size="small"
              {...register("description")}
            />
            <TextField
              label="Actual price"
              size="small"
              type="number"
              {...register("actual_price", { valueAsNumber: true })}
            />
            <TextField
              label="Discount price"
              size="small"
              type="number"
              {...register("discount_price", { valueAsNumber: true })}
            />
            <TextField
              label="Duration (months)"
              size="small"
              type="number"
              {...register("duration", { valueAsNumber: true })}
            />
            <TextField
              label="Batch limit"
              size="small"
              type="number"
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
              {...register("batch_limit", {
                setValueAs: (value) =>
                  value === "" || value == null ? null : Number(value),
                validate: (value) =>
                  value == null ||
                  (Number.isInteger(value) && value >= 0) ||
                  "Enter a whole number of batches, 0 or more.",
              })}
              error={Boolean(formState.errors.batch_limit)}
              helperText={
                formState.errors.batch_limit?.message ||
                "Leave blank for unlimited total batches. 0 prevents batch creation. Closed batches also count toward the limit. Changes apply to current subscribers."
              }
            />
            <TextField
              label="User limit"
              size="small"
              type="number"
              slotProps={{ htmlInput: { min: 0, step: 1 } }}
              {...register("user_limit", {
                setValueAs: (value) =>
                  value === "" || value == null ? null : Number(value),
                validate: (value) =>
                  value == null ||
                  (Number.isInteger(value) && value >= 0) ||
                  "Enter a whole number of users, 0 or more.",
              })}
              error={Boolean(formState.errors.user_limit)}
              helperText={
                formState.errors.user_limit?.message ||
                "Staff users only; the subscriber is not counted. Disabled users count. Blank means unlimited; 0 prevents adding users. Applies to current subscribers."
              }
            />
            <TextField
              select
              label="System Role"
              size="small"
              defaultValue=""
              {...register("role_id", {
                setValueAs: (value) =>
                  value === "" || value == null ? null : Number(value),
              })}
              error={Boolean(formState.errors.role_id)}
              helperText={formState.errors.role_id?.message}
            >
              <MenuItem value="">None</MenuItem>
              {systemRoles.map((role) => (
                <MenuItem key={role.id} value={role.id}>
                  {role.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              size="small"
              defaultValue="active"
              {...register("status")}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="disabled">Disabled</MenuItem>
            </TextField>
            <TextField
              select
              label="Referral Bonus Type"
              size="small"
              defaultValue="none"
              {...register("referral_bonus_type")}
            >
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="fixed">Fixed amount</MenuItem>
              <MenuItem value="percentage">Percentage</MenuItem>
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
                {...register("referral_bonus_value", { valueAsNumber: true })}
              />
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outlined"
                type="button"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="contained" type="submit">
                Submit
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PackagesPage;
