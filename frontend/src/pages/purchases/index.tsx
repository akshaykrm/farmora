import PageTitle from "@components/PageTitle";
import { useState } from "react";
import AddPurchase from "./components/add";
import ItemTable from "./components/table";
import EditItem from "./components/edit";
import { Box, Button } from "@mui/material";
import useGetPurchases from "./hooks/use-get-purchases";
import FilterItems from "./components/filter";
import usePurchaseFilter from "./hooks/use-purchase-filter";
import PaginationWithLimit from "@components/pagination-with-limit";

function PurchasePage() {
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { updateQueryParams, filter } = usePurchaseFilter();

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  const { purchases, refetch } = useGetPurchases(filter);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Purchase" />
        <Button variant="contained" onClick={onOpen}>
          Add Purchase
        </Button>
      </div>
      <div>
        <div className="mb-5">
          <FilterItems
            defaultFilter={filter}
            onFilter={(filter) => updateQueryParams(filter)}
          />
        </div>
        <ItemTable
          onEdit={(id) => setSelectedId(id)}
          data={purchases.records}
        />
      </div>
      <Box className="flex justify-end mt-6">
        <PaginationWithLimit
          limit={filter.limit}
          totalPages={purchases.totalPages}
          page={filter.page}
          onChange={(p) => updateQueryParams(p)}
        />
      </Box>
      <AddPurchase
        isShow={isOpen}
        onClose={onClose}
        refetch={(filter) => {
          updateQueryParams(filter);
        }}
      />
      <EditItem
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}

        refetch={refetch}
      />
    </>
  );
}

export default PurchasePage;
