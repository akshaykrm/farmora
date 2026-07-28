import PageTitle from "@components/PageTitle";
import GeneralExpenseTable from "./components/table";
import AddGeneralExpense from "./components/add";
import EditGeneralExpense from "./components/edit";
import { Button } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import FilterGeneralExpense from "./components/filter";
import generalExpense from "@api/general-expense.api";
import type { GeneralExpenseRecord } from "@app-types/general-expense.types";
import useGeneralExpenseFilter from "./hooks/use-general-expense-filter";

const GeneralExpensePage = () => {
  const { filter, updateQueryParams } = useGeneralExpenseFilter();
  const [isOpen, setOpenAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [data, setData] = useState<GeneralExpenseRecord[]>([]);

  const fetchData = useCallback(async () => {
    if (!filter.season_id) {
      setData([]);
      return;
    }
    const res = await generalExpense.fetchAll({
      season_id: filter.season_id,
      start_date: filter.start_date || "",
      end_date: filter.end_date || "",
      purpose: filter.purpose || "",
    });
    if (res.status === "success" && res.data) {
      setData(res.data);
    }
  }, [filter.season_id, filter.start_date, filter.end_date, filter.purpose]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
          updateQueryParams({ ...f, page: 1 });
        }}
      />
      <GeneralExpenseTable
        onEdit={(id) => setSelectedId(id)}
        data={data}
        page={filter.page}
        limit={filter.limit}
        onPageChange={(p) => updateQueryParams({ page: p })}
      />
      <AddGeneralExpense
        isShow={isOpen}
        onClose={onClose}
        refetch={() => {
          updateQueryParams({ page: 1 });
        }}
      />
      <EditGeneralExpense
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
        refetch={() => {}}
      />
    </>
  );
};

export default GeneralExpensePage;
