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
import { EditIcon, Users } from "lucide-react";
import EmptyContentMessage from "@components/EmptyContentMessage";
import Ternary from "@components/ternary";
import { Dialog, DialogContent } from "@components/dialog";
import fetcherV2 from "@utils/fetcherV2";
import auth from "@api/auth.api";
import type { ManagerRegistrationPayload } from "@app-types/auth.types";
import type { ListResponse } from "@app-types/response.types";
import useGetPackageNames from "@hooks/package/use-get-package-names";
import dayjs from "dayjs";
import employee from "@pages/employees/api";
import type { Employee } from "@pages/employees/types";

type Subscriber = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  status: number;
  subscriptions?: {
    id: number;
    valid_from: string;
    valid_to: string;
    package?: { name: string };
  }[];
};

const emptySubscriber: ManagerRegistrationPayload = {
  name: "",
  username: "",
  email: "",
  phone: "",
  password: "",
  status: 1,
  package_id: 0,
};

const SubscribersPage = () => {
  const { queryParms, updateQueryParams } = useQueryParameters();
  const page = queryParms.page ? parseInt(queryParms.page) : DEFAULT_FIRST_PAGE;
  const limit = queryParms.limit
    ? parseInt(queryParms.limit)
    : DEFAULT_PAGE_LIMIT;
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Subscriber | null>(null);
  const [usersFor, setUsersFor] = useState<Subscriber | null>(null);
  const [staff, setStaff] = useState<Employee[]>([]);
  const packageNames = useGetPackageNames();

  const refetch = useCallback(async () => {
    const res = await fetcherV2<ListResponse<Subscriber>>("users", null, {
      method: "GET",
      filter: { user_type: "manager", page, limit },
    });
    if (res.status === "success" && res.data) {
      setRows(res.data.data);
      setTotalPages(res.data.totalPages || 1);
    }
  }, [page, limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const [form, setForm] = useState<ManagerRegistrationPayload>(emptySubscriber);
  const [editStatus, setEditStatus] = useState(1);

  const onCreate = async () => {
    await auth.registerManager(form);
    setIsOpen(false);
    setForm(emptySubscriber);
    refetch();
  };

  const onSaveStatus = async () => {
    if (!selected) return;
    await fetcherV2(`users/${selected.id}`, JSON.stringify({ status: editStatus }), {
      method: "PUT",
    });
    setSelected(null);
    refetch();
  };

  const openUsers = async (subscriber: Subscriber) => {
    setUsersFor(subscriber);
    const res = await employee.fetchAll({
      page: 1,
      limit: 50,
      parent_id: subscriber.id,
    });
    if (res.status === "success" && res.data) {
      setStaff(res.data.data);
    }
  };

  return (
    <>
      <PageHeader
        title="Subscribers"
        action={<AddButton label="Subscriber" onClick={() => setIsOpen(true)} />}
      />
      <Table>
        <TableRow>
          {[
            "ID",
            "Name",
            "Username",
            "Plan",
            "Valid To",
            "Status",
            "Users",
            "Edit",
          ].map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {rows.map((row, i) => {
          const sub = row.subscriptions?.[0];
          return (
            <TableRow key={row.id}>
              <TableCell content={i + 1} />
              <TableCell content={row.name} />
              <TableCell content={row.username} />
              <TableCell content={sub?.package?.name || "-"} />
              <TableCell
                content={
                  sub?.valid_to ? dayjs(sub.valid_to).format("DD-MM-YYYY") : "-"
                }
              />
              <TableCell content={row.status === 1 ? "Active" : "Disabled"} />
              <TableCell
                content={
                  <Users
                    className="h-5 w-5 cursor-pointer text-brand-ink-muted hover:text-brand-ink-soft"
                    onClick={() => openUsers(row)}
                  />
                }
              />
              <TableCell
                content={
                  <EditIcon
                    className="h-6 w-6 cursor-pointer text-brand-ink-muted hover:text-brand-ink-soft"
                    onClick={() => {
                      setSelected(row);
                      setEditStatus(row.status);
                    }}
                  />
                }
              />
            </TableRow>
          );
        })}
      </Table>
      <Ternary
        when={rows.length === 0}
        then={
          <EmptyContentMessage
            title="No subscribers found"
            description="Create a subscriber account to get started"
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
        headerTitle="Add Subscriber"
        onClose={() => setIsOpen(false)}
      >
        <DialogContent>
          <div className="grid grid-cols-1 gap-4">
            <TextField
              label="Name"
              size="small"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              label="Username"
              size="small"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <TextField
              label="Email"
              size="small"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              label="Phone"
              size="small"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <TextField
              label="Password"
              size="small"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <TextField
              select
              label="Package"
              size="small"
              value={form.package_id || ""}
              onChange={(e) =>
                setForm({ ...form, package_id: Number(e.target.value) })
              }
            >
              {(packageNames.data || []).map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
            <div className="flex justify-end gap-2">
              <Button variant="outlined" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button variant="contained" onClick={onCreate}>
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        isOpen={Boolean(selected)}
        headerTitle="Edit Subscriber"
        onClose={() => setSelected(null)}
      >
        <DialogContent>
          <div className="grid grid-cols-1 gap-4">
            <TextField
              select
              label="Status"
              size="small"
              value={editStatus}
              onChange={(e) => setEditStatus(Number(e.target.value))}
            >
              <MenuItem value={1}>Active</MenuItem>
              <MenuItem value={0}>Disabled</MenuItem>
            </TextField>
            <div className="flex justify-end gap-2">
              <Button variant="outlined" onClick={() => setSelected(null)}>
                Cancel
              </Button>
              <Button variant="contained" onClick={onSaveStatus}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        isOpen={Boolean(usersFor)}
        headerTitle={usersFor ? `Users — ${usersFor.name}` : "Users"}
        onClose={() => setUsersFor(null)}
      >
        <DialogContent>
          {staff.length === 0 ? (
            <EmptyContentMessage
              title="No users"
              description="This subscriber has not created any users yet"
            />
          ) : (
            <Table>
              <TableRow>
                {["Name", "Username", "Type"].map((header) => (
                  <TableHeaderCell key={header} content={header} />
                ))}
              </TableRow>
              {staff.map((user) => (
                <TableRow key={user.id}>
                  <TableCell content={user.name} />
                  <TableCell content={user.username} />
                  <TableCell content={user.user_type} />
                </TableRow>
              ))}
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SubscribersPage;
