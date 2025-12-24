//------------------------------------------------------------------------------
// Format Number
//------------------------------------------------------------------------------

const fmt = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 3,
  minimumFractionDigits: 0,
});

export const formatNumber = fmt.format;

//------------------------------------------------------------------------------
// Format Signed
//------------------------------------------------------------------------------

export function formatSigned(n: number): string {
  return n < 0 ? `${n}` : `+${n}`;
}
