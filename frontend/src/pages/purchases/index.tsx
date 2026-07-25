import PageTitle from "@components/PageTitle";
import { useRef, useState } from "react";
import AddPurchase from "./components/add";
import ItemTable from "./components/table";
import EditItem from "./components/edit";
import { Box, Button, Pagination } from "@mui/material";
import useGetPurchases from "./hooks/use-get-purchases";
import FilterItems from "./components/filter";
import usePurchaseFilter from "./hooks/use-purchase-filter";

function PurchasePage() {
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { updateQueryParams, filter } = usePurchaseFilter();

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  const { purchases, refetch } = useGetPurchases(filter);

  const filterButtonRef = useRef(null);

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
        <Pagination
          count={purchases.totalPages}
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
