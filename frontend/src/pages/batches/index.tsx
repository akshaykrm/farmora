import PageTitle from "@components/PageTitle";
import { useState } from "react";
import AddBatch from "./components/add";
import BatchTable from "./components/table";
import EditBatch from "./components/edit";
import { Box, Button, Pagination } from "@mui/material";
import useGetBatches from "./hooks/use-get-batch";
import useBatchFilter from "./hooks/use-batch-filter";

const BatchPage = () => {
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { filter, updateQueryParams } = useBatchFilter();

  const { batches, refetch } = useGetBatches(filter);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Batch" />
        <Button variant="contained" onClick={onOpen}>
          Add Batch
        </Button>
      </div>
      <div>
        <BatchTable onEdit={(id) => setSelectedId(id)} batches={batches.records} />
      </div>
      <Box className="flex justify-end mt-6">
        <Pagination
          count={batches.totalPages}
          size="small"
          defaultPage={1}
          onChange={(_, page) => {
            updateQueryParams({ page });
          }}
          page={filter.page}
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
