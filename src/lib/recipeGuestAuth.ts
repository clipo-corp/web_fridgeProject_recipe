import { currentRequestDisplayLanguage } from "./languagePreference";
import { apiBaseUrl } from "./runtimeConfig";
import type { ApiResponse, LoginResponse } from "./recipeServerTypes";

const guestTokenKey = "keepcook.guestAccessToken";
const guestDeviceKey = "keepcook.guestDeviceId";
const legacyGuestTokenKey = "freshkeeper.guestAccessToken";
const legacyGuestDeviceKey = "freshkeeper.guestDeviceId";
let guestAccessTokenRequest: Promise<string> | null = null;

export async function fetchWithGuestAuth<T>(
  path: string,
  init: RequestInit = {},
  retryOnUnauthorized = true,
): Promise<T> {
  const token = await getGuestAccessToken();
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": currentRequestDisplayLanguage(),
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });

  if ((response.status === 401 || response.status === 403) && retryOnUnauthorized) {
    clearGuestAccessToken();
    return fetchWithGuestAuth<T>(path, init, false);
  }

  if (retryOnUnauthorized && await isGuestAuthMismatchResponse(response)) {
    clearGuestAccessToken();
    return fetchWithGuestAuth<T>(path, init, false);
  }

  return readApiResponse<T>(response);
}

export async function fetchRawWithGuestAuth<T>(
  path: string,
  init: RequestInit = {},
  retryOnUnauthorized = true,
): Promise<T> {
  const token = await getGuestAccessToken();
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": currentRequestDisplayLanguage(),
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });

  if ((response.status === 401 || response.status === 403) && retryOnUnauthorized) {
    clearGuestAccessToken();
    return fetchRawWithGuestAuth<T>(path, init, false);
  }

  if (retryOnUnauthorized && await isGuestAuthMismatchResponse(response)) {
    clearGuestAccessToken();
    return fetchRawWithGuestAuth<T>(path, init, false);
  }

  return readRawJsonResponse<T>(response);
}

async function getGuestAccessToken(): Promise<string> {
  clearMigratedLegacyGuestAccessToken();

  const cached = sessionStorage.getItem(guestTokenKey);
  if (cached !== null && cached.length > 0) {
    return cached;
  }

  if (guestAccessTokenRequest !== null) {
    return guestAccessTokenRequest;
  }

  guestAccessTokenRequest = fetch(apiUrl("/api/auth/guest/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": currentRequestDisplayLanguage(),
    },
    body: JSON.stringify({ deviceId: getGuestDeviceId() }),
  })
    .then((response) => readApiResponse<LoginResponse>(response))
    .then((data) => {
      if (data.accessToken === undefined || data.accessToken.length === 0) {
        throw new Error("Guest login did not return an access token.");
      }

      sessionStorage.setItem(guestTokenKey, data.accessToken);
      return data.accessToken;
    })
    .finally(() => {
      guestAccessTokenRequest = null;
    });

  return guestAccessTokenRequest;
}

function clearGuestAccessToken(): void {
  sessionStorage.removeItem(guestTokenKey);
  sessionStorage.removeItem(legacyGuestTokenKey);
  guestAccessTokenRequest = null;
}

function clearMigratedLegacyGuestAccessToken(): void {
  if (sessionStorage.getItem(legacyGuestTokenKey) === null) {
    return;
  }

  sessionStorage.removeItem(legacyGuestTokenKey);
  sessionStorage.removeItem(guestTokenKey);
}

function getGuestDeviceId(): string {
  const cached = readStoredValue(localStorage, guestDeviceKey, legacyGuestDeviceKey);
  if (cached !== null && cached.length > 0) {
    return cached;
  }

  const deviceId =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(guestDeviceKey, deviceId);
  return deviceId;
}

function readStoredValue(
  storage: Storage,
  currentKey: string,
  legacyKey: string,
): string | null {
  const current = storage.getItem(currentKey);
  if (current !== null && current.length > 0) {
    return current;
  }

  const legacy = storage.getItem(legacyKey);
  if (legacy !== null && legacy.length > 0) {
    storage.setItem(currentKey, legacy);
    storage.removeItem(legacyKey);
    return legacy;
  }

  return null;
}

async function isGuestAuthMismatchResponse(response: Response): Promise<boolean> {
  if (response.status !== 400) {
    return false;
  }

  try {
    const payload = await response.clone().json() as { readonly code?: unknown };
    return payload.code === "NOT_EQUALS_USER";
  } catch {
    return false;
  }
}

async function readApiResponse<T>(response: Response): Promise<T> {
  const responseText = await response.text();
  let payload: ApiResponse<T>;

  try {
    payload = JSON.parse(responseText) as ApiResponse<T>;
  } catch {
    throw new Error(
      responseText.length > 0
        ? `Server returned a non-JSON response: ${responseText}`
        : `Server request failed with status ${response.status}.`,
    );
  }

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(payload.message ?? `Server request failed with status ${response.status}.`);
  }

  return payload.data;
}

async function readRawJsonResponse<T>(response: Response): Promise<T> {
  const responseText = await response.text();
  let payload: unknown;

  try {
    payload = responseText.length > 0 ? JSON.parse(responseText) : null;
  } catch {
    throw new Error(
      responseText.length > 0
        ? `Server returned a non-JSON response: ${responseText}`
        : `Server request failed with status ${response.status}.`,
    );
  }

  if (!response.ok) {
    throw new Error(`Server request failed with status ${response.status}.`);
  }

  return payload as T;
}

function apiUrl(path: string): string {
  return `${apiBaseUrl}${path}`;
}
