import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import fetcher from "@utils/fetcher";
import SelectList from "@components/select-list";

type SeasonName = {
  id: number;
  name: string;
};

type SeasonProfitBatch = {
  id: number;
  name: string;
};

type SeasonProfitSeriesRow = {
  month: string;
  [batchId: number]: number;
};

type SeasonProfitData = {
  season: {
    id: number;
    name: string;
    from_date: string | null;
    to_date: string | null;
  };
  batches: SeasonProfitBatch[];
  series: SeasonProfitSeriesRow[];
};

const CHART_COLORS = [
  "#16a34a",
  "#2563eb",
  "#f59e0b",
  "#ec4899",
  "#8b5cf6",
  "#14b8a6",
  "#f43f5e",
  "#84cc16",
  "#0ea5e9",
  "#d946ef",
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    dataKey: number;
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs min-w-[180px]">
        <p className="font-bold mb-2">{label}</p>
        {payload.map((entry) => (
          <p
            key={entry.dataKey}
            className="flex items-center justify-between gap-4 mb-1"
          >
            <span className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}
            </span>
            <span>₹{Number(entry.value).toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SeasonProfitChart = () => {
  const [seasonId, setSeasonId] = useState<number | null>(null);

  const { data: seasons = [], isLoading: loadingSeasons } = useQuery<
    SeasonName[]
  >({
    queryKey: ["season-names"],
    queryFn: () => fetcher("seasons/names"),
  });

  const options = useMemo(
    () => [...seasons].sort((a, b) => b.id - a.id),
    [seasons],
  );

  const selectedSeasonId = seasonId ?? options[0]?.id ?? null;

  const { data, isLoading, error } = useQuery<SeasonProfitData>({
    queryKey: ["season-profit", selectedSeasonId],
    queryFn: () =>
      fetcher("dashboard/manager/season-profit", null, {
        filter: { season_id: selectedSeasonId },
      }),
    enabled: Boolean(selectedSeasonId),
  });

  return (
    <section className="animate-in fade-in duration-700 shrink-0">
      <div className="bg-brand-card rounded-2xl border border-brand-border p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-brand-success-soft text-brand-success rounded-lg">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4v16a2 2 0 002 2h12a2 2 0 002-2V4"
                />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-brand-ink tracking-tight">
              Season Profit
            </h2>
          </div>

          <div className="w-full md:w-64">
            <SelectList
              options={options}
              value={selectedSeasonId}
              onChange={setSeasonId}
              label="Season"
              name="season_id"
            />
          </div>
        </div>

        {loadingSeasons ? (
          <div className="flex items-center justify-center h-72">
            <p className="text-sm text-brand-ink-muted">Loading seasons…</p>
          </div>
        ) : options.length === 0 ? (
          <div className="flex items-center justify-center h-72">
            <p className="text-sm text-brand-ink-muted">
              No seasons available yet
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-72">
            <p className="text-sm text-brand-ink-muted">Loading profit data…</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-72">
            <p className="text-sm text-brand-danger">
              Failed to load season profit data
            </p>
          </div>
        ) : !data || data.series.length === 0 || data.batches.length === 0 ? (
          <div className="flex items-center justify-center h-72">
            <p className="text-sm text-brand-ink-muted">
              No profit data for this season yet
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart
              data={data.series}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                {data.batches.map((batch, idx) => {
                  const color = CHART_COLORS[idx % CHART_COLORS.length];
                  return (
                    <linearGradient
                      key={batch.id}
                      id={`seasonProfit-${batch.id}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  );
                })}
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                minTickGap={20}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) =>
                  `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: 12 }}
              />
              {data.batches.map((batch, idx) => {
                const color = CHART_COLORS[idx % CHART_COLORS.length];
                return (
                  <Area
                    key={batch.id}
                    type="monotone"
                    dataKey={String(batch.id)}
                    name={batch.name}
                    stroke={color}
                    strokeWidth={2}
                    fill={`url(#seasonProfit-${batch.id})`}
                    fillOpacity={1}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 0 }}
                  />
                );
              })}
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
};

export default SeasonProfitChart;
