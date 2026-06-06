import PageTitle from "@components/PageTitle";
import { useState } from "react";
import AddFarm from "./components/add-farm";
import EditFarm from "./components/edit-farm";
import FarmTable from "./components/table";
import { Button } from "@mui/material";
import useGetFarms from "./hooks/use-get-farms";

const FarmsPage = () => {
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { farmList, handleGetFarms } = useGetFarms();

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  console.log("page");

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Farms" />
        <Button variant="contained" onClick={onOpen}>
          Add Farms
        </Button>
      </div>
      <div>
        <FarmTable onEdit={(id) => setSelectedId(id)} farmList={farmList} />
      </div>
      <AddFarm isShow={isOpen} onClose={onClose} refetch={handleGetFarms} />
      <EditFarm
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
        refetch={handleGetFarms}
      />
    </>
  );
};

export default FarmsPage;
