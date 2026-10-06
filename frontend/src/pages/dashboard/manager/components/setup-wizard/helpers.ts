import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { FetcherReturnType } from "@utils/fetcherV2";

export const requiredText =
  (message: string, min = 1) =>
  (value: string | undefined) =>
    (value ?? "").trim().length >= min || message;

export const applyServerErrors = <T extends FieldValues>(
  res: FetcherReturnType<unknown>,
  setError: UseFormSetError<T>,
  fields: Path<T>[],
): string | null => {
  if (res.status === "validation_error" && Array.isArray(res.error)) {
    const unmatched: string[] = [];
    for (const err of res.error as { name: string; message: string }[]) {
      if ((fields as string[]).includes(err.name)) {
        setError(err.name as Path<T>, { message: err.message });
      } else {
        unmatched.push(err.message);
      }
    }
    return unmatched.length ? unmatched.join(" ") : null;
  }
  if (res.status === "failed") {
    return typeof res.data === "string" ? res.data : "Something went wrong.";
  }
  if (res.status === "network_error") {
    return "Network error. Please check your connection and try again.";
  }
  return null;
};
