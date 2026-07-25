import PageTitle from "@components/PageTitle";
import { useState } from "react";
import AddItemReturn from "./components/add";
import ItemReturnTable from "./components/table";
import EditItemReturn from "./components/edit";
import { Box, Button, Pagination } from "@mui/material";
import useItemReturnFilter from "./hooks/use-purchase-return-filter";
import useGetItemReturns from "./hooks/use-item-returs";
import FilterItemReturns from "./components/filter";

// TODO: Implement similar pagination to rest of the tables
// Pagination is now simple and easy to implement use the queryParms hooks to get the data use refetch to get data or over ride data
const ItemReturnPage = () => {
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { updateQueryParams, filter } = useItemReturnFilter();
  const { itemReturns, refetch } = useGetItemReturns(filter);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <PageTitle title="Item Returns" />
        <Button variant="contained" onClick={onOpen}>
          Add Return
        </Button>
      </div>

      <div className="mt-6">
        <FilterItemReturns
          defaultFilter={filter}
          onFilter={(filter) => {
            updateQueryParams(filter);
          }}
        />
        <ItemReturnTable
          onEdit={(id) => setSelectedId(id)}
          data={itemReturns.records}
        />
      </div>
      <Box className="flex justify-end mt-6">
        <Pagination
          count={itemReturns.totalPages}
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
      <AddItemReturn
        isShow={isOpen}
        onClose={onClose}
        refetch={(filter) => {
          updateQueryParams(filter);
        }}
      />
      <EditItemReturn
        refetch={refetch}
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
};

export default ItemReturnPage;
