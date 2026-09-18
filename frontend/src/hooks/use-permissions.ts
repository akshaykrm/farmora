import type { AuthUser } from "@app-types/auth.types";
import { useAuth } from "@store/authentication/context";
import { isPlatformPermission, USER_TYPES } from "@utils/user-types";
import { useCallback } from "react";

const EMPTY_PERMISSIONS: string[] = [];

export const usePermissions = () => {
  const { user } = useAuth();
  const userType = user?.user_type || user?.role;
  const permissions = user?.permissions ?? EMPTY_PERMISSIONS;
  const isSuperAdmin = userType === USER_TYPES.admin;
  const isSubscriber = userType === USER_TYPES.manager;
  const isStaff = userType === USER_TYPES.staff;

  const can = useCallback(
    (key?: string) => {
      if (!key) return true;
      if (isSuperAdmin) return true;
      if (isSubscriber) return !isPlatformPermission(key);
      return permissions.includes(key);
    },
    [isSuperAdmin, isSubscriber, permissions],
  );

  return {
    user: user as AuthUser | null,
    permissions,
    userType,
    isSuperAdmin,
    isSubscriber,
    isStaff,
    can,
  };
};

export default usePermissions;
