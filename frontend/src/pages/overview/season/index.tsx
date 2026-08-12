import PageTitle from "@components/PageTitle";
import useSeasonOverviewFilter from "./hooks/use-filter";
import useGetSeasonOverview from "./hooks/use-get-season-overview";
import FilterSeasonOverview from "./components/filter";
import Ternary from "@components/ternary";
import SeasonInformation from "./components/season-information";
import BatchOverviewTable from "./components/batch-overview";
import GeneralCostTable from "./components/general-cost";
import GeneralSalesTable from "./components/general-sales";
import InvestorProfitSummary from "./components/investor-profit-summary";
import PaginationWithLimit from "@components/pagination-with-limit";
import LoadingMessage from "@components/LoadingMessage";
import ApplyFilterMessage from "@components/ApplyFilterMessage";
import EmptyContentMessage from "@components/EmptyContentMessage";

const SeasonOverviewPage = () => {
  const { updateQueryParams, filter } = useSeasonOverviewFilter();
  const { seasonOverview, isLoading } = useGetSeasonOverview(filter);

  const { batches, general_costs, general_sales, season, totals, summary } =
    seasonOverview;

  const isEmpty = season === null;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Season Overview" />
      </div>
      <FilterSeasonOverview
        defaultValues={filter}
        onFilter={(f) => updateQueryParams(f)}
      />
      <Ternary
        when={isLoading}
        then={<LoadingMessage />}
        otherwise={
          <Ternary
            when={!filter.season_id}
            then={
              <ApplyFilterMessage description="Select a season, then click Apply Filters to view the overview" />
            }
            otherwise={
              <Ternary
                when={isEmpty}
                then={
                  <EmptyContentMessage
                    title="No data found"
                    description="No records available for the selected season"
                  />
                }
                otherwise={
                  <>
                    <SeasonInformation
                      name={season?.name || ""}
                      batchLength={batches.count}
                      closedOn={season?.closed_on || null}
                      season_id={season?.id || null}
                    />
                    <InvestorProfitSummary
                      netSeasonProfit={summary?.net_season_profit || 0}
                      totalProfit={summary?.total_batch_profit || 0}
                      totalGeneralCost={summary?.total_general_cost || 0}
                      totalGeneralSale={summary?.total_general_sales || 0}
                    />
                    <div className="mb-6">
                      <BatchOverviewTable data={batches.data} totals={totals} />
                      <PaginationWithLimit
                        onChange={(f) => {
                          const opts: Record<string, number> = {};
                          if (f.page) {
                            opts.b_page = f.page;
                          }
                          if (f.limit) {
                            opts.b_limit = f.limit;
                          }
                          updateQueryParams(opts);
                        }}
                        page={filter.b_page}
                        limit={filter.b_limit}
                        totalPages={batches.totalPages}
                      />
                    </div>
                    <div className="flex flex-col lg:flex-row gap-6 mb-6">
                      <div className="flex-1 mb-6">
                        <GeneralCostTable
                          data={general_costs.data}
                          totalAmount={summary?.total_general_cost || 0}
                          searchValue={filter.gc_purpose || ""}
                          onSearchChange={(value) =>
                            updateQueryParams({
                              gc_purpose: value,
                              gc_page: 1,
                            })
                          }
                        />
                        <PaginationWithLimit
                          onChange={(f) => {
                            const opts: Record<string, number> = {};
                            if (f.page) {
                              opts.gc_page = f.page;
                            }
                            if (f.limit) {
                              opts.gc_limit = f.limit;
                            }
                            updateQueryParams(opts);
                          }}
                          page={filter.gc_page}
                          limit={filter.gc_limit}
                          totalPages={general_costs.totalPages}
                        />
                      </div>
                      <div className="flex-1 mb-6">
                        <GeneralSalesTable
                          data={general_sales.data}
                          totalAmount={summary?.total_general_sales || 0}
                          searchValue={filter.gs_purpose || ""}
                          onSearchChange={(value) =>
                            updateQueryParams({
                              gs_purpose: value,
                              gs_page: 1,
                            })
                          }
                        />
                        <PaginationWithLimit
                          onChange={(f) => {
                            const opts: Record<string, number> = {};
                            if (f.page) {
                              opts.gs_page = f.page;
                            }
                            if (f.limit) {
                              opts.gs_limit = f.limit;
                            }
                            updateQueryParams(opts);
                          }}
                          page={filter.gs_page}
                          limit={filter.gs_limit}
                          totalPages={general_sales.totalPages}
                        />
                      </div>
                    </div>
                  </>
                }
              />
            }
          />
        }
      />
    </>
  );
};

export default SeasonOverviewPage;
