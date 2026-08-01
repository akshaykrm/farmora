import PageTitle from "@components/PageTitle";
import AddButton from "@components/AddButton";
import { useState } from "react";
import AddVendor from "./components/add";
import VendorTable from "./components/table";
import EditVendor from "./components/edit";
import { Box } from "@mui/material";
import useGetVendors from "./hooks/use-get-vendors";
import useVendorFilter from "./hooks/use-vendor-filter";
import PaginationWithLimit from "@components/pagination-with-limit";

const VendorPage = () => {
  const { filter, updateQueryParams } = useVendorFilter();
  const { vendorsList, refetch } = useGetVendors(filter);
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Vendor" />
        <AddButton label="Vendor" onClick={onOpen} />
      </div>
      <div>
        <VendorTable onEdit={(id) => setSelectedId(id)} vendors={vendorsList.records} />
      </div>
      <Box className="flex justify-end mt-6">
        <PaginationWithLimit
          limit={filter.limit}
          totalPages={vendorsList.totalPages}
          page={filter.page}
          onChange={(p) => updateQueryParams(p)}
        />
      </Box>
      <AddVendor
        isShow={isOpen}
        onClose={onClose}
        refetch={() => {
          updateQueryParams({ page: 1 });
        }}
      />
      <EditVendor
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
        refetch={() => refetch()}
      />
    </>
  );
};

export default VendorPage;
