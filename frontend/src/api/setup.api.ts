import type {
  GenerateDefaultsResult,
  SaveSetupItemsPayload,
  SaveSetupItemsResult,
  SetupProfile,
  SetupStatus,
} from "@app-types/setup.types";
import profile from "@pages/profile/api";
import fetcher from "@utils/fetcher";
import fetcherV2, { type FetcherReturnType } from "@utils/fetcherV2";

export type SetupVendorName = {
  id: number;
  name: string;
  vendor_type: "supplier" | "customer" | "internal";
};

const setup = {
  fetchStatus: (): Promise<SetupStatus> => fetcher("setup/status"),
  generateDefaults: (): Promise<GenerateDefaultsResult> =>
    fetcher("setup/generate", null, { method: "POST" }),
  fetchSuppliers: async (): Promise<SetupVendorName[]> => {
    const names: SetupVendorName[] = await fetcher("vendors/names", null, {
      method: "GET",
      filter: { type: "supplier" },
    });
    return names.filter((vendor) => vendor.vendor_type === "supplier");
  },
  saveItems: (payload: SaveSetupItemsPayload) =>
    fetcherV2<SaveSetupItemsResult>("setup/items", JSON.stringify(payload), {
      method: "POST",
    }),
  updateProfileFarmDetails: async (
    farmDetails: SetupProfile,
  ): Promise<FetcherReturnType<unknown>> => {
    const current = await profile.fetchCurrent();
    if (current.status !== "success" || !current.data) return current;
    const { name, email, phone } = current.data;
    return profile.updateCurrent({
      name,
      email: email ?? "",
      phone: phone ?? "",
      ...farmDetails,
    });
  },
};

export default setup;
