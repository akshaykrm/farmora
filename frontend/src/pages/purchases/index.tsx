import PageTitle from "@components/PageTitle";
import { useRef, useState } from "react";
import AddPurchase from "./components/add";
import ItemTable from "./components/table";
import EditItem from "./components/edit";
import { Button } from "@mui/material";
import useGetPurchases from "./hooks/use-get-purchases";

const PurchasePage = () => {
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  const { handleFetchAllPurchases, purchaseList } = useGetPurchases();

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
        <ItemTable
          onEdit={(id) => setSelectedId(id)}
          data={purchaseList}
          handleFetchAllPurchases={handleFetchAllPurchases}
          filterButtonRef={filterButtonRef}
        />
      </div>
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
};

export default PurchasePage;
