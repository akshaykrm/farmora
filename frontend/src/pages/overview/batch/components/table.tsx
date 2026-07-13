import FilterBatchOverview from "./filter";
import DataNotFound from "@components/data-not-found";
import Ternary from "@components/ternary";
import BatchInformation from "./batch-information";
import ExpenseTable from "./expense-table";
import ReturnItem from "./return-items-table";
import SalesTable from "./sales-table";
import FinancialSummaryTable from "./financial-summary-table";
import PerformanceMetrics from "./performance-metrics";
import useBatchOverview from "@hooks/overview/use-batch-overview";

const BatchOverviewTable = () => {
  const {
    expenses,
    sales,
    returns,
    batch,
    onFilter,
    isEmpty,
    overviewCalculations,
  } = useBatchOverview();

  const avgCost =
    overviewCalculations.total_expense /
    (overviewCalculations.total_sale_weight | 1);

  const avgRate =
    overviewCalculations.total_sale_amount /
    (overviewCalculations.total_sale_weight | 1);

  return (
    <>
      <FilterBatchOverview onFilter={onFilter} />
      {isEmpty ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">
            Please select a season and batch, then click "Apply Filters" to view
            overview
          </p>
        </div>
      ) : (
        <>
          {batch && <BatchInformation batch={batch} />}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="mb-6">
              <ExpenseTable
                expenses={expenses}
                totalPurchaseAmount={overviewCalculations.total_purchase_amount}
                totalPurchaseFeeds={overviewCalculations.total_purchase_feeds}
              />

              <div className="mt-6">
                <ReturnItem
                  returns={returns}
                  totalReturnAmount={overviewCalculations.total_returned_amount}
                  totalReturnFeeds={overviewCalculations.total_returned_feeds}
                />
              </div>
            </div>

            <div className="mb-6">
              <SalesTable
                sales={sales}
                totalSaleCount={overviewCalculations.total_sale_birds}
                totalWeight={overviewCalculations.total_sale_weight}
                totalSaleAmount={overviewCalculations.total_sale_amount}
              />

              <div className="mt-6">
                <FinancialSummaryTable
                  totalSaleAmount={overviewCalculations.total_sale_amount}
                  totalExpense={overviewCalculations.total_expense}
                  totalReturnAmount={overviewCalculations.total_returned_amount}
                  totalPurchaseAmount={
                    overviewCalculations.total_purchase_amount
                  }
                />
              </div>
              <div className="mt-6">
                <PerformanceMetrics
                  avgCost={avgCost || 0}
                  avgRate={avgRate || 0}
                  costRateDifference={avgRate - avgCost}
                  averageWeight={overviewCalculations.avg_weight}
                  cfcr={overviewCalculations.cfcr}
                  fcr={overviewCalculations.fcr}
                />
              </div>
            </div>
          </div>

          <Ternary
            when={isEmpty}
            then={
              <DataNotFound
                title="No data found"
                description="No overview data found for the selected season and batch"
              />
            }
          />
        </>
      )}
    </>
  );
};

export default BatchOverviewTable;
