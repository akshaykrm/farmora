import { CircleCheck, CircleDollarSign, Wallet } from "lucide-react";
import CardStat from "@components/CardStat";
import type { PurchaseBookSummary } from "../types";
import { formatCurrency } from "@utils/currency";

type Props = {
  summary?: PurchaseBookSummary;
};
function PurchaseBookSummaryCard(props: Props) {
  if (!props.summary) {
    return null;
  }
  const { balance, credit, paid } = props.summary;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 mb-4">
      <CardStat
        label="Paid"
        value={formatCurrency(paid)}
        icon={<CircleCheck className="w-5 h-5" />}
        valueClassName="text-brand-success"
      />
      <CardStat
        label="Credit"
        value={formatCurrency(credit)}
        icon={<CircleDollarSign className="w-5 h-5" />}
        valueClassName="text-brand-danger"
      />
      <CardStat
        label="Balance"
        value={formatCurrency(balance)}
        icon={<Wallet className="w-5 h-5" />}
        valueClassName={
          balance > 0 ? "text-brand-success" : "text-brand-danger"
        }
      />
    </div>
  );
}

export default PurchaseBookSummaryCard;
