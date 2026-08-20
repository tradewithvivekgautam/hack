const DEFAULT_APP_PATH = "/vault";

export function getSafeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_APP_PATH;
  }

  try {
    const url = new URL(value, "https://arca.local");
    if (url.origin !== "https://arca.local" || url.pathname === "/login") {
      return DEFAULT_APP_PATH;
    }
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_APP_PATH;
  }
}

export { DEFAULT_APP_PATH };
