import PageHeader from "@components/PageHeader";
import AddButton from "@components/AddButton";
import SalesBookTable from "./components/table";
import AddSalesBookEntry from "./components/add";
import { Box } from "@mui/material";
import { useState } from "react";
import useSalesBookFilter from "./hooks/use-sales-book-filter";
import FilterSalesBook from "./components/filter";
import useGetSalesBook from "./hooks/use-get-sales-book";
import Summary from "./components/summary";
import PaginationWithLimit from "@components/pagination-with-limit";
import Ternary from "@components/ternary";
import LoadingMessage from "@components/LoadingMessage";
import ApplyFilterMessage from "@components/ApplyFilterMessage";
import EmptyContentMessage from "@components/EmptyContentMessage";

const SalesBookPage = () => {
  const { filter, updateQueryParams } = useSalesBookFilter();
  const [isOpen, setOpenAdd] = useState(false);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  const { saleBook, refetch, isLoading } = useGetSalesBook(filter);
  return (
    <>
      <PageHeader
        title="Sales Book"
        action={
          <AddButton label="Sales Book Entry" onClick={onOpen} />
        }
      />

      <FilterSalesBook
        onFilter={(f) => updateQueryParams(f)}
        defaultValue={filter}
      />

      <Ternary
        when={isLoading}
        then={<LoadingMessage />}
        otherwise={
          <Ternary
            when={!filter.buyer_id}
            then={
              <ApplyFilterMessage description="Select a buyer, then click Apply Filters to view the sales book" />
            }
            otherwise={
              <Ternary
                when={saleBook.records.length === 0}
                then={
                  <EmptyContentMessage
                    title="No sales book records found"
                    description="Get started by adding a new entry"
                  />
                }
                otherwise={
                  <>
                    <Summary summary={saleBook.summary} />

                    <SalesBookTable
                      data={saleBook.records}
                      totals={saleBook?.summary?.totals}
                    />

                    <Box className="flex justify-end mt-4">
                      <PaginationWithLimit
                        limit={filter.limit}
                        totalPages={saleBook.totalPages}
                        page={filter.page}
                        onChange={(p) => updateQueryParams(p)}
                      />
                    </Box>
                  </>
                }
              />
            }
          />
        }
      />

      <AddSalesBookEntry
        isShow={isOpen}
        onClose={onClose}
        refetch={() => {
          if (filter.page === 1) {
            refetch({ page: 1 });
          } else {
            updateQueryParams({ page: 1 });
          }
        }}
      />
    </>
  );
};

export default SalesBookPage;
