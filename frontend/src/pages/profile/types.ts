import type { ValidationError } from "@errors/api.error";

export type ProfileFormValues = {
  name: string;
  username: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  place: string;
  pincode: string;
  bird_capacity: string;
};

export type ProfileDetail = {
  id: number;
  name: string;
  username: string;
  email: string | null;
  phone: string | null;
  user_type: string;
  state: string | null;
  district: string | null;
  place: string | null;
  pincode: string | null;
  bird_capacity: string | null;
};

export type UpdateProfilePayload = {
  name: string;
  email: string;
  phone: string;
  state: string;
  district: string;
  place: string;
  pincode: string;
  bird_capacity: string;
};

export type ChangePasswordFormValues = {
  current_password: string;
  new_password: string;
  confirm_password: string;
};

export type UseChangePassword = (opts: {
  onSuccess: () => void;
}) => {
  onSubmit: (inputData: ChangePasswordFormValues) => void;
  errors: ValidationError[];
  errorMessage: string | null;
  clearError: () => void;
};

type UseUpdateProfileReturn = {
  onSubmit: (inputData: ProfileFormValues) => void;
  errors: ValidationError[];
  clearError: () => void;
};

export type UseUpdateProfile = (opts: {
  onSuccess: (inputData: ProfileFormValues) => void;
}) => UseUpdateProfileReturn;
