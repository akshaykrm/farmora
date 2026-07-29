export type PurchaseBookTransaction = {
  id: number;
  name: string;
  balance: number;
  date: string;
  price: number;
  amount: number;
  type: "return" | "credit";
  category: {
    id: number;
    name: string;
  };
  invoice_number: string;
  invoice_date: string;
  vendor: {
    id: number;
    name: string;
  };
  total_price: number;
  discount_price: number;
  net_amount: number;
  quantity: number;
  price_per_unit: number;
  payment_type: "credit" | "paid";
};

export type PurchaseBookSummary = {
  credit: number;
  paid: number;
  balance: number;
};

export type PurchaseBookLedgerResponse = {
  totalPages: number;
  count: number;
  summary: PurchaseBookSummary;
  data: PurchaseBookTransaction[];
};
