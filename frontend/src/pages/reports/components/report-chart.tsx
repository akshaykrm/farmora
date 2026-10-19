import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReportChart as ReportChartData } from "../types";

const COLORS = [
  "#16a34a",
  "#0ea5e9",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#ec4899",
  "#64748b",
];

const axisTick = { fontSize: 10, fill: "#94a3b8" };

const compact = (value: number) =>
  Math.abs(value) >= 100000
    ? `${(value / 100000).toFixed(1)}L`
    : Math.abs(value) >= 1000
      ? `${(value / 1000).toFixed(0)}k`
      : String(value);

const tooltipValue = (value: unknown) =>
  typeof value === "number"
    ? value.toLocaleString("en-IN")
    : String(value ?? "");

type Props = {
  chart: ReportChartData;
};

const ChartBody = ({ chart }: Props) => {
  if (chart.type === "pie") {
    const series = chart.series[0];
    const data = chart.data.filter((row) => Number(row[series.key]) > 0);
    return (
      <PieChart>
        <Pie
          data={data}
          dataKey={series.key}
          nameKey={chart.x}
          outerRadius={100}
          innerRadius={50}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={tooltipValue} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    );
  }

  const Chart = chart.type === "line" ? LineChart : BarChart;
  return (
    <Chart
      data={chart.data}
      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
    >
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
      <XAxis
        dataKey={chart.x}
        tick={axisTick}
        axisLine={false}
        tickLine={false}
        interval="preserveStartEnd"
        angle={-20}
        textAnchor="end"
        height={50}
      />
      <YAxis
        tick={axisTick}
        axisLine={false}
        tickLine={false}
        tickFormatter={compact}
      />
      <Tooltip formatter={tooltipValue} />
      {chart.series.length > 1 && <Legend wrapperStyle={{ fontSize: 12 }} />}
      {chart.series.map((series, index) =>
        chart.type === "line" ? (
          <Line
            key={series.key}
            type="monotone"
            dataKey={series.key}
            name={series.label}
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={2}
            dot={false}
          />
        ) : (
          <Bar
            key={series.key}
            dataKey={series.key}
            name={series.label}
            fill={COLORS[index % COLORS.length]}
            stackId={chart.stacked ? "stack" : undefined}
            radius={chart.stacked ? 0 : [4, 4, 0, 0]}
          />
        ),
      )}
    </Chart>
  );
};

const ReportChart = ({ chart }: Props) => {
  if (!chart.data.length) return null;
  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-brand-ink">
        {chart.title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <ChartBody chart={chart} />
      </ResponsiveContainer>
    </div>
  );
};

export default ReportChart;
