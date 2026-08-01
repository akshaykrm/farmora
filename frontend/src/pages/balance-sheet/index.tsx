import PageHeader from "@components/PageHeader";
import BalanceSheetFilter from "./components/filter";
import BalanceSheetTable from "./components/table";
import useGetBalanceSheet from "./hooks/use-get-balance-sheet";
import useBalanceSheetFilter from "./hooks/use-balance-sheet-filter";

const BalanceSheetPage = () => {
  const { balanceSheetData, isLoading, fetchBalanceSheet } =
    useGetBalanceSheet();
  const { page, updateQueryParams, limit } = useBalanceSheetFilter();

  const handleFilter = (filter: { from_date?: string; to_date?: string }) => {
    updateQueryParams({ page: 1 });
    fetchBalanceSheet(filter);
  };

  return (
    <>
      <PageHeader title="Cash Flow" />
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
