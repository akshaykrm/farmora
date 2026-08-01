import { roundNumber } from "./number";
import type {
  SalesTotals,
  BatchOverviewExpense,
  BatchOverviewReturn,
  BatchOverviewSale,
  ExpenseTotals,
} from "@pages/overview/batch/types";

const isInlcudedInExpense = (item: BatchOverviewExpense) => {
  return (
    item.category_type === "BF" ||
    item.category_type === "BS" ||
    item.category_type === "PBS"
  );
};
const batchOverview = {
  calculateExpenseTotals: (expenses: BatchOverviewExpense[]) => {
    if (!expenses) return null;
    return expenses
      .filter((item) => isInlcudedInExpense(item))
      .reduce(
        (acc, item) => {
          console.log(
            item.category_type === "BF" ||
              item.category_type === "BS" ||
              item.category_type === "PBS",
          );
          return {
            quantity: acc.quantity + item.quantity,
            amount: acc.amount + item.amount,
          };
        },
        { quantity: 0, amount: 0 },
      );
  },
  calculateSalesTotals: (sales: BatchOverviewSale[]) => {
    if (!sales) return null;
    return sales.reduce(
      (acc, item) => ({
        weight: acc.weight + (item.weight || 0),
        birds: acc.birds + (item.bird_no || 0),
        amount: acc.amount + item.amount,
      }),
      { weight: 0, birds: 0, amount: 0 },
    );
  },

  calculateReturnTotals: (returns: BatchOverviewReturn[]) => {
    if (!returns) return null;
    return returns.reduce(
      (acc, item) => ({
        quantity: acc.quantity + item.quantity,
        amount: acc.amount + item.amount,
      }),
      { quantity: 0, amount: 0 },
    );
  },

  calculateFCRMetrics: (
    expenseTotals: ExpenseTotals | null,
    salesTotals: SalesTotals | null,
  ) => {
    if (!salesTotals || !expenseTotals) return null;

    const totalBirdWeight = salesTotals.weight; // Total bird weight (kg)
    const totalBirds = salesTotals.birds; // Total number of birds
    const totalFeedWeight = expenseTotals.quantity; // Total feed weight (assuming quantity is in kg)

    if (totalBirds === 0 || totalBirdWeight === 0) return null;

    // Average = Total bird weight / Total number of birds
    const averageWeight = totalBirdWeight / totalBirds;

    // FCR = Total Feed weight (kg) / Total bird Weight
    const fcr = totalFeedWeight / totalBirdWeight;

    // CFCR = 2 - (Avg weight * 0.25) + FCR
    const cfcr = 2 - averageWeight * 0.25 + fcr;

    // AVG COST = Total Expenses Amount / Total Bird Weight
    const avgCost = expenseTotals.amount / totalBirdWeight;

    // AVG RATE = Total Sales Amount / Total Bird Weight
    const avgRate = salesTotals.amount / totalBirdWeight;

    // AVG COST - RATE DIFFERENCE
    const costRateDifference = avgRate - avgCost;

    return {
      averageWeight: roundNumber(averageWeight, 3),
      fcr: roundNumber(fcr, 3),
      cfcr: roundNumber(cfcr, 3),
      avgCost: roundNumber(avgCost),
      avgRate: roundNumber(avgRate),
      costRateDifference: roundNumber(costRateDifference),
    };
  },
};

export default batchOverview;
