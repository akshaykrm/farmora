import fetcher from "@utils/fetcher";
import fetcherV2 from "@utils/fetcherV2";
import type { ListResponse } from "@app-types/response.types";

export type Permission = {
  id: number;
  key: string;
  description: string;
  group: string;
  submenu?: string | null;
  action?: string;
  actionLabel?: string;
  audience: "tenant" | "platform";
};

export type RoleKind = "system" | "custom";

export type Role = {
  id: number;
  name: string;
  description: string;
  manager_id: number | null;
  kind?: RoleKind;
  permissions?: Permission[];
  role_permissions?: { permission_id: number }[];
};

export type RoleFormValues = {
  name: string;
  description: string;
  permission_ids: number[];
  kind?: RoleKind;
};

const permissionsApi = {
  fetchAll: () => fetcher("permissions") as Promise<Permission[]>,
};

const rolesApi = {
  fetchAll: (filter?: {
    page?: number;
    limit?: number;
    name?: string;
    kind?: RoleKind;
  }) =>
    fetcherV2<ListResponse<Role>>("roles", null, {
      method: "GET",
      filter,
    }),
  fetchById: (id: number) => fetcherV2<Role>(`roles/${id}`),
  create: (payload: RoleFormValues) =>
    fetcherV2<Role>("roles", JSON.stringify(payload), { method: "POST" }),
  updateById: (id: number, payload: RoleFormValues) =>
    fetcherV2(`roles/${id}`, JSON.stringify(payload), { method: "PUT" }),
  deleteById: (id: number) =>
    fetcherV2(`roles/${id}`, null, { method: "DELETE" }),
};

export { permissionsApi, rolesApi };
