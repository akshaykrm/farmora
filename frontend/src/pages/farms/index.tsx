import PageTitle from "@components/PageTitle";
import { useState } from "react";
import AddFarm from "./components/add-farm";
import EditFarm from "./components/edit-farm";
import FarmTable from "./components/table";
import { Box, Button, Pagination } from "@mui/material";
import useGetFarms from "./hooks/use-get-farms";
import useFarmFilter from "./hooks/use-farm-filter";

const FarmsPage = () => {
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { filter, updateQueryParams } = useFarmFilter();

  const { farms, refetch } = useGetFarms(filter);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Farms" />
        <Button variant="contained" onClick={onOpen}>
          Add Farms
        </Button>
      </div>
      <div>
        <FarmTable onEdit={(id) => setSelectedId(id)} farms={farms.records} />
      </div>
      <Box className="flex justify-end mt-6">
        <Pagination
          count={farms.totalPages}
          size="small"
          defaultPage={1}
          onChange={(_, page) => {
            updateQueryParams({
              page,
            });
          }}
          page={filter.page}
        />
      </Box>
      <AddFarm
        isShow={isOpen}
        onClose={onClose}
        refetch={() => {
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
