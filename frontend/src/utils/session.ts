import type { UpdateProfilePayload, UserSession } from "@app-types/auth.types";

const AUTH_TOKEN_KEY = "x-auth-token";
const AUTH_USER_KEY = "x-auth-user";

const emptyUser = {
  name: null as string | null,
  username: null as string | null,
  email: null as string | null,
  phone: null as string | null,
  role: null as string | null,
  user_type: null as string | null,
  permissions: [] as string[],
  master_id: null as number | null,
  parent_id: null as number | null,
};

export const createSession = (session: UserSession) => {
  sessionStorage.setItem(AUTH_TOKEN_KEY, session.token || "");
  sessionStorage.setItem(
    AUTH_USER_KEY,
    JSON.stringify({
      name: session.name,
      username: session.username,
      email: session.email,
      phone: session.phone,
      role: session.role || session.user_type,
      user_type: session.user_type || session.role,
      permissions: session.permissions || [],
      master_id: session.master_id ?? null,
      parent_id: session.parent_id ?? null,
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
        role: parsedData.role || parsedData.user_type,
        user_type: parsedData.user_type || parsedData.role,
        permissions: parsedData.permissions || [],
        master_id: parsedData.master_id ?? null,
        parent_id: parsedData.parent_id ?? null,
      };
    } catch {
      return { token, ...emptyUser };
    }
  }

  return { token, ...emptyUser };
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
