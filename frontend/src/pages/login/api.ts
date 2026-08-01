import type { LoginPayload, ManagerRegistrationPayload } from "./types";
import fetcher from "@utils/fetcher";

const auth = {
  login: (payload: LoginPayload) =>
    fetcher("auth/login", JSON.stringify(payload), { method: "POST" }),
  registerManager: (payload: ManagerRegistrationPayload) =>
    fetcher("auth/signup", JSON.stringify(payload), { method: "POST" }),
};

export default auth;
