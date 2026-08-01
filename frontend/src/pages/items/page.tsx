import PageTitle from "@components/PageTitle";
import AddButton from "@components/AddButton";
import { useState } from "react";
import AddItem from "./components/add";
import ItemTable from "./components/table";
import EditItem from "./components/edit";
import { Box } from "@mui/material";
import useGetItems from "./hooks/use-get-items";
import useItemFilter from "./hooks/use-item-filter";
import PaginationWithLimit from "@components/pagination-with-limit";

const ItemsPage = () => {
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { filter, updateQueryParams } = useItemFilter();

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  const { items, refetch } = useGetItems(filter);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Items" />
        <AddButton label="Item" onClick={onOpen} />
      </div>
      <div>
        <ItemTable onEdit={(id) => setSelectedId(id)} data={items.records} />
      </div>
      <Box className="flex justify-end mt-6">
        <PaginationWithLimit
          limit={filter.limit}
          totalPages={items.totalPages}
          page={filter.page}
          onChange={(p) => updateQueryParams(p)}
        />
      </Box>
      <AddItem
        isShow={isOpen}
        onClose={onClose}
        refetch={() => {
          updateQueryParams({ page: 1 });
        }}
      />
      <EditItem
        refetch={refetch}
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
};

export default ItemsPage;
