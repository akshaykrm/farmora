import { roundNumber } from "@utils/number";

type Props = {
  totalExpense: number;
  totalSaleAmount: number;
  totalReturnAmount: number;
  totalPurchaseAmount: number;
};

const FinancialSummaryTable = (props: Props) => {
  const {
    totalExpense,
    totalSaleAmount,
    totalReturnAmount,
    totalPurchaseAmount,
  } = props;

  const profit = totalSaleAmount - totalExpense;
  return (
    <>
      <h3 className="text-lg font-semibold mb-3">Financial Summary</h3>
      <section className="border-t border-brand-border pt-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-brand-ink-soft">Purchase Total:</span>
            <span className="font-semibold text-lg">
              ₹{roundNumber(totalPurchaseAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-brand-ink-soft">Return Total:</span>
            <span className="font-semibold text-lg">
              ₹{roundNumber(totalReturnAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-brand-ink-soft">Total Expense:</span>
            <span className="font-semibold text-lg text-brand-danger">
              ₹{roundNumber(totalExpense)}
            </span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-brand-ink-soft">Total Sales:</span>
            <span className="font-semibold text-lg text-brand-info">
              ₹{roundNumber(totalSaleAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-brand-ink-soft font-semibold">
              Total Profit (T.P.):
            </span>
            <span
              className={`font-bold text-xl ${
                profit >= 0 ? "text-brand-success" : "text-brand-danger"
              }`}
            >
              ₹{roundNumber(profit)}
            </span>
          </div>
        </div>
      </section>
    </>
  );
};

export default FinancialSummaryTable;
