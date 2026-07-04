import { hash } from "./hash";

//------------------------------------------------------------------------------
// Create UUID
//------------------------------------------------------------------------------

export function createUuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  if (globalThis.crypto?.getRandomValues) {
    const randomValues = globalThis.crypto.getRandomValues(new Uint32Array(4));
    return Array.from(randomValues, (value) =>
      value.toString(16).padStart(8, "0"),
    ).join("-");
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

//------------------------------------------------------------------------------
// Create Deterministic UUID
//------------------------------------------------------------------------------

export function createDeterministicUuid(value: unknown): string {
  const input = hash(value);
  const hex = [
    hashStringToHex(input, 0x811c9dc5),
    hashStringToHex(input, 0x01000193),
    hashStringToHex(input, 0x85ebca6b),
    hashStringToHex(input, 0xc2b2ae35),
  ].join("");
  const variant = ((Number.parseInt(hex[16] ?? "0", 16) & 0x3) | 0x8).toString(
    16,
  );

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    `4${hex.slice(13, 16)}`,
    `${variant}${hex.slice(17, 20)}`,
    hex.slice(20, 32),
  ].join("-");
}

//------------------------------------------------------------------------------
// Has String to Hex
//------------------------------------------------------------------------------

function hashStringToHex(input: string, seed: number): string {
  let result = seed;

  for (let i = 0; i < input.length; i += 1) {
    result ^= input.charCodeAt(i);
    result = Math.imul(result, 0x01000193);
  }

  return (result >>> 0).toString(16).padStart(8, "0");
}
