import PageTitle from "@components/PageTitle";
import { useState } from "react";
import AddSale from "./components/add";
import SalesTable from "./components/table";
import EditSale from "./components/edit";
import { Box, Button, Pagination } from "@mui/material";
import useSalesFilter from "./hooks/use-sales-filter";
import useGetSales from "./hooks/use-get-sales";
import SaleFilter from "./components/filter";

// TODO: update the api and types to module from globally shared
const SalesPage = () => {
  const { filter, updateQueryParams } = useSalesFilter();
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { sales, refetch } = useGetSales(filter);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Sales" />
        <Button variant="contained" onClick={onOpen}>
          Add Sale
        </Button>
      </div>

      <SaleFilter
        defaultValues={filter}
        handleFetch={(filter) => {
          updateQueryParams(filter);
        }}
      />
      <SalesTable onEdit={(id) => setSelectedId(id)} data={sales.records} />

      <Box className="flex justify-end mt-4">
        <Pagination
          count={sales.totalPages}
          size="small"
          page={filter.page}
          onChange={(_, p) => updateQueryParams({ page: p })}
        />
      </Box>

      <AddSale
        isShow={isOpen}
        onClose={onClose}
        refetch={() => {
          if (filter.page === 1) {
            refetch({ page: 1 });
          } else {
            updateQueryParams({ page: 1 });
          }
        }}
      />

      <EditSale
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
        refetch={() => refetch()}
      />
    </>
  );
};

export default SalesPage;
