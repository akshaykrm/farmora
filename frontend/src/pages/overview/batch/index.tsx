import PageTitle from "@components/PageTitle";
import ExportMenu from "@components/ExportMenu";
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
import PaginationWithLimit from "@components/pagination-with-limit";
import LoadingMessage from "@components/LoadingMessage";
import ApplyFilterMessage from "@components/ApplyFilterMessage";
import EmptyContentMessage from "@components/EmptyContentMessage";
import usePermissions from "@hooks/use-permissions";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import DailyLogSection from "./daily-log";

const DAILY_LOG_TAB = "daily-log";

const BatchOverviewPage = () => {
  const { updateQueryParams, filter } = useBatchOverviewFilter();
  const { batchOverview, refetch, isLoading } = useGetBatchOverview(filter);
  const { can } = usePermissions();
  const canViewDailyLog = can("batch_daily_log:read");
  const showDailyLog =
    canViewDailyLog && Boolean(filter.batch_id) && filter.tab === DAILY_LOG_TAB;

  const { expenses, sales, returns, batch, overviewCalculations } =
    batchOverview;

  const isEmpty =
    expenses.data.length === 0 &&
    sales.data.length === 0 &&
    returns.data.length === 0;

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
        {!showDailyLog && (
          <ExportMenu
            permission="batch_overview:export"
            endpoint="overview/batch/export"
            filter={filter}
            filename="batch-overview"
            disabled={!filter.batch_id}
            disabledReason="Select a batch to export"
          />
        )}
      </div>
      <FilterBatchOverview
        defaultValues={filter}
        onFilter={(f) => updateQueryParams(f)}
      />
      {canViewDailyLog && filter.batch_id && (
        <Tabs
          value={showDailyLog ? DAILY_LOG_TAB : "overview"}
          onChange={(_, value) =>
            updateQueryParams({ tab: value === DAILY_LOG_TAB ? value : null })
          }
          className="mb-6 border-b border-brand-border"
        >
          <Tab value="overview" label="Overview" />
          <Tab value={DAILY_LOG_TAB} label="Daily Log" />
        </Tabs>
      )}
      {showDailyLog && filter.batch_id ? (
        <DailyLogSection batchId={filter.batch_id} />
      ) : (
      <Ternary
        when={isLoading}
        then={<LoadingMessage />}
        otherwise={
          <Ternary
            when={!filter.batch_id}
            then={
              <ApplyFilterMessage description="Select a season and batch, then click Apply Filters to view the overview" />
            }
            otherwise={
              <Ternary
                when={isEmpty}
                then={<EmptyContentMessage title="No data found" description="No records available for the selected batch" />}
                otherwise={
                  <>
                    <BatchInformation batch={batch} refetch={() => refetch()} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="mb-6">
                        <ExpenseTable
                          data={expenses.data}
                          summary={overviewCalculations}
                        />

                        <PaginationWithLimit
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
                          page={filter.e_page}
                          limit={filter.e_limit}
                          totalPages={expenses.totalPages}
                        />

                        <div className="mt-6">
                          <ReturnItem
                            data={returns.data}
                            summary={overviewCalculations}
                          />
                          <PaginationWithLimit
                            onChange={(f) => {
                              const opts: Record<string, number> = {};
                              if (f.page) {
                                opts.r_page = f.page;
                              }
                              if (f.limit) {
                                opts.r_limit = f.limit;
                              }
                              updateQueryParams(opts);
                            }}
                            page={filter.r_page}
                            limit={filter.r_limit}
                            totalPages={returns.totalPages}
                          />
                        </div>
                      </div>

                      <div className="mb-6">
                        <SalesTable data={sales.data} summary={overviewCalculations} />
                        <PaginationWithLimit
                          onChange={(f) => {
                            const opts: Record<string, number> = {};
                            if (f.page) {
                              opts.s_page = f.page;
                            }
                            if (f.limit) {
                              opts.s_limit = f.limit;
                            }
                            updateQueryParams(opts);
                          }}
                          page={filter.s_page}
                          limit={filter.s_limit}
                          totalPages={sales.totalPages}
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
            }
          />
        }
      />
      )}
    </>
  );
};

export default BatchOverviewPage;
