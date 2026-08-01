import type {
  NewSaleRequest,
  EditSalePayload,
  EditSaleRequest,
  Sale,
} from "@app-types/sales.types";
import type { PaginatedResponse } from "@hooks/use-get-paginated-data";
import fetcherV2, { type FetcherReturnType } from "@utils/fetcherV2";

const sales = {
  fetchAll: async (filter?: {}): Promise<
    FetcherReturnType<PaginatedResponse<Sale[]>>
  > => {
    const opts = {
      method: "GET" as const,
      filter: filter,
    };
    const res = await fetcherV2<PaginatedResponse<Sale[]>>("sales", null, opts);
    const { data, status, error } = res;
    return {
      status,
      error,
      data: {
        data: data?.data || [],
        limit: data?.limit || 0,
        page: data?.page || 0,
        total: data?.total || 0,
      },
    };
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

export default sales;
