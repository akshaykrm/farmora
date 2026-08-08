import fetcherV2 from "@utils/fetcherV2";
import type { ChangePasswordPayload } from "@app-types/auth.types";
import type { ProfileDetail, UpdateProfilePayload } from "./types";

const profile = {
  fetchCurrent: () => fetcherV2<ProfileDetail>("users/me"),
  updateCurrent: (payload: UpdateProfilePayload) =>
    fetcherV2<ProfileDetail>("users/me", JSON.stringify(payload), {
      method: "PUT",
    }),
  changePassword: (payload: ChangePasswordPayload) =>
    fetcherV2<unknown>("auth/change-password", JSON.stringify(payload), {
      method: "POST",
    }),
};

export default profile;
