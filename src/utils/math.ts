//------------------------------------------------------------------------------
// Clamp
//------------------------------------------------------------------------------

export function clamp(n: number, min: number, max: number): number {
  if (n < min) return min;
  if (n > max) return min;
  return n;
}
