import PageHeader from "@components/PageHeader";
import AddButton from "@components/AddButton";
import { useState } from "react";
import AddBatch from "./components/add";
import BatchTable from "./components/table";
import EditBatch from "./components/edit";
import { Box } from "@mui/material";
import useGetBatches from "./hooks/use-get-batch";
import useBatchFilter from "./hooks/use-batch-filter";
import PaginationWithLimit from "@components/pagination-with-limit";

const BatchPage = () => {
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
          <AddButton label="Batch" onClick={onOpen} />
        }
      />
      <div>
        <BatchTable onEdit={(id) => setSelectedId(id)} batches={batches.records} />
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
