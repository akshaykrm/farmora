import { type ActionDispatch } from "react";

export type LoginPayload = {
  username: string;
  password: string;
};

export type ManagerRegistrationPayload = {
  name: string;
  username: string;
  password: string;
  status: number;
  package_id: number;
};

export type AuthContextData = {
  token: string | null;
  user: {
    name: string | null;
    username: string | null;
    role: string | null;
  } | null;
};

export type AuthDispatchContextData = ActionDispatch<[action: AuthActions]>;

export type AuthActions = {
  type: "LOGIN" | "LOGOUT";
  payload: {
    token: string | null;
    user?: {
      name: string;
      username: string;
      role: string;
    } | null;
  };
};

export type UserSession = {
  username: string | null;
  name: string | null;
  token: string | null;
  role?: string | null;
};

export type UserProfile = {
  name: string;
  username: string;
  role: string;
};
