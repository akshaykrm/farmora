export type DailyLogRow = {
  id: number;
  date: string;
  age: number | null;
  mortality: number;
  cum_mortality: number;
  issued_feed: number;
  consumed_feed: number;
  total_consumption: number;
  feed_stock: number;
  total_issued: number;
  chicks_placed: number;
  birds_alive: number;
  mortality_pct: number;
  avg_body_weight: number | null;
  remarks: string | null;
};

export type DailyLogHeader = {
  farm_name: string | null;
  place: string | null;
  batch_name: string;
  season_name: string | null;
  total_chicks: number;
  companies: string[];
  log_start_date: string | null;
  suggested_start_date: string | null;
};

export type DailyLogSummary = {
  total_chicks: number;
  total_mortality: number;
  mortality_pct: number;
  birds_alive: number;
  total_issued: number;
  total_consumed: number;
  feed_stock: number;
  last_age: number | null;
  current_age: number | null;
  log_count: number;
};

export type DailyLogResponse = {
  batch: {
    id: number;
    name: string;
    status: string;
    closed_on: string | null;
    log_start_date: string | null;
  };
  header: DailyLogHeader;
  logs: DailyLogRow[];
  summary: DailyLogSummary;
};

export type DailyLogPayload = {
  date: string;
  mortality: number;
  issued_feed: number;
  consumed_feed: number;
  avg_body_weight?: number | null;
  remarks?: string | null;
};

export type DailyLogPrefill = {
  date: string;
  age: number | null;
  issued_feed: number;
};
