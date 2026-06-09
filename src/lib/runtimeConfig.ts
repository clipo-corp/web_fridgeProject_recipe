function envFlag(name: string, fallback: boolean): boolean {
  const value = import.meta.env[name];
  if (value === undefined) {
    return fallback;
  }

  return value.trim().toLowerCase() === "true";
}

export const isMockMode = envFlag("VITE_MOCK_MODE", false);
export const apiBaseUrl = (import.meta.env["VITE_API_BASE_URL"] ?? "").replace(/\/$/, "");
