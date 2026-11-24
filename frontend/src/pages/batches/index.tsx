import PageHeader from "@components/PageHeader";
import AddButton from "@components/AddButton";
import ExportMenu from "@components/ExportMenu";
import { useState } from "react";
import AddBatch from "./components/add";
import BatchTable from "./components/table";
import EditBatch from "./components/edit";
import { Alert, Button, Box } from "@mui/material";
import useGetBatches from "./hooks/use-get-batch";
import useBatchFilter from "./hooks/use-batch-filter";
import PaginationWithLimit from "@components/pagination-with-limit";

import { useQuery } from "@tanstack/react-query";
import batchesApi from "./api";
import usePermissions from "@hooks/use-permissions";

const BatchPage = () => {
  const { can, user } = usePermissions();
  const allowance = useQuery({
    queryKey: ["batch-allowance", user?.master_id],
    queryFn: batchesApi.getAllowance,
  });
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { filter, updateQueryParams } = useBatchFilter();

  const { batches, refetch } = useGetBatches(filter);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  return (
    <>
      <PageHeader
        title="Batch"
        action={
          <div className="flex gap-2">
            <ExportMenu
              permission="batch:export"
              endpoint="batches/export"
              filter={filter}
              filename="batches"
            />
            {can("batch:write") && (
              <AddButton
                label="Batch"
                onClick={onOpen}
                disabled={!allowance.data?.can_create || allowance.isFetching}
              />
            )}
          </div>
        }
      />
      {allowance.data && (
        <Alert
          className="mb-4"
          severity={allowance.data.can_create ? "info" : "warning"}
        >
          {allowance.data.package_name || "Current package"}:{" "}
          {allowance.data.used} / {allowance.data.limit ?? "unlimited"} total
          batches.
          {!allowance.data.subscription_active
            ? " An active subscription is required to add batches."
            : !allowance.data.can_create
              ? " Batch limit reached. Upgrade your package to add another batch."
              : " Closed batches also count toward the limit."}
        </Alert>
      )}
      {allowance.error && (
        <Alert
          severity="error"
          action={<Button onClick={() => allowance.refetch()}>Retry</Button>}
        >
          Unable to load batch allowance. {allowance.error.message}
        </Alert>
      )}
      <div>
        <BatchTable
          onEdit={(id) => setSelectedId(id)}
          batches={batches.records}
        />
      </div>
      <Box className="flex justify-end mt-6">
        <PaginationWithLimit
          limit={filter.limit}
          totalPages={batches.totalPages}
          page={filter.page}
          onChange={(p) => updateQueryParams(p)}
        />
      </Box>
      <AddBatch
        isShow={isOpen}
        onClose={onClose}
        refetch={() => {
          refetch({ page: 1 });
          updateQueryParams({ page: 1 });
        }}
      />
      <EditBatch
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
        refetch={() => refetch()}
      />
    </>
  );
};

export default BatchPage;
