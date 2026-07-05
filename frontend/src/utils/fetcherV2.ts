import { type ErrorTest } from "@errors/api.error";
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
  filter?: any;
};

const serailizeFilter = (filter: any) => {
  const params = new URLSearchParams();
  Object.keys(filter).forEach((key) => {
    const value = filter[key];
    if (value !== null && value !== undefined && value !== "") {
      params.append(key, String(value));
    }
  });
  return params.toString();
};

export type FetcherReturnStatus =
  | "success"
  | "validation_error"
  | "failed"
  | "network_error";

export type FetcherReturnType<T> = {
  status: FetcherReturnStatus;
  data?: T;
  error?: any;
};

const fetcherV2 = async <T>(
  path: string,
  payload?: string | null,
  opts?: Opts,
): Promise<FetcherReturnType<T>> => {
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
      return {
        status: "success",
        data: json.data,
      };
    }

    if (json.error.error) {
      const errorList: ErrorTest[] = json.error.error.map((err: any) => {
        return { name: err.field, message: err.message };
      });
      return {
        status: "validation_error",
        error: errorList,
      };
    }
    return { status: "failed", data: json.error.message };
  } catch (error: any) {
    // console.log(error);
    return {
      status: "network_error",
    };
  }
};

export default fetcherV2;
