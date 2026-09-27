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
import { EditIcon, History, KeyRound, Users } from "lucide-react";
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
import toast from "react-hot-toast";
import SubscriptionHistoryDialog from "./components/subscription-history-dialog";

type SubscriberSubscription = {
  id: number;
  valid_from: string;
  valid_to: string;
  kind?: string;
  package?: { id: number; name: string };
};

type Subscriber = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  status: number;
  state?: string | null;
  district?: string | null;
  place?: string | null;
  pincode?: string | null;
  bird_capacity?: string | null;
  subscriptions?: SubscriberSubscription[];
  current_subscription?: SubscriberSubscription | null;
};

type EditSubscriberForm = {
  name: string;
  username: string;
  email: string;
  phone: string;
  status: number;
  state: string;
  district: string;
  place: string;
  pincode: string;
  bird_capacity: string;
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

const emptyEditForm: EditSubscriberForm = {
  name: "",
  username: "",
  email: "",
  phone: "",
  status: 1,
  state: "",
  district: "",
  place: "",
  pincode: "",
  bird_capacity: "",
};

const toEditForm = (subscriber: Subscriber): EditSubscriberForm => ({
  name: subscriber.name || "",
  username: subscriber.username || "",
  email: subscriber.email || "",
  phone: subscriber.phone || "",
  status: subscriber.status,
  state: subscriber.state || "",
  district: subscriber.district || "",
  place: subscriber.place || "",
  pincode: subscriber.pincode || "",
  bird_capacity: subscriber.bird_capacity || "",
});

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
  const [editForm, setEditForm] = useState<EditSubscriberForm>(emptyEditForm);
  const [passwordFor, setPasswordFor] = useState<Subscriber | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [usersFor, setUsersFor] = useState<Subscriber | null>(null);
  const [historyFor, setHistoryFor] = useState<Subscriber | null>(null);
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

  const onCreate = async () => {
    await auth.registerManager(form);
    setIsOpen(false);
    setForm(emptySubscriber);
    refetch();
  };

  const openEdit = (subscriber: Subscriber) => {
    setSelected(subscriber);
    setEditForm(toEditForm(subscriber));
  };

  const onSaveEdit = async () => {
    if (!selected) return;
    const res = await fetcherV2(
      `users/${selected.id}`,
      JSON.stringify({
        name: editForm.name,
        username: editForm.username,
        email: editForm.email,
        phone: editForm.phone,
        status: editForm.status,
        state: editForm.state,
        district: editForm.district,
        place: editForm.place,
        pincode: editForm.pincode,
        bird_capacity: editForm.bird_capacity,
      }),
      { method: "PUT" },
    );
    if (res.status === "success") {
      toast.success("Subscriber updated");
      setSelected(null);
      refetch();
    } else if (res.status === "validation_error") {
      toast.error(res.error?.[0]?.message || "Validation failed");
    } else {
      toast.error("Failed to update subscriber");
    }
  };

  const onSavePassword = async () => {
    if (!passwordFor) return;
    if (newPassword.length < 3) {
      toast.error("Password must be at least 3 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    const res = await fetcherV2(
      `users/${passwordFor.id}/password`,
      JSON.stringify({ new_password: newPassword }),
      { method: "PUT" },
    );
    if (res.status === "success") {
      toast.success("Password updated");
      setPasswordFor(null);
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error("Failed to update password");
    }
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
            "Current package",
            "Valid From",
            "Valid To",
            "Status",
            "History",
            "Users",
            "Password",
            "Edit",
          ].map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {rows.map((row, i) => {
          const sub = row.current_subscription || row.subscriptions?.[0];
          return (
            <TableRow key={row.id}>
              <TableCell content={i + 1} />
              <TableCell content={row.name} />
              <TableCell content={row.username} />
              <TableCell content={sub?.package?.name || "-"} />
              <TableCell
                content={
                  sub?.valid_from
                    ? dayjs(sub.valid_from).format("DD-MM-YYYY")
                    : "-"
                }
              />
              <TableCell
                content={
                  sub?.valid_to ? dayjs(sub.valid_to).format("DD-MM-YYYY") : "-"
                }
              />
              <TableCell content={row.status === 1 ? "Active" : "Disabled"} />
              <TableCell
                content={
                  <History
                    className="h-5 w-5 cursor-pointer text-brand-ink-muted hover:text-brand-ink-soft"
                    onClick={() => setHistoryFor(row)}
                  />
                }
              />
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
                  <KeyRound
                    className="h-5 w-5 cursor-pointer text-brand-ink-muted hover:text-brand-ink-soft"
                    onClick={() => {
                      setPasswordFor(row);
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                  />
                }
              />
              <TableCell
                content={
                  <EditIcon
                    className="h-6 w-6 cursor-pointer text-brand-ink-muted hover:text-brand-ink-soft"
                    onClick={() => openEdit(row)}
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
        className="max-w-lg"
      >
        <DialogContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Name"
              size="small"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />
            <TextField
              label="Username"
              size="small"
              value={editForm.username}
              onChange={(e) =>
                setEditForm({ ...editForm, username: e.target.value })
              }
            />
            <TextField
              label="Email"
              size="small"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
            />
            <TextField
              label="Phone"
              size="small"
              value={editForm.phone}
              onChange={(e) =>
                setEditForm({ ...editForm, phone: e.target.value })
              }
            />
            <TextField
              select
              label="Status"
              size="small"
              value={editForm.status}
              onChange={(e) =>
                setEditForm({ ...editForm, status: Number(e.target.value) })
              }
            >
              <MenuItem value={1}>Active</MenuItem>
              <MenuItem value={0}>Disabled</MenuItem>
            </TextField>
            <TextField
              label="Bird capacity"
              size="small"
              value={editForm.bird_capacity}
              onChange={(e) =>
                setEditForm({ ...editForm, bird_capacity: e.target.value })
              }
            />
            <TextField
              label="State"
              size="small"
              value={editForm.state}
              onChange={(e) =>
                setEditForm({ ...editForm, state: e.target.value })
              }
            />
            <TextField
              label="District"
              size="small"
              value={editForm.district}
              onChange={(e) =>
                setEditForm({ ...editForm, district: e.target.value })
              }
            />
            <TextField
              label="Place"
              size="small"
              value={editForm.place}
              onChange={(e) =>
                setEditForm({ ...editForm, place: e.target.value })
              }
            />
            <TextField
              label="Pincode"
              size="small"
              value={editForm.pincode}
              onChange={(e) =>
                setEditForm({ ...editForm, pincode: e.target.value })
              }
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outlined" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button variant="contained" onClick={onSaveEdit}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        isOpen={Boolean(passwordFor)}
        headerTitle={
          passwordFor
            ? `Change password — ${passwordFor.name}`
            : "Change password"
        }
        onClose={() => setPasswordFor(null)}
      >
        <DialogContent>
          <div className="grid grid-cols-1 gap-4">
            <TextField
              label="New password"
              size="small"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              label="Confirm password"
              size="small"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outlined" onClick={() => setPasswordFor(null)}>
                Cancel
              </Button>
              <Button variant="contained" onClick={onSavePassword}>
                Update password
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

      <SubscriptionHistoryDialog
        subscriber={historyFor}
        onClose={() => setHistoryFor(null)}
        onChanged={refetch}
      />
    </>
  );
};

export default SubscribersPage;
