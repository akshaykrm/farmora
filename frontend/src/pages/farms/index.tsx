import PageHeader from "@components/PageHeader";
import AddButton from "@components/AddButton";
import { useState } from "react";
import AddFarm from "./components/add-farm";
import EditFarm from "./components/edit-farm";
import FarmTable from "./components/table";
import { Box } from "@mui/material";
import useGetFarms from "./hooks/use-get-farms";
import useFarmFilter from "./hooks/use-farm-filter";
import PaginationWithLimit from "@components/pagination-with-limit";

const FarmsPage = () => {
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { filter, updateQueryParams } = useFarmFilter();

  const { farms, refetch } = useGetFarms(filter);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  return (
    <>
      <PageHeader
        title="Farms"
        action={<AddButton label="Farm" onClick={onOpen} />}
      />
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
