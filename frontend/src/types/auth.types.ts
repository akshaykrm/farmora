import { type ActionDispatch } from "react";

export type LoginPayload = {
  username: string;
  password: string;
};

export type ResetPasswordPayload = {
  username: string;
  new_password: string;
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};

export type ManagerRegistrationPayload = {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  status: number;
  package_id: number;
};

export type AuthUser = {
  name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  role: string | null;
};

export type AuthContextData = {
  token: string | null;
  user: AuthUser | null;
};

export type AuthDispatchContextData = ActionDispatch<[action: AuthActions]>;

export type AuthActions =
  | {
      type: "LOGIN";
      payload: {
        token: string | null;
        user?: AuthUser | null;
      };
    }
  | {
      type: "UPDATE_PROFILE";
      payload: {
        name: string;
        email: string;
        phone: string;
      };
    }
  | {
      type: "LOGOUT";
      payload: {
        token: string | null;
        user?: AuthUser | null;
      };
    };

export type UserSession = {
  username: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  token: string | null;
  role?: string | null;
};

export type UserProfile = {
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
};

export type UpdateProfilePayload = {
  name: string;
  email: string;
  phone: string;
};
