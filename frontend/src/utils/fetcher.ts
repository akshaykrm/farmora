import { ValidationError } from "@errors/api.error";
import NetworkError from "@errors/network.error";
import { getSession } from "./session";
import { BACKEND_URL } from "@config";

const genURI = (path: string) => {
  const BASE_URI: string = BACKEND_URL;
  let serializedPath = path;
  if (serializedPath[0] === "/") {
    serializedPath = path.substring(1, path.length);
  }
  return new URL(`/api/${serializedPath}`, BASE_URI);
};

type Opts = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  filter?: Record<string, unknown>;
};

const serailizeFilter = (filter: Record<string, unknown>) => {
  const params = new URLSearchParams();
  Object.keys(filter).forEach((key) => {
    const value = filter[key];
    if (value !== null && value !== undefined && value !== "") {
      params.append(key, String(value));
    }
  });
  return params.toString();
};

const fetcher = async (path: string, payload?: string | null, opts?: Opts) => {
  const { method, filter } = opts || {};
  try {
    const URI = genURI(path);
    if (filter) {
      URI.search = serailizeFilter(filter);
    }
    const options: RequestInit = {
      method: method || "GET",
    };
    const session = getSession();
    options.headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.token || ""}`,
    };
    if (payload) {
      options.body = payload;
    }
    const res = await fetch(URI.toString(), options);
    const json = await res.json();

    if (res.ok) {
      return json.data;
    }

    const errorPayload = json.error || {};
    const message = errorPayload.message || "Something went wrong";

    if (Array.isArray(errorPayload.error)) {
      throw new ValidationError({
        message,
        error: errorPayload.error.map((err: { field: string; message: string }) => {
          return { name: err.field, message: err.message };
        }),
      });
    }

    throw new NetworkError(message, errorPayload.code);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NetworkError) {
      throw error;
    }
    throw new NetworkError(error instanceof Error ? error.message : "Something went wrong");
  }
};

export default fetcher;
