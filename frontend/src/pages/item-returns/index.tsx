import PageHeader from "@components/PageHeader";
import { useState } from "react";
import AddItemReturn from "./components/add";
import ItemReturnTable from "./components/table";
import EditItemReturn from "./components/edit";
import { Box, Button } from "@mui/material";
import useItemReturnFilter from "./hooks/use-purchase-return-filter";
import useGetItemReturns from "./hooks/use-item-returs";
import FilterItemReturns from "./components/filter";
import PaginationWithLimit from "@components/pagination-with-limit";

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
      <PageHeader
        title="Item Returns"
        action={
          <Button variant="contained" onClick={onOpen}>
            Add Return
          </Button>
        }
      />

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
        <PaginationWithLimit
          limit={filter.limit}
          totalPages={itemReturns.totalPages}
          page={filter.page}
          onChange={(p) => updateQueryParams(p)}
        />
      </Box>
      <AddItemReturn
        isShow={isOpen}
        onClose={onClose}
        refetch={() => {
          updateQueryParams({ page: 1 });
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
