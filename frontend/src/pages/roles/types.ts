import type { ListResponse } from "@app-types/response.types";

export type RoleFormValues = {
  name: string;
  description: string;
  permission_ids: number[];
};

export type RoleRow = {
  id: number;
  name: string;
  description: string;
};

export type RolesListResponse = ListResponse<RoleRow>;
