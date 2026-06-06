import PageTitle from "@components/PageTitle";
import { useState } from "react";
import AddBatch from "./components/add";
import BatchTable from "./components/table";
import EditBatch from "./components/edit";
import { Button } from "@mui/material";
import useGetBatches from "./hooks/use-get-batch";

const BatchPage = () => {
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  const { batchList, handleFetchAllBatches } = useGetBatches();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Batch" />
        <Button variant="contained" onClick={onOpen}>
          Add Batch
        </Button>
      </div>
      <div>
        <BatchTable onEdit={(id) => setSelectedId(id)} data={batchList} />
      </div>
      <AddBatch
        isShow={isOpen}
        onClose={onClose}
        refetch={handleFetchAllBatches}
      />
      <EditBatch
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
        refetch={handleFetchAllBatches}
      />
    </>
  );
};

export default BatchPage;
