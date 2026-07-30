import PageTitle from "@components/PageTitle";
import IntegrationBookTable from "./components/table";
import AddIntegrationBook from "./components/add";
import FilterIntegrationBook from "./components/filter";
import { Button } from "@mui/material";
import { useState } from "react";
import useGetIntegrationBook from "./hooks/use-get-integration-book";
import useIntegrationBookFilter from "./hooks/use-integration-book-filter";
import IntegrationBookTotals from "./components/totals";
import Ternary from "@components/ternary";
import DataNotFound from "@components/data-not-found";
import PaginationWithLimit from "@components/pagination-with-limit";

const IntegrationBookPage = () => {
  const [isOpen, setOpenAdd] = useState(false);

  const { updateQueryParams, filter } = useIntegrationBookFilter();
  const { integrationBookList } = useGetIntegrationBook(filter);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  const { credit, paid, summary } = integrationBookList;

  const isEmpty = credit.data.length === 0 && paid.data.length === 0;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Integration Book" />
        <Button variant="contained" onClick={onOpen}>
          Add Integration Book Entry
        </Button>
      </div>
      <FilterIntegrationBook
        defaultValues={filter}
        onFilter={(f) => updateQueryParams(f)}
      />

      <Ternary
        when={isEmpty}
        then={
          <DataNotFound
            title="No integration book records found"
            description="Get started by adding a new entry"
          />
        }
        otherwise={
          <>
            <IntegrationBookTotals summary={summary} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
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
              </div>
              <div>
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
              </div>
            </div>
          </>
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
