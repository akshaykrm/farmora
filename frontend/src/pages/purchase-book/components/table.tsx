import Card from "@mui/material/Card";
import purchaseBookApi from "@api/purchase-book.api";
import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import FilterPurchaseBook from "./filter";
import { useMemo, useState } from "react";
import DataNotFound from "@components/data-not-found";
import Ternary from "@components/ternary";
import dayjs from "dayjs";

const headers = [
  "Invoice Date",
  "Quantity",
  "Price",
  "Amount",
  "Type",
  "Balance",
];


const PurchaseBookTable = (props) => {
  const {purchaseBook, handleFilter} = props

  const isEmpty = useMemo(() => {
    return purchaseBook.items?.length === 0;
  }, [purchaseBook.items]);

  const { items, credit, paid, balance } = purchaseBook;

  return (
    <>
      <div className="mb-5">
        <FilterPurchaseBook
          onFilter={handleFilter}
        />
      </div>
      <Ternary
        when={credit | paid | balance}
        then={
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mb-4">
            <Card className="p-6">
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold capitalize text-muted-foreground">
                  Paid
                </h3>
                <p className="text-3xl font-bold tracking-tight text-green-600">
                  ₹{paid}
                </p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold capitalize text-muted-foreground">
                  Credit
                </h3>
                <p className="text-3xl font-bold tracking-tight text-red-600">
                  ₹{credit}
                </p>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold capitalize text-muted-foreground">
                  Balance
                </h3>
                <p
                  className={`text-3xl font-bold tracking-tight ${balance > 0 ? "text-green-600" : "text-red-600"}`}
                >
                  ₹{balance}
                </p>
              </div>
            </Card>
          </div>
        }
      />
      <Table>
        <TableRow>
          {headers.map((header) => (
            <TableHeaderCell key={header} content={header} />
          ))}
        </TableRow>
        {items?.map((item) => {
          return (
            <TableRow key={item.id}>
              <TableCell
                content={dayjs(item.date).format("DD-MM-YYYY")}
              />
              <TableCell content={item.quantity} />
              <TableCell content={item.price || "-"} />
              <TableCell content={item.amount} />
              <TableCell className={`${item.type === "return" ? "text-red-700":"text-black"} capitalize`} content={item.type || "-"} />
              <TableCell content={item.balance || "-"} />
            </TableRow>
          );
        })}
      </Table>
      <Ternary
        when={isEmpty}
        then={
          <DataNotFound
            title="No purchase records found"
            description="No purchases found for the selected vendor and date range"
          />
        }
      />
    </>
  );
};

export default PurchaseBookTable;
