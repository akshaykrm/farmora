import PageHeader from "@components/PageHeader";
import AddButton from "@components/AddButton";
import GeneralExpenseTable from "./components/table";
import AddGeneralExpense from "./components/add";
import EditGeneralExpense from "./components/edit";
import { Box } from "@mui/material";
import { useState } from "react";
import { Wallet } from "lucide-react";
import CardStat from "@components/CardStat";
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
          <AddButton label="General Expense" onClick={onOpen} />
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

export default GeneralExpensePage;
