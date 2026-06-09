import { describe, expect, it } from "vitest";
import {
  displayLanguageStorageKey,
  languageSourceStorageKey,
  normalizeDisplayLanguage,
  readStoredDisplayLanguage,
  resolveBootstrapDisplayLanguage,
} from "./languagePreference";

class MemoryStorage {
  private readonly items = new Map<string, string>();

  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }
}

describe("languagePreference", () => {
  it("normalizes supported web display languages", () => {
    expect(normalizeDisplayLanguage("ko")).toBe("ko-KR");
    expect(normalizeDisplayLanguage("ko_KR")).toBe("ko-KR");
    expect(normalizeDisplayLanguage("en")).toBe("en-US");
    expect(normalizeDisplayLanguage("en-US")).toBe("en-US");
    expect(normalizeDisplayLanguage("ja-JP")).toBeNull();
  });

  it("migrates the legacy fk-lang value to the canonical language key", () => {
    const storage = new MemoryStorage();
    storage.setItem("fk-lang", "en");

    const displayLanguage = readStoredDisplayLanguage(storage);

    expect(displayLanguage).toBe("en-US");
    expect(storage.getItem(displayLanguageStorageKey)).toBe("en-US");
    expect(storage.getItem(languageSourceStorageKey)).toBe("auto");
  });

  it("uses bootstrap default language before country or browser language", () => {
    const displayLanguage = resolveBootstrapDisplayLanguage(
      {
        supportedLanguages: ["ko-KR", "en-US"],
        countryCode: "US",
        defaultLanguage: "ko-KR",
      },
      "en-US",
    );

    expect(displayLanguage).toBe("ko-KR");
  });

  it("uses the IP-derived country code when bootstrap has no default language", () => {
    expect(
      resolveBootstrapDisplayLanguage(
        { supportedLanguages: ["ko-KR", "en-US"], countryCode: "KR", defaultLanguage: null },
        "en-US",
      ),
    ).toBe("ko-KR");
    expect(
      resolveBootstrapDisplayLanguage(
        { supportedLanguages: ["ko-KR", "en-US"], countryCode: "US", defaultLanguage: null },
        "ko-KR",
      ),
    ).toBe("en-US");
  });

  it("falls back to browser language when bootstrap is unavailable", () => {
    expect(resolveBootstrapDisplayLanguage(null, "en-US")).toBe("en-US");
    expect(resolveBootstrapDisplayLanguage(null, "ja-JP")).toBe("ko-KR");
  });
});
