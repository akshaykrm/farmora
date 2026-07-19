import type {
  NewVendorRequest,
  EditVendorPayload,
  EditVendorRequest,
} from "@app-types/vendor.types";
import type { VendorNamesFilter } from "@pages/vendors/types";
import fetcher from "@utils/fetcher";

const vendors = {
  fetchAll: () => fetcher("vendors"),
  getNames: (filter?: VendorNamesFilter) =>
    fetcher("vendors/names", null, {
      method: "GET",
      filter: filter,
    }),
  fetchById: (id: number) => fetcher(`vendors/${id}`),
  create: async (payload: NewVendorRequest) =>
    await fetcher("vendors", JSON.stringify(payload), { method: "POST" }),
  updateById: async (id: number, updateData: EditVendorRequest) => {
    const payload: EditVendorPayload = {
      name: updateData.name,
      address: updateData.address,
      opening_balance: updateData.opening_balance,
      vendor_type: updateData.vendor_type,
    };
    return await fetcher(`vendors/${id}`, JSON.stringify(payload), {
      method: "PUT",
    });
  },
};

export default vendors;
