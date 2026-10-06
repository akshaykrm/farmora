export type Validator = (value: string | undefined) => string | true;

const text = (value: string | undefined) => (value ?? "").trim();

export const digitsOnly = (value: string | undefined) =>
  (value ?? "").replace(/[\s-]/g, "");

export const validators = {
  name: (v) => text(v).length >= 2 || "Enter your full name.",
  email: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text(v)) ||
    "Enter a valid email address.",
  phone: (v) =>
    /^\d{10}$/.test(digitsOnly(text(v))) || "Enter a 10-digit phone number.",
  username: (v) => text(v).length >= 3 || "Choose a username (3+ characters).",
  password: (v) => (v ?? "").length >= 8 || "Use at least 8 characters.",
  bird_capacity: (v) => {
    if (text(v) === "") return true;
    const n = Number(text(v));
    return (Number.isFinite(n) && n > 0) || "Enter your bird capacity.";
  },
  state: () => true,
  district: () => true,
  place: () => true,
  pincode: (v) =>
    text(v) === "" || /^\d{6}$/.test(text(v)) || "Enter a 6-digit pincode.",
} satisfies Record<string, Validator>;

export type PasswordStrength = {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  level: "none" | "weak" | "moderate" | "good" | "strong";
};

export const passwordStrength = (password: string): PasswordStrength => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { level: "none", label: "" },
    { level: "weak", label: "Weak" },
    { level: "moderate", label: "Moderate" },
    { level: "good", label: "Good" },
    { level: "strong", label: "Strong" },
  ] as const;

  return { score: score as PasswordStrength["score"], ...levels[score] };
};
