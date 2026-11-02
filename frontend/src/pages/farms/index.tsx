import PageHeader from "@components/PageHeader";
import AddButton from "@components/AddButton";
import ExportMenu from "@components/ExportMenu";
import { useState } from "react";
import AddFarm from "./components/add-farm";
import EditFarm from "./components/edit-farm";
import FarmTable from "./components/table";
import { Alert, Box, Button } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import farmsApi from "./api";
import usePermissions from "@hooks/use-permissions";
import useGetFarms from "./hooks/use-get-farms";
import useFarmFilter from "./hooks/use-farm-filter";
import PaginationWithLimit from "@components/pagination-with-limit";

const FarmsPage = () => {
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { filter, updateQueryParams } = useFarmFilter();

  const { farms, refetch } = useGetFarms(filter);
  const { can, user } = usePermissions();
  const allowance = useQuery({
    queryKey: ["farm-allowance", user?.master_id],
    queryFn: farmsApi.getAllowance,
  });

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  return (
    <>
      <PageHeader
        title="Farms"
        action={
          <div className="flex gap-2">
            <ExportMenu
              permission="farm:export"
              endpoint="farms/export"
              filter={filter}
              filename="farms"
            />
            {can("farm:write") && (
              <AddButton
                label="Farm"
                onClick={onOpen}
                disabled={!allowance.data?.can_create || allowance.isFetching}
              />
            )}
          </div>
        }
      />
      {allowance.data && (
        <Alert
          severity={allowance.data.can_create ? "info" : "warning"}
          className="mb-4"
        >
          {allowance.data.package_name || "Current package"}:{" "}
          {allowance.data.used} / {allowance.data.limit ?? "unlimited"} farms
          used.
          {!allowance.data.subscription_active
            ? " An active subscription is required to add farms."
            : !allowance.data.can_create
              ? " Farm limit reached. Upgrade your package to add another farm. Existing farms remain available."
              : allowance.data.remaining != null
                ? ` You can add ${allowance.data.remaining} more.`
                : ""}
        </Alert>
      )}
      {allowance.error && (
        <Alert
          severity="error"
          className="mb-4"
          action={<Button onClick={() => allowance.refetch()}>Retry</Button>}
        >
          Unable to load farm allowance. {allowance.error.message}
        </Alert>
      )}
      <div>
        <FarmTable onEdit={(id) => setSelectedId(id)} farms={farms.records} />
      </div>
      <Box className="flex justify-end mt-6">
        <PaginationWithLimit
          limit={filter.limit}
          totalPages={farms.totalPages}
          page={filter.page}
          onChange={(p) => updateQueryParams(p)}
        />
      </Box>
      <AddFarm
        isShow={isOpen}
        onClose={onClose}
        refetch={() => {
          refetch({ page: 1 });
          updateQueryParams({ page: 1 });
        }}
      />
      <EditFarm
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
        refetch={() => refetch()}
      />
    </>
  );
};

export default FarmsPage;
