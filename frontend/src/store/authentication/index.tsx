import { useEffect, useReducer, type ReactNode } from "react";
import { authDataContext, authDispatchContext } from "./context";
import type { AuthActions, AuthContextData, AuthUser } from "@app-types/auth.types";
import { createSession, getSession } from "@utils/session";
import profile from "@pages/profile/api";

const sessionToUser = (): AuthUser | null => {
  const userSession = getSession();
  if (!userSession.token) return null;
  return {
    name: userSession.name,
    username: userSession.username,
    email: userSession.email,
    phone: userSession.phone,
    role: userSession.role || userSession.user_type || null,
    user_type: userSession.user_type || userSession.role || null,
    permissions: userSession.permissions || [],
    master_id: userSession.master_id ?? null,
    parent_id: userSession.parent_id ?? null,
  };
};

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
      user: sessionToUser(),
    };
  });

  useEffect(() => {
    if (!value.token) return;
    const token = value.token;
    profile.fetchCurrent().then((res) => {
      if (res.status !== "success" || !res.data) return;
      const data = res.data;
      const user: AuthUser = {
        name: data.name,
        username: data.username,
        email: data.email,
        phone: data.phone,
        role: data.user_type,
        user_type: data.user_type,
        permissions: data.permissions || [],
        master_id: data.master_id ?? null,
        parent_id: data.parent_id ?? null,
      };
      createSession({
        token,
        name: user.name,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        user_type: user.user_type,
        permissions: user.permissions,
        master_id: user.master_id,
        parent_id: user.parent_id,
      });
      dispatch({ type: "LOGIN", payload: { token, user } });
    });
  }, [value.token]);

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
