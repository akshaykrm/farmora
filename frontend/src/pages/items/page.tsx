import PageTitle from "@components/PageTitle";
import { useState } from "react";
import AddItem from "./components/add";
import ItemTable from "./components/table";
import EditItem from "./components/edit";
import { Button } from "@mui/material";
import useGetItems from "./hooks/use-get-items";

const ItemsPage = () => {
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  const { itemsList, handleFetchAllItems } = useGetItems();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Items" />
        <Button variant="contained" onClick={onOpen}>
          Add Item
        </Button>
      </div>
      <div>
        <ItemTable onEdit={(id) => setSelectedId(id)} data={itemsList} />
      </div>
      <AddItem
        isShow={isOpen}
        onClose={onClose}
        refetch={handleFetchAllItems}
      />
      <EditItem
        refetch={handleFetchAllItems}
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
};

export default ItemsPage;
