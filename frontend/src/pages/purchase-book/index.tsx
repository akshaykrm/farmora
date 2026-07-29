import PageTitle from "@components/PageTitle";
import { Box, Button } from "@mui/material";
import PurchaseBookTable from "./components/table";
import { useState } from "react";
import usePurchaseBookFilter from "./hooks/use-purchase-book-filter";
import useGetPurchaseBook from "./hooks/use-get-purchase-book";
import FilterPurchaseBook from "./components/filter";
import PurchaseBookSummaryCard from "./components/summary";
import PaginationWithLimit from "@components/pagination-with-limit";
import AddPayment from "./components/add-payment";

// TODO: Need to fix the add code
const PurchaseBookPage = () => {
  const { filter, updateQueryParams } = usePurchaseBookFilter();
  const { purchaseBook, refetch } = useGetPurchaseBook(filter);

  const [isOpen, setOpenAdd] = useState(false);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => {
    setOpenAdd(false);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <PageTitle title="Purchase Book" />
        <Button variant="contained" onClick={onOpen}>
          Add Payment
        </Button>
      </div>
      <div className="mb-5">
        <FilterPurchaseBook
          defaultValues={filter}
          onFilter={(p) => updateQueryParams(p)}
        />
      </div>
      <PurchaseBookSummaryCard summary={purchaseBook.summary} />

      <PurchaseBookTable data={purchaseBook.records} />

      <Box className="flex justify-end mt-4">
        <PaginationWithLimit
          limit={filter.limit}
          totalPages={purchaseBook.totalPages}
          page={filter.page}
          onChange={(p) => updateQueryParams(p)}
        />
      </Box>

      <AddPayment
        isOpen={isOpen}
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

export default PurchaseBookPage;
