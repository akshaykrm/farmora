import dayjs from "dayjs";
import { formatCurrency } from "@utils/currency";
import type { ValueType } from "./types";

const numberFormat = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 3,
});

export const formatReportValue = (
  value: string | number | null | undefined,
  type: ValueType = "text",
) => {
  if (value === null || value === undefined || value === "") return "-";
  if (type === "currency") return formatCurrency(Number(value));
  if (type === "number") {
    const parsed = Number(value);
    return Number.isFinite(parsed)
      ? numberFormat.format(parsed)
      : String(value);
  }
  if (type === "date") {
    const date = dayjs(value);
    return date.isValid() ? date.format("DD-MM-YYYY") : String(value);
  }
  return String(value);
};
