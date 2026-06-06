import PageTitle from "@components/PageTitle";
import { useState } from "react";
import AddVendor from "./components/add";
import VendorTable from "./components/table";
import EditVendor from "./components/edit";
import { Button } from "@mui/material";
import useGetVendors from "./hooks/use-get-vendors";

const VendorPage = () => {
  const { handleFetchAllVendors, vendorList } = useGetVendors();
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Vendor" />
        <Button variant="contained" onClick={onOpen}>
          Add Vendor
        </Button>
      </div>
      <div>
        <VendorTable onEdit={(id) => setSelectedId(id)} data={vendorList} />
      </div>
      <AddVendor
        isShow={isOpen}
        onClose={onClose}
        refetch={handleFetchAllVendors}
      />
      <EditVendor
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
        refetch={handleFetchAllVendors}
      />
    </>
  );
};

export default VendorPage;
