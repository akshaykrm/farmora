import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
  profit: number;
};

type SeasonProfitData = {
  season: {
    id: number;
    name: string;
    from_date: string | null;
    to_date: string | null;
  };
  batches: { id: number; name: string }[];
  batchProfit: SeasonProfitBatch[];
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: SeasonProfitBatch;
    value: number;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    const value = entry.value ?? entry.payload?.profit ?? 0;
    return (
      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-800 text-xs min-w-[180px]">
        <p className="font-bold mb-2">{entry.payload?.name}</p>
        <p className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "#16a34a" }}
            />
            Profit
          </span>
          <span>₹{Number(value).toLocaleString()}</span>
        </p>
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
        ) : !data || data.batchProfit.length === 0 ? (
          <div className="flex items-center justify-center h-72">
            <p className="text-sm text-brand-ink-muted">
              No profit data for this season yet
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart
              data={data.batchProfit}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="seasonProfit"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={45}
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
              <Area
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke="#16a34a"
                strokeWidth={2}
                fill="url(#seasonProfit)"
                fillOpacity={1}
                dot={{ r: 4, fill: "#16a34a", strokeWidth: 0 }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
};

export default SeasonProfitChart;
