import { clearSession } from "./session";

type Listener = () => void;

let listener: Listener | null = null;

export const setUnauthorizedListener = (fn: Listener | null) => {
  listener = fn;
};

// Called by fetchers when an authenticated request is rejected with 401
// (expired/invalid token). Clears the stored session and notifies the auth store.
export const handleUnauthorized = () => {
  clearSession();
  listener?.();
};
