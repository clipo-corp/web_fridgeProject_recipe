function envFlag(name: string, fallback: boolean): boolean {
  const value = import.meta.env[name];
  if (value === undefined) {
    return fallback;
  }

  return value.trim().toLowerCase() === "true";
}

export const isMockMode = envFlag("VITE_MOCK_MODE", false);

/**
 * Appends a hand-built recipe exercising the sectioned, seekable-video shape.
 * Off by default: the deployed API cannot produce this shape yet, so it exists only
 * to review that UI locally. Requires mock mode.
 */
export const isSeekableDemoEnabled = envFlag("VITE_SEEKABLE_DEMO", false);
const defaultApiBaseUrl = "https://smart-fridge-server-dbvf.onrender.com";

export const apiBaseUrl = (import.meta.env["VITE_API_BASE_URL"] ?? defaultApiBaseUrl).replace(/\/$/, "");
