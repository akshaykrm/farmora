import Table from "@components/Table";
import TableCell from "@components/TableCell";
import TableHeaderCell from "@components/TableHeaderCell";
import TableRow from "@components/TableRow";
import dayjs from "dayjs";
import type { GeneralSaleItem } from "../types";
import { formatCurrency } from "@utils/currency";
import { useState, useEffect, useRef } from "react";
import { TextField } from "@mui/material";
import useDebounce from "@hooks/use-debounce";

const generalHeaders = ["Date", "Purpose", "Amount"];

type GeneralSalesTableProps = {
  data: GeneralSaleItem[];
  totalAmount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
};

const GeneralSalesTable = (props: GeneralSalesTableProps) => {
  const { data, totalAmount, searchValue, onSearchChange } = props;
  const [inputValue, setInputValue] = useState(searchValue);
  const debouncedValue = useDebounce(inputValue, 300);
  const onSearchChangeRef = useRef(onSearchChange);
  onSearchChangeRef.current = onSearchChange;

  useEffect(() => {
    setInputValue(searchValue);
  }, [searchValue]);

  useEffect(() => {
    if (debouncedValue !== searchValue) {
      onSearchChangeRef.current(debouncedValue);
    }
  }, [debouncedValue, searchValue]);

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">General Sales</h2>
        <TextField
          size="small"
          placeholder="Search purpose..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>
      <Table>
        <TableRow>
          {generalHeaders.map((header) => (
            <TableHeaderCell key={`sales-${header}`} content={header} />
          ))}
        </TableRow>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell content={dayjs(item.date).format("DD-MM-YYYY")} />
            <TableCell content={item.purpose} />
            <TableCell
              content={
                <span className="text-brand-success">{formatCurrency(item.amount)}</span>
              }
            />
          </TableRow>
        ))}
        {data.length > 0 && (
          <TableRow>
            <TableCell content={<strong>Total</strong>} />
            <TableCell content="" />
            <TableCell
              content={
                <strong className="text-brand-success">
                  {formatCurrency(totalAmount)}
                </strong>
              }
            />
          </TableRow>
        )}
      </Table>
      {data.length === 0 && (
        <div className="bg-brand-canvas p-6 text-center text-brand-ink-muted">
          No general sales found
        </div>
      )}
    </div>
  );
};

export default GeneralSalesTable;
