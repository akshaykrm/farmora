import PageTitle from "@components/PageTitle";
import GeneralExpenseTable from "./components/table";
import AddGeneralExpense from "./components/add";
import EditGeneralExpense from "./components/edit";
import { Box, Button, Pagination } from "@mui/material";
import { useState } from "react";
import FilterGeneralExpense from "./components/filter";
import useGeneralExpenseFilter from "./hooks/use-general-expense-filter";
import useGetGeneralExpense from "./hooks/use-get-general-expense";
import { formatCurrency } from "@utils/currency";

const GeneralExpensePage = () => {
  const { filter, updateQueryParams } = useGeneralExpenseFilter();
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { generalExpenses, refetch } = useGetGeneralExpense(filter);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="General Expense" />
        <Button variant="contained" onClick={onOpen}>
          Add General Expense
        </Button>
      </div>

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
        <Pagination
          count={generalExpenses.totalPages}
          size="small"
          page={filter.page}
          onChange={(_, p) => updateQueryParams({ page: p })}
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h5 className="text-md font-semibold text-gray-800">
        Total Amount: {formatCurrency(totalAmount)}
      </h5>
    </div>
  );
}

export default GeneralExpensePage;
