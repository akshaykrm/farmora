import itemReturn from "@api/item-return.api";
import type {
  ItemReturn,
  ItemReturnFilterRequest,
} from "@app-types/item-return.types";
import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import { EditIcon } from "lucide-react";
import FilterItemReturns from "./filter";
import { useState, useEffect, useMemo } from "react";
import DataNotFound from "@components/data-not-found";
import DataLoading from "@components/data-loading";
import Ternary from "@components/ternary";
import dayjs from "dayjs";
import type { ListResponse } from "@app-types/response.types";

const headers = [
  "Return Type",
  "Date",
  "Quantity",
  "Rate",
  "Total Amount",
  "Category",
  "From Batch",
  "To Batch/Vendor",
  "Payment Type",
  "Action",
];

type Props = {
  onEdit: (selectedId: number) => void;
};

const ItemReturnTable = ({ onEdit }: Props) => {
  const [itemReturnList, setItemreturnList] = useState<
    ListResponse<ItemReturn>
  >({
    data: [],
    limit: 0,
    page: 0,
    total: 0,
  });

  const handleFetchAll = async (filter?: ItemReturnFilterRequest) => {
    const res = await itemReturn.fetchAll(filter);
    if (res.status === "success") {
      if (res.data) {
        setItemreturnList(res.data);
      }
    }
  };

  useEffect(() => {
    handleFetchAll();
  }, []);

  const isEmpty = useMemo(
    () => itemReturnList.data?.length === 0,
    [itemReturnList.data],
  );

  return (
    <>
      <FilterItemReturns
        onFilter={async (filter) => {
          handleFetchAll(filter);
        }}
      />
      <Ternary
        when={false}
        then={<DataLoading />}
        otherwise={
          <>
            <Table>
              <TableRow>
                {headers.map((header) => (
                  <TableHeaderCell key={header} content={header} />
                ))}
              </TableRow>
              {itemReturnList.data.map((returnItem) => (
                <TableRow key={returnItem.id}>
                  <TableCell
                    content={returnItem.return_type}
                    className="capitalize"
                  />
                  <TableCell
                    content={dayjs(returnItem.date).format("DD-MM-YYYY")}
                  />

                  <TableCell content={returnItem.quantity} />
                  <TableCell content={returnItem.rate_per_bag} />
                  <TableCell content={returnItem.total_amount} />

                  <TableCell content={returnItem.category?.type || "-"} />
                  <TableCell
                    content={returnItem.from_batch_data?.name || "-"}
                  />
                  <TableCell
                    content={
                      returnItem.return_type === "batch"
                        ? returnItem.to_batch_data?.name || "-"
                        : returnItem.to_vendor_data?.name || "-"
                    }
                  />

                  <TableCell
                    content={
                      <Ternary
                        when={returnItem.return_type === "vendor"}
                        then={
                          <span className="capitalize">
                            {returnItem.payment_type}
                          </span>
                        }
                        otherwise={"-"}
                      />
                    }
                  />
                  <TableCell
                    content={
                      <EditIcon
                        className="w-6 h-6 text-gray-600 hover:text-gray-800 cursor-pointer"
                        onClick={() => {
                          onEdit(returnItem.id);
                        }}
                      />
                    }
                  />
                </TableRow>
              ))}
            </Table>
            <Ternary
              when={isEmpty}
              then={
                <DataNotFound
                  title="No returns found"
                  description="Try adjusting your filters or create a new return"
                />
              }
            />
          </>
        }
      />
    </>
  );
};

export default ItemReturnTable;
