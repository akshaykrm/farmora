import { useState } from "react";
import PageHeader from "@components/PageHeader";
import ExportMenu from "@components/ExportMenu";
import BalanceSheetFilter from "./components/filter";
import BalanceSheetTable from "./components/table";
import useGetBalanceSheet from "./hooks/use-get-balance-sheet";
import useBalanceSheetFilter from "./hooks/use-balance-sheet-filter";
import type { BalanceSheetFilterRequest } from "./types";

const BalanceSheetPage = () => {
  const { balanceSheetData, isLoading, fetchBalanceSheet } =
    useGetBalanceSheet();
  const { page, updateQueryParams, limit } = useBalanceSheetFilter();
  const [appliedFilter, setAppliedFilter] =
    useState<BalanceSheetFilterRequest>({});

  const handleFilter = (filter: BalanceSheetFilterRequest) => {
    setAppliedFilter(filter);
    updateQueryParams({ page: 1 });
    fetchBalanceSheet(filter);
  };

  return (
    <>
      <PageHeader
        title="Cash Flow"
        action={
          <ExportMenu
            permission="cash_flow:export"
            endpoint="balance-sheet/export"
            filter={appliedFilter}
            filename="cash-flow"
          />
        }
      />
      <BalanceSheetFilter onFilter={handleFilter} />
      <BalanceSheetTable
        data={balanceSheetData}
        isLoading={isLoading}
        page={page}
        limit={limit}
        onPageChange={(f) => updateQueryParams(f)}
      />
    </>
  );
};

export default BalanceSheetPage;
