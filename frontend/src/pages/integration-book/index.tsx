import PageHeader from "@components/PageHeader";
import AddButton from "@components/AddButton";
import IntegrationBookTable from "./components/table";
import AddIntegrationBook from "./components/add";
import FilterIntegrationBook from "./components/filter";
import { useState } from "react";
import useGetIntegrationBook from "./hooks/use-get-integration-book";
import useIntegrationBookFilter from "./hooks/use-integration-book-filter";
import IntegrationBookTotals from "./components/totals";
import Ternary from "@components/ternary";
import EmptyContentMessage from "@components/EmptyContentMessage";
import LoadingMessage from "@components/LoadingMessage";
import ApplyFilterMessage from "@components/ApplyFilterMessage";
import PaginationWithLimit from "@components/pagination-with-limit";

const IntegrationBookPage = () => {
  const [isOpen, setOpenAdd] = useState(false);

  const { updateQueryParams, filter } = useIntegrationBookFilter();
  const { integrationBookList, isLoading } = useGetIntegrationBook(filter);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  const { credit, paid, summary } = integrationBookList;

  const isEmpty = credit.data.length === 0 && paid.data.length === 0;

  return (
    <>
      <PageHeader
        title="Integration Book"
        action={
          <AddButton label="Integration Book Entry" onClick={onOpen} />
        }
      />
      <FilterIntegrationBook
        defaultValues={filter}
        onFilter={(f) => updateQueryParams(f)}
      />

      <Ternary
        when={isLoading}
        then={<LoadingMessage />}
        otherwise={
          <Ternary
            when={!filter.farm_id}
            then={
              <ApplyFilterMessage description="Select a farm, then click Apply Filters to view the integration book" />
            }
            otherwise={
              <Ternary
                when={isEmpty}
                then={
                  <EmptyContentMessage
                    title="No integration book records found"
                    description="Get started by adding a new entry"
                  />
                }
                otherwise={
                  <>
                    <IntegrationBookTotals summary={summary} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      <section className="min-w-0">
                        <IntegrationBookTable data={paid.data} title="Paid" />
                        <PaginationWithLimit
                          page={filter.p_page}
                          limit={filter.p_limit}
                          totalPages={paid.totalPages}
                          onChange={(f) => {
                            const opts: Record<string, number> = {};
                            if (f.page) {
                              opts.p_page = f.page;
                            }
                            if (f.limit) {
                              opts.p_limit = f.limit;
                            }
                            updateQueryParams(opts);
                          }}
                        />
                      </section>
                      <section className="min-w-0">
                        <IntegrationBookTable data={credit.data} title="Credit" />
                        <PaginationWithLimit
                          page={filter.c_page}
                          limit={filter.c_limit}
                          totalPages={credit.totalPages}
                          onChange={(f) => {
                            const opts: Record<string, number> = {};
                            if (f.page) {
                              opts.c_page = f.page;
                            }
                            if (f.limit) {
                              opts.c_limit = f.limit;
                            }
                            updateQueryParams(opts);
                          }}
                        />
                      </section>
                    </div>
                  </>
                }
              />
            }
          />
        }
      />

      <AddIntegrationBook
        isShow={isOpen}
        onClose={onClose}
        refetch={() => {
          updateQueryParams({ page: 1 });
        }}
      />
    </>
  );
};

export default IntegrationBookPage;
