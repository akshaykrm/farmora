import PageTitle from "@components/PageTitle";
import { useRef, useState } from "react";
import AddPurchase from "./components/add";
import ItemTable from "./components/table";
import EditItem from "./components/edit";
import { Box, Button, Pagination } from "@mui/material";
import useGetPurchases from "./hooks/use-get-purchases";
import usePaginate from "@hooks/use-paginate";
import FilterItems from "./components/filter";

function PurchasePage() {
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { updateQueryParams, filter } = usePaginate();

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  const purchaseList = useGetPurchases(filter);

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
            filterButtonRef={filterButtonRef}
            onFilter={(filter) => updateQueryParams(filter)}
          />
        </div>
        <ItemTable onEdit={(id) => setSelectedId(id)} data={purchaseList} />
      </div>
      <Box className="flex justify-end mt-6">
        <Pagination count={10} size="small" defaultPage={1} />
      </Box>
      <AddPurchase
        isShow={isOpen}
        onClose={onClose}
        filterButtonRef={filterButtonRef}
      />
      <EditItem
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
        filterButtonRef={filterButtonRef}
      />
    </>
  );
}

export default PurchasePage;
