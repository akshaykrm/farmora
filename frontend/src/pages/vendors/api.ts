import fetcherV2 from "@utils/fetcherV2";
import type {
  VendorDetail,
  VendorFormValues,
  VendorNamesFilter,
  VendorsListResponse,
} from "./types";
import type { Filter } from "@utils/filters";
import fetcher from "@utils/fetcher";

const vendors = {
  fetchAll: (filter?: Filter) => {
    const opts = {
      method: "GET" as const,
      filter: filter,
    };
    return fetcherV2<VendorsListResponse>("vendors", null, opts);
  },
  fetchById: (id: number) => fetcherV2<VendorDetail>(`vendors/${id}`),
  getNames: (filter?: VendorNamesFilter) =>
    fetcher("vendors/names", null, {
      method: "GET",
      filter: filter,
    }),
  create: (payload: VendorFormValues) =>
    fetcherV2<unknown>("vendors", JSON.stringify(payload), {
      method: "POST",
    }),
  updateById: (id: number, payload: VendorFormValues) =>
    fetcherV2<unknown>(`vendors/${id}`, JSON.stringify(payload), {
      method: "PUT",
    }),
};

export default vendors;
