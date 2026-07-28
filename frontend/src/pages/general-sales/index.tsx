import PageTitle from "@components/PageTitle";
import GeneralSalesTable from "./components/table";
import AddGeneralSales from "./components/add";
import EditGeneralSales from "./components/edit";
import { Box, Button, Pagination } from "@mui/material";
import { useState } from "react";
import FilterGeneralSales from "./components/filter";
import useGeneralSalesFilter from "./hooks/use-general-sales-filter";
import useGetGeneralSales from "./hooks/use-general-sales";
import { formatCurrency } from "@utils/currency";

const GeneralSalesPage = () => {
  const { filter, updateQueryParams } = useGeneralSalesFilter();
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  const { generalSales, refetch } = useGetGeneralSales(filter);
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="General Sales" />
        <Button variant="contained" onClick={onOpen}>
          Add General Sales
        </Button>
      </div>

      <FilterGeneralSales
        defaultFilter={filter}
        onFilter={(f) => {
          updateQueryParams(f);
        }}
      />

      <TotalAmount totalAmount={generalSales.totalAmount} />

      <GeneralSalesTable
        onEdit={(id) => setSelectedId(id)}
        data={generalSales.records}
      />

      <Box className="flex justify-end mt-4">
        <Pagination
          count={generalSales.totalPages}
          size="small"
          page={filter.page}
          onChange={(_, p) => updateQueryParams({ page: p })}
        />
      </Box>

      <AddGeneralSales
        isShow={isOpen}
        onClose={onClose}
        refetch={() => {
          updateQueryParams({ page: 1 });
        }}
      />

      <EditGeneralSales
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
        refetch={() => refetch()}
      />
    </>
  );
};

export default GeneralSalesPage;

function TotalAmount({ totalAmount }: { totalAmount: number }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h5 className="text-md font-semibold text-gray-800">
        Total Amount: {formatCurrency(totalAmount)}
      </h5>
    </div>
  );
}
