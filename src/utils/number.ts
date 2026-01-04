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

//------------------------------------------------------------------------------
// Number To Letter
//------------------------------------------------------------------------------

export function numberToLetter(n: number): string {
  let result = "";
  do {
    result = String.fromCharCode(65 + (n % 26)) + result;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return result;
}
