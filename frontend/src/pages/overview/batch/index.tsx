import PageTitle from "@components/PageTitle";
import useBatchOverviewFilter from "./hooks/use-filter";
import useGetBatchOverview from "./hooks/use-get-batch-overview";
import FilterBatchOverview from "./components/filter";
import Ternary from "@components/ternary";
import BatchInformation from "./components/batch-information";
import ExpenseTable from "./components/expense-table";
import FinancialSummaryTable from "./components/financial-summary-table";
import PerformanceMetrics from "./components/performance-metrics";
import ReturnItem from "./components/return-items-table";
import SalesTable from "./components/sales-table";

const BatchOverviewPage = () => {
  const { updateQueryParams, filter } = useBatchOverviewFilter();
  const { expenses, sales, returns, batch, overviewCalculations } =
    useGetBatchOverview(filter);

  const isEmpty =
    expenses.length === 0 && sales.length === 0 && returns.length === 0;

  const avgCost =
    overviewCalculations.total_expense /
    (overviewCalculations.total_sale_weight | 1);

  const avgRate =
    overviewCalculations.total_sale_amount /
    (overviewCalculations.total_sale_weight | 1);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Batch Overview" />
      </div>
      <FilterBatchOverview
        defaultValues={filter}
        onFilter={(f) => updateQueryParams(f)}
      />
      <Ternary
        when={isEmpty}
        then={<Empty />}
        otherwise={
          <>
            <BatchInformation batch={batch} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="mb-6">
                <ExpenseTable
                  expenses={expenses}
                  totalPurchaseAmount={
                    overviewCalculations.total_purchase_amount
                  }
                  totalPurchaseFeeds={overviewCalculations.total_purchase_feeds}
                />

                <div className="mt-6">
                  <ReturnItem
                    returns={returns}
                    totalReturnAmount={
                      overviewCalculations.total_returned_amount
                    }
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
                    totalReturnAmount={
                      overviewCalculations.total_returned_amount
                    }
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
          </>
        }
      />
    </>
  );
};

function Empty() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <p className="text-gray-500 text-lg">
        Please select a season and batch, then click "Apply Filters" to view
        overview
      </p>
    </div>
  );
}

export default BatchOverviewPage;
