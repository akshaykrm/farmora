import PageTitle from "@components/PageTitle";
import BalanceSheetFilter from "./components/filter";
import BalanceSheetTable from "./components/table";
import useGetBalanceSheet from "./hooks/use-get-balance-sheet";

const BalanceSheetPage = () => {
  const { balanceSheetData, isLoading, fetchBalanceSheet } =
    useGetBalanceSheet();

  const handleFilter = (filter: { from_date?: string; to_date?: string }) => {
    fetchBalanceSheet(filter);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Cash Flow" />
      </div>
      <BalanceSheetFilter onFilter={handleFilter} />
      <BalanceSheetTable data={balanceSheetData} isLoading={isLoading} />
    </>
  );
};

export default BalanceSheetPage;
