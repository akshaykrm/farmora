import PageHeader from "@components/PageHeader";
import GeneralExpenseTable from "./components/table";
import AddGeneralExpense from "./components/add";
import EditGeneralExpense from "./components/edit";
import { Box, Button } from "@mui/material";
import { useState } from "react";
import FilterGeneralExpense from "./components/filter";
import useGeneralExpenseFilter from "./hooks/use-general-expense-filter";
import useGetGeneralExpense from "./hooks/use-get-general-expense";
import { formatCurrency } from "@utils/currency";
import PaginationWithLimit from "@components/pagination-with-limit";

const GeneralExpensePage = () => {
  const { filter, updateQueryParams } = useGeneralExpenseFilter();
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { generalExpenses, refetch } = useGetGeneralExpense(filter);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  return (
    <>
      <PageHeader
        title="General Expense"
        action={
          <Button variant="contained" onClick={onOpen}>
            Add General Expense
          </Button>
        }
      />

      <FilterGeneralExpense
        defaultFilter={filter}
        onFilter={(f) => {
          updateQueryParams(f);
        }}
      />

      <TotalAmount totalAmount={generalExpenses.totalAmount} />

      <GeneralExpenseTable
        onEdit={(id) => setSelectedId(id)}
        data={generalExpenses.records}
      />

      <Box className="flex justify-end mt-4">
        <PaginationWithLimit
          limit={filter.limit}
          totalPages={generalExpenses.totalPages}
          page={filter.page}
          onChange={(p) => updateQueryParams(p)}
        />
      </Box>

      <AddGeneralExpense
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

      <EditGeneralExpense
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
        refetch={() => refetch()}
      />
    </>
  );
};

function TotalAmount({ totalAmount }: { totalAmount: number }) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-lg shadow-sm p-6 mb-6">
      <h5 className="text-md font-semibold text-brand-ink">
        Total Amount: {formatCurrency(totalAmount)}
      </h5>
    </div>
  );
}

export default GeneralExpensePage;
