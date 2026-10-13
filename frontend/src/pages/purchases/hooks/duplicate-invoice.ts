import type { FetcherReturnType } from "@utils/fetcherV2";
import type { DuplicateInvoice } from "../types";

export const duplicateInvoiceFrom = (
  res: FetcherReturnType<unknown>,
): DuplicateInvoice | null => {
  if (res.status !== "failed" || res.error?.code !== "INVOICE_NUMBER_EXISTS") {
    return null;
  }
  return res.error.details ?? null;
};
