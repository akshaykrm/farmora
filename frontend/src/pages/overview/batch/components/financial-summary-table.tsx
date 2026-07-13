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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Purchase Total:</span>
            <span className="font-semibold text-lg">
              ₹{roundNumber(totalPurchaseAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Return Total:</span>
            <span className="font-semibold text-lg">
              ₹{roundNumber(totalReturnAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Total Expense:</span>
            <span className="font-semibold text-lg text-red-600">
              ₹{roundNumber(totalExpense)}
            </span>
          </div>
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-600">Total Sales:</span>
            <span className="font-semibold text-lg text-blue-600">
              ₹{roundNumber(totalSaleAmount)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 font-semibold">
              Total Profit (T.P.):
            </span>
            <span
              className={`font-bold text-xl ${
                profit >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              ₹{roundNumber(profit)}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default FinancialSummaryTable;
