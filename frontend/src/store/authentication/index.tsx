import { useReducer, type ReactNode } from "react";
import { authDataContext, authDispatchContext } from "./context";
import type { AuthActions, AuthContextData } from "@pages/login/types";
import { getSession } from "@utils/session";

const authReducer = (
  state: AuthContextData,
  action: AuthActions,
): AuthContextData => {
  switch (action.type) {
    case "LOGIN":
      return {
        token: action.payload.token,
        user: action.payload.user || null,
      };
    case "LOGOUT":
      return { token: null, user: null };
    default:
      return state;
  }
};

const initialAuthState: AuthContextData = { token: null, user: null };

type AuthProviderProps = {
  children: ReactNode;
};

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [value, dispatch] = useReducer(authReducer, initialAuthState, () => {
    const userSession = getSession();
    return {
      token: userSession.token || null,
      user: userSession.token
        ? {
            name: userSession.name,
            username: userSession.username,
            role: userSession.role || null,
          }
        : null,
    };
  });

  return (
    <>
      <authDataContext.Provider value={value}>
        <authDispatchContext.Provider value={dispatch}>
          {children}
        </authDispatchContext.Provider>
      </authDataContext.Provider>
    </>
  );
};

export default AuthProvider;
