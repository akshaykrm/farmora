import type {
  AuthDispatchContextData,
  AuthActions,
  AuthContextData,
} from "@pages/login/types";
import { createContext, useContext } from "react";

const noob = (_action: AuthActions) => {};

export const authDataContext = createContext<AuthContextData>({
  token: null,
  user: null,
});
export const authDispatchContext = createContext<AuthDispatchContextData>(noob);

export const useAuth = () => {
  return useContext(authDataContext);
};

export const useAuthDispatch = () => {
  return useContext(authDispatchContext);
};
