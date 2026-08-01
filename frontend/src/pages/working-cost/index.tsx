import PageHeader from "@components/PageHeader";
import WorkingCostTable from "./components/table";
import AddWorkingCost from "./components/add";
import FilterWorkingCost from "./components/filter";
import { Button, Card } from "@mui/material";
import { useState } from "react";
import useGetWorkingCost from "./hooks/use-get-working-cost";
import useWorkingCostFilter from "./hooks/use-working-cost-filter";
import WorkingCostTotals from "./components/totals";
import Ternary from "@components/ternary";
import DataNotFound from "@components/data-not-found";
import PaginationWithLimit from "@components/pagination-with-limit";

const WorkingCostPage = () => {
  const [isOpen, setOpenAdd] = useState(false);

  const { updateQueryParams, filter } = useWorkingCostFilter();
  const { workingCostList } = useGetWorkingCost(filter);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  const { expense, income, summary } = workingCostList;

  const isEmpty = expense.data.length === 0 && income.data.length === 0;
  return (
    <>
      <PageHeader
        title="Working Cost"
        action={
          <Button variant="contained" onClick={onOpen}>
            Add Working Cost Entry
          </Button>
        }
      />
      <FilterWorkingCost
        defaultValues={filter}
        onFilter={(f) => updateQueryParams(f)}
      />

      <Ternary
        when={isEmpty}
        then={
          <DataNotFound
            title="No working cost records found"
            description="Get started by adding a new entry"
          />
        }
        otherwise={
          <>
            <WorkingCostTotals summary={summary} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="overflow-hidden">
                <WorkingCostTable data={expense.data} title="Expense" />
                <PaginationWithLimit
                  page={filter.e_page}
                  limit={filter.e_limit}
                  totalPages={expense.totalPages}
                  onChange={(f) => {
                    const opts: Record<string, number> = {};
                    if (f.page) {
                      opts.e_page = f.page;
                    }
                    if (f.limit) {
                      opts.e_limit = f.limit;
                    }
                    updateQueryParams(opts);
                  }}
                />
              </Card>
              <Card className="overflow-hidden">
                <WorkingCostTable data={income.data} title="Income" />
                <PaginationWithLimit
                  page={filter.i_page}
                  limit={filter.i_limit}
                  totalPages={income.totalPages}
                  onChange={(f) => {
                    const opts: Record<string, number> = {};
                    if (f.page) {
                      opts.i_page = f.page;
                    }
                    if (f.limit) {
                      opts.i_limit = f.limit;
                    }
                    updateQueryParams(opts);
                  }}
                />
              </Card>
            </div>
          </>
        }
      />

      <AddWorkingCost
        isShow={isOpen}
        onClose={onClose}
        refetch={() => {
          updateQueryParams({ page: 1 });
        }}
      />
    </>
  );
};

export default WorkingCostPage;
