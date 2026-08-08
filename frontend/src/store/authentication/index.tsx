import { useReducer, type ReactNode } from "react";
import { authDataContext, authDispatchContext } from "./context";
import type { AuthActions, AuthContextData } from "@app-types/auth.types";
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
    case "UPDATE_PROFILE":
      return {
        token: state.token,
        user: state.user
          ? {
              ...state.user,
              name: action.payload.name,
              email: action.payload.email,
              phone: action.payload.phone,
            }
          : state.user,
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
            email: userSession.email,
            phone: userSession.phone,
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
