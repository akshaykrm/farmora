import fetcherV2, { type FetcherReturnType } from "@utils/fetcherV2";
import type {
  DailyLogPayload,
  DailyLogPrefill,
  DailyLogResponse,
} from "./types";

const base = (batchId: number) => `batches/${batchId}/daily-logs`;

const dailyLogApi = {
  fetch: (batchId: number) => fetcherV2<DailyLogResponse>(base(batchId)),

  prefill: (batchId: number, date: string) =>
    fetcherV2<DailyLogPrefill>(`${base(batchId)}/prefill`, null, {
      method: "GET",
      filter: { date },
    }),

  create: (batchId: number, payload: DailyLogPayload) =>
    fetcherV2(base(batchId), JSON.stringify(payload), { method: "POST" }),

  update: (batchId: number, id: number, payload: Partial<DailyLogPayload>) =>
    fetcherV2(`${base(batchId)}/${id}`, JSON.stringify(payload), {
      method: "PUT",
    }),

  remove: (batchId: number, id: number) =>
    fetcherV2(`${base(batchId)}/${id}`, null, { method: "DELETE" }),

  setStartDate: (batchId: number, logStartDate: string) =>
    fetcherV2(
      `${base(batchId)}/start-date`,
      JSON.stringify({ log_start_date: logStartDate }),
      { method: "PUT" },
    ),

};

export const responseError = (
  res: FetcherReturnType<unknown>,
  fallback = "Something went wrong",
) => {
  if (res.status === "validation_error" && Array.isArray(res.error)) {
    return res.error.map((e: { message: string }) => e.message).join(", ");
  }
  if (res.status === "failed" && typeof res.data === "string") {
    return res.data;
  }
  return fallback;
};

export default dailyLogApi;
