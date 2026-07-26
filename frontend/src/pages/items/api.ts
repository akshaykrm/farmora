import type { ItemListResponse, ItemFormValues, ItemName } from "./types";
import fetcher from "@utils/fetcher";
import fetcherV2, { type FetcherReturnType } from "@utils/fetcherV2";

const items = {
  fetchAll: (filter?: Record<string, string | number | null>) => {
    const opts = {
      method: "GET" as const,
      filter: filter,
    };

    return fetcherV2<ItemListResponse>("items/categories", null, opts);
  },
  getNames: () => fetcher("items/categories/names"),

  getByVendorId: async (
    vendorId: number,
  ): Promise<FetcherReturnType<ItemName[]>> => {
    const res = await fetcherV2<ItemName[]>(
      "/items/categories/names/" + vendorId,
    );
    return res;
  },
  fetchById: (id: number) =>
    fetcherV2<ItemFormValues>(`items/categories/${id}`),
  create: async (payload: ItemFormValues) => {
    return await fetcherV2("items/categories", JSON.stringify(payload), {
      method: "POST",
    });
  },
  updateById: async (id: number, updateData: ItemFormValues) => {
    const payload: ItemFormValues = {
      name: updateData.name,
      type: updateData.type,
      base_price: updateData.base_price,
      vendor_id: updateData.vendor_id,
    };
    return await fetcherV2(`items/categories/${id}`, JSON.stringify(payload), {
      method: "PUT",
    });
  },
};

export default items;
