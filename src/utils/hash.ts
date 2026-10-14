import { sha256 as sha256Fallback } from "@noble/hashes/sha2.js";

//------------------------------------------------------------------------------
// Hash
//------------------------------------------------------------------------------

export function hash(value: unknown): string {
  return JSON.stringify(value, (_key, v) => {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return Object.keys(v)
        .sort()
        .reduce<Record<string, unknown>>((acc, k) => {
          acc[k] = (v as Record<string, unknown>)[k];
          return acc;
        }, {});
    }
    return v;
  });
}

//------------------------------------------------------------------------------
// SHA-256
//------------------------------------------------------------------------------

export async function sha256(value: unknown): Promise<string> {
  const data = new TextEncoder().encode(hash(value));
  const digest = globalThis.crypto?.subtle
    ? new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", data))
    : sha256Fallback(data);

  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
}
