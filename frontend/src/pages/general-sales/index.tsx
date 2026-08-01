import PageHeader from "@components/PageHeader";
import AddButton from "@components/AddButton";
import GeneralSalesTable from "./components/table";
import AddGeneralSales from "./components/add";
import EditGeneralSales from "./components/edit";
import { Box } from "@mui/material";
import { useState } from "react";
import { Wallet } from "lucide-react";
import CardStat from "@components/CardStat";
import FilterGeneralSales from "./components/filter";
import useGeneralSalesFilter from "./hooks/use-general-sales-filter";
import useGetGeneralSales from "./hooks/use-general-sales";
import { formatCurrency } from "@utils/currency";
import PaginationWithLimit from "@components/pagination-with-limit";

const GeneralSalesPage = () => {
  const { filter, updateQueryParams } = useGeneralSalesFilter();
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  const { generalSales, refetch } = useGetGeneralSales(filter);
  return (
    <>
      <PageHeader
        title="General Sales"
        action={
          <AddButton label="General Sales" onClick={onOpen} />
        }
      />

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
        <PaginationWithLimit
          limit={filter.limit}
          totalPages={generalSales.totalPages}
          page={filter.page}
          onChange={(p) => updateQueryParams(p)}
        />
      </Box>

      <AddGeneralSales
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
    <div className="mb-4">
      <CardStat
        label="Total amount"
        value={formatCurrency(totalAmount)}
        icon={<Wallet className="w-5 h-5" />}
        valueClassName="text-brand-ink"
      />
    </div>
  );
}
