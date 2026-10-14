import CardStat from "@components/CardStat";
import type { ReportEntry } from "../types";
import { formatReportValue } from "../format";

type Props = {
  summary: ReportEntry[];
};

const ReportSummary = ({ summary }: Props) => {
  if (!summary.length) return null;
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
      {summary.map((entry) => (
        <CardStat
          key={entry.label}
          label={entry.label}
          value={formatReportValue(entry.value, entry.type || "text")}
          valueClassName="text-xl"
        />
      ))}
    </div>
  );
};

export default ReportSummary;
