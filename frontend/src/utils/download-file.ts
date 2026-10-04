import { BACKEND_URL } from "@config";
import { getSession } from "./session";

const buildURL = (path: string, filter?: Record<string, unknown>) => {
  const serializedPath = path.startsWith("/") ? path.substring(1) : path;
  const url = new URL(`/api/${serializedPath}`, BACKEND_URL);
  if (filter) {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });
    url.search = params.toString();
  }
  return url;
};

const filenameFromHeader = (header: string | null) => {
  if (!header) return null;
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(header);
  return match ? decodeURIComponent(match[1]) : null;
};

const errorMessage = async (res: Response) => {
  try {
    const json = await res.json();
    const details = json?.error?.error;
    if (Array.isArray(details) && details.length) {
      return details.map((e: { message: string }) => e.message).join(", ");
    }
    return json?.error?.message || json?.message || "Download failed";
  } catch {
    return "Download failed";
  }
};

const downloadFile = async (
  path: string,
  filter?: Record<string, unknown>,
  fallbackFilename = "download",
) => {
  const res = await fetch(buildURL(path, filter).toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getSession()?.token || ""}`,
    },
  });

  if (!res.ok) {
    throw new Error(await errorMessage(res));
  }

  const blob = await res.blob();
  const filename =
    filenameFromHeader(res.headers.get("Content-Disposition")) ||
    fallbackFilename;

  const objectURL = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectURL;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectURL);
};

export default downloadFile;
