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
import { EditIcon } from "lucide-react";
import EmptyContentMessage from "@components/EmptyContentMessage";
import Ternary from "@components/ternary";
import { Dialog, DialogContent } from "@components/dialog";
import packages, { type PackageFormValues } from "@api/packages.api";
import { rolesApi, type Role } from "@api/roles.api";
import type { Package } from "@app-types/package.types";
import type { ValidationError } from "@errors/api.error";
import { useForm } from "react-hook-form";

const emptyForm: PackageFormValues = {
  name: "",
  description: "",
  price: 0,
  duration: 1,
  status: "active",
  referral_bonus_type: "none",
  referral_bonus_value: null,
  role_id: null,
};

const PackagesPage = () => {
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

  const openEdit = async (id: number) => {
    setSelectedId(id);
    const res = await packages.fetchById(id);
    if (res.status === "success" && res.data) {
      reset({
        name: res.data.name,
        description: res.data.description || "",
        price: Number(res.data.price),
        duration: res.data.duration,
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
        action={<AddButton label="Package" onClick={openCreate} />}
      />
      <Table>
        <TableRow>
          {[
            "ID",
            "Name",
            "Price",
            "Duration",
            "System Role",
            "Referral Bonus",
            "Status",
            "Edit",
          ].map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {rows.map((row, i) => (
          <TableRow key={row.id}>
            <TableCell content={i + 1} />
            <TableCell content={row.name} />
            <TableCell content={String(row.price)} />
            <TableCell content={row.duration} />
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
        isOpen={isOpen}
        headerTitle={selectedId ? "Edit Package" : "Add Package"}
        onClose={() => setIsOpen(false)}
      >
        <DialogContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
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
              label="Price"
              size="small"
              type="number"
              {...register("price", { valueAsNumber: true })}
            />
            <TextField
              label="Duration (months)"
              size="small"
              type="number"
              {...register("duration", { valueAsNumber: true })}
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
