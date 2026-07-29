import PageTitle from "@components/PageTitle";
import SalesBookTable from "./components/table";
import AddSalesBookEntry from "./components/add";
import { Box, Button, Pagination } from "@mui/material";
import { useState } from "react";
import useSalesBookFilter from "./hooks/use-sales-book-filter";
import FilterSalesBook from "./components/filter";
import useGetSalesBook from "./hooks/use-get-sales-book";
import Summary from "./components/summary";
import PaginationWithLimit from "@components/pagination-with-limit";

const SalesBookPage = () => {
  const { filter, updateQueryParams } = useSalesBookFilter();
  const [isOpen, setOpenAdd] = useState(false);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => setOpenAdd(false);

  const { saleBook, refetch } = useGetSalesBook(filter);
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Sales Book" />
        <Button variant="contained" onClick={onOpen}>
          Add Sales Book Entry
        </Button>
      </div>

      <FilterSalesBook
        onFilter={(f) => updateQueryParams(f)}
        defaultValue={filter}
      />

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
