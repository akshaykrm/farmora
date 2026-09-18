export const USER_TYPES = {
  admin: "admin",
  manager: "manager",
  staff: "staff",
} as const;

export type UserType = (typeof USER_TYPES)[keyof typeof USER_TYPES];

export const USER_TYPE_LABELS: Record<string, string> = {
  admin: "Super Admin",
  manager: "Subscriber",
  staff: "User",
};

export const PLATFORM_PERMISSION_PREFIXES = [
  "subscriber:",
  "package:",
  "subscription:",
  "referral:",
  "referral_ledger:",
];

export const isPlatformPermission = (key: string) =>
  PLATFORM_PERMISSION_PREFIXES.some((prefix) => key.startsWith(prefix));
