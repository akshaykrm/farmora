import type { ListResponse } from "@app-types/response.types";
import fetcherV2 from "@utils/fetcherV2";
import type { Filter } from "@utils/filters";
import type {
  Sale,
  NewSaleRequest,
  EditSalePayload,
  EditSaleRequest,
} from "./types";

const salesApi = {
  fetchAll: async (filter: Filter) => {
    const opts = {
      method: "GET" as const,
      filter: filter,
    };
    return await fetcherV2<ListResponse<Sale>>("sales", null, opts);
  },
  fetchById: async (id: number) => {
    const res = await fetcherV2<EditSaleRequest>(`sales/${id}`);
    const { data, status, error } = res;
    const temp: EditSaleRequest = {
      id: data?.id,
      season_id: data?.season?.id,
      batch_id: data?.batch?.id,
      date: data?.date,
      buyer_id: data?.buyer?.id,
      vehicle_no: data?.vehicle_no,
      weight: data?.weight,
      bird_no: data?.bird_no,
      payment_type: data?.payment_type,
      price: data?.price,
      narration: data?.narration,
    };
    return {
      status,
      error,
      data: temp,
    };
  },
  create: async (payload: NewSaleRequest) =>
    await fetcherV2<NewSaleRequest>("sales", JSON.stringify(payload), {
      method: "POST",
    }),
  updateById: async (id: number, updateData: EditSaleRequest) => {
    const payload: EditSalePayload = {
      season_id: updateData.season_id,
      batch_id: updateData.batch_id,
      date: updateData.date,
      buyer_id: updateData.buyer_id,
      vehicle_no: updateData.vehicle_no,
      weight: updateData.weight,
      bird_no: updateData.bird_no,
      payment_type: updateData.payment_type,
      price: updateData.price,
      narration: updateData.narration,
    };
    return await fetcherV2(`sales/${id}`, JSON.stringify(payload), {
      method: "PUT",
    });
  },
};

export default salesApi;
