import type {
  NewItemReturnRequest,
  EditItemReturnPayload,
  EditItemReturnRequest,
  ItemReturn,
} from "@app-types/item-return.types";
import type { ListResponse } from "@app-types/response.types";
import fetcherV2 from "@utils/fetcherV2";

const itemReturn = {
  fetchAll: (filter?: {}) => {
    const opts = {
      method: "GET" as const,
      filter: filter,
    };
    return fetcherV2<ListResponse<ItemReturn>>("item-returns", null, opts);
  },
  fetchById: async (id: number) => {
    const data = await fetcherV2<EditItemReturnRequest>(`item-returns/${id}`);
    return data;
  },
  create: async (payload: NewItemReturnRequest) =>
    await fetcherV2<NewItemReturnRequest>(
      "item-returns",
      JSON.stringify(payload),
      {
        method: "POST",
      },
    ),
  updateById: async (id: number, updateData: EditItemReturnRequest) => {
    const payload: EditItemReturnPayload = {
      return_type: updateData.return_type,
      item_category_id: updateData.item_category_id,
      date: updateData.date,
      from_batch: updateData.from_batch,
      to_batch: updateData.to_batch,
      to_vendor: updateData.to_vendor,
      quantity: updateData.quantity,
      rate_per_bag: updateData.rate_per_bag,
      total_amount: updateData.total_amount,
      status: updateData.status,
    };
    return await fetcherV2(`item-returns/${id}`, JSON.stringify(payload), {
      method: "PUT",
    });
  },
};

export default itemReturn;
