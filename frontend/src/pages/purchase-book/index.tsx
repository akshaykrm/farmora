import PageHeader from "@components/PageHeader";
import AddButton from "@components/AddButton";
import { Box } from "@mui/material";
import PurchaseBookTable from "./components/table";
import { useState } from "react";
import usePurchaseBookFilter from "./hooks/use-purchase-book-filter";
import useGetPurchaseBook from "./hooks/use-get-purchase-book";
import FilterPurchaseBook from "./components/filter";
import PurchaseBookSummaryCard from "./components/summary";
import PaginationWithLimit from "@components/pagination-with-limit";
import AddPayment from "./components/add-payment";
import Ternary from "@components/ternary";
import LoadingMessage from "@components/LoadingMessage";
import ApplyFilterMessage from "@components/ApplyFilterMessage";
import EmptyContentMessage from "@components/EmptyContentMessage";

// TODO: Need to fix the add code
const PurchaseBookPage = () => {
  const { filter, updateQueryParams } = usePurchaseBookFilter();
  const { purchaseBook, refetch, isLoading } = useGetPurchaseBook(filter);

  const [isOpen, setOpenAdd] = useState(false);

  const onOpen = () => setOpenAdd(true);
  const onClose = () => {
    setOpenAdd(false);
  };

  return (
    <>
      <PageHeader
        title="Purchase Book"
        action={
          <AddButton label="Payment" onClick={onOpen} />
        }
      />
      <div className="mb-5">
        <FilterPurchaseBook
          defaultValues={filter}
          onFilter={(p) => updateQueryParams(p)}
        />
      </div>
      <Ternary
        when={isLoading}
        then={<LoadingMessage />}
        otherwise={
          <Ternary
            when={!filter.vendor_id}
            then={
              <ApplyFilterMessage description="Select a vendor, then click Apply Filters to view the purchase book" />
            }
            otherwise={
              <Ternary
                when={purchaseBook.records.length === 0}
                then={
                  <EmptyContentMessage
                    title="No purchase book records found"
                    description="Get started by adding a new entry"
                  />
                }
                otherwise={
                  <>
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
                  </>
                }
              />
            }
          />
        }
      />

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
