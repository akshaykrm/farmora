import PageHeader from "@components/PageHeader";
import AddButton from "@components/AddButton";
import { useState } from "react";
import { Box } from "@mui/material";
import PaginationWithLimit from "@components/pagination-with-limit";
import useQueryParameters from "@hooks/use-query-parameters";
import { DEFAULT_FIRST_PAGE, DEFAULT_PAGE_LIMIT } from "@config";
import RoleTable from "./components/table";
import AddRole from "./components/add-role";
import EditRole from "./components/edit-role";
import { rolesApi, type Role } from "@api/roles.api";
import { useCallback, useEffect } from "react";

const RolesPage = () => {
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { queryParms, updateQueryParams } = useQueryParameters();
  const page = queryParms.page ? parseInt(queryParms.page) : DEFAULT_FIRST_PAGE;
  const limit = queryParms.limit
    ? parseInt(queryParms.limit)
    : DEFAULT_PAGE_LIMIT;
  const [roles, setRoles] = useState<{ records: Role[]; totalPages: number }>({
    records: [],
    totalPages: 0,
  });

  const refetch = useCallback(async () => {
    const res = await rolesApi.fetchAll({ page, limit });
    if (res.status === "success" && res.data) {
      setRoles({
        records: res.data.data,
        totalPages: res.data.totalPages || 1,
      });
    }
  }, [page, limit]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return (
    <>
      <PageHeader
        title="Roles"
        action={<AddButton label="Role" onClick={() => setOpenAdd(true)} />}
      />
      <RoleTable onEdit={setSelectedId} roles={roles.records} />
      <Box className="mt-6 flex justify-end">
        <PaginationWithLimit
          limit={limit}
          totalPages={roles.totalPages}
          page={page}
          onChange={(p) => updateQueryParams(p)}
        />
      </Box>
      <AddRole
        isShow={isOpen}
        onClose={() => setOpenAdd(false)}
        refetch={() => {
          if (page !== DEFAULT_FIRST_PAGE) {
            updateQueryParams({ page: DEFAULT_FIRST_PAGE });
            return;
          }
          refetch();
        }}
      />
      <EditRole
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
        refetch={refetch}
      />
    </>
  );
};

export default RolesPage;
