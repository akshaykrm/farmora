import type { EmployeeFormValues, EmployeesListResponse } from "./types";
import fetcherV2 from "@utils/fetcherV2";
import type { Filter } from "@utils/filters";

const employee = {
  fetchAll: (filter?: Filter) => {
    const opts = {
      method: "GET" as const,
      filter: filter,
    };
    return fetcherV2<EmployeesListResponse>("users", null, opts);
  },
  fetchById: async (id: number) => {
    return fetcherV2<EmployeeFormValues & { role_ids: number[]; permission_ids: number[] }>(
      `users/${id}`,
    );
  },
  create: async (payload: EmployeeFormValues) =>
    await fetcherV2<EmployeeFormValues>("users", JSON.stringify(payload), {
      method: "POST",
    }),
  updateById: async (id: number, payload: EmployeeFormValues) => {
    const requestData = {
      name: payload.name,
      username: payload.username,
      role_ids: payload.role_ids,
      permission_ids: payload.permission_ids,
    };
    return await fetcherV2(`users/${id}`, JSON.stringify(requestData), {
      method: "PUT",
    });
  },
  setPassword: async (id: number, new_password: string) =>
    await fetcherV2(`users/${id}/password`, JSON.stringify({ new_password }), {
      method: "PUT",
    }),
};

export default employee;
