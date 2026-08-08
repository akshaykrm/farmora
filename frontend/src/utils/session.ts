import type { UpdateProfilePayload, UserSession } from "@app-types/auth.types";

const AUTH_TOKEN_KEY = "x-auth-token";
const AUTH_USER_KEY = "x-auth-user";

export const createSession = (session: UserSession) => {
  sessionStorage.setItem(AUTH_TOKEN_KEY, session.token || "");
  sessionStorage.setItem(
    AUTH_USER_KEY,
    JSON.stringify({
      name: session.name,
      username: session.username,
      email: session.email,
      phone: session.phone,
      role: session.role,
    }),
  );
};

export const getSession = (): UserSession => {
  const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
  const userData = sessionStorage.getItem(AUTH_USER_KEY);

  if (userData) {
    try {
      const parsedData = JSON.parse(userData);
      return {
        token,
        name: parsedData.name,
        username: parsedData.username,
        email: parsedData.email,
        phone: parsedData.phone,
        role: parsedData.role,
      };
    } catch {
      return {
        token,
        name: null,
        username: null,
        email: null,
        phone: null,
        role: null,
      };
    }
  }

  return {
    token,
    name: null,
    username: null,
    email: null,
    phone: null,
    role: null,
  };
};

export const updateSessionProfile = (profile: UpdateProfilePayload) => {
  const session = getSession();
  createSession({
    ...session,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
  });
};

export const clearSession = () => {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
};
