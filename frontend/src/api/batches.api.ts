import type {
  EditBatchRequest,
  EditBatchPayload,
  NewBatchRequest,
} from "@app-types/batch.types";
import type { BatchNameFilter } from "@pages/batches/types";
import fetcher from "@utils/fetcher";

const batches = {
  fetchAll: () => fetcher("batches"),
  getNames: (filter?: BatchNameFilter) =>
    fetcher("batches/names", null, {
      method: "GET",
      filter,
    }),
  fetchById: (id: number) => fetcher(`batches/${id}`),
  create: async (payload: NewBatchRequest) =>
    await fetcher("batches", JSON.stringify(payload), { method: "POST" }),
  updateById: async (id: number, updateData: EditBatchRequest) => {
    const payload: EditBatchPayload = {
      name: updateData.name,
      farm_id: updateData.farm_id,
      season_id: updateData.season_id,
      status: updateData.status,
    };
    return await fetcher(`batches/${id}`, JSON.stringify(payload), {
      method: "PUT",
    });
  },
};

export default batches;
