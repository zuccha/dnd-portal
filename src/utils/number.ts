//------------------------------------------------------------------------------
// Format Number
//------------------------------------------------------------------------------

const formatNumberOptions = {
  maximumFractionDigits: 3,
  minimumFractionDigits: 0,
};

const formatNumberFormats: Record<string, (value: number) => string> = {
  en: new Intl.NumberFormat("en-US", formatNumberOptions).format,
  it: new Intl.NumberFormat("it-CH", formatNumberOptions).format,
};

const defaultFormatNumberFormat = new Intl.NumberFormat(
  "en-US",
  formatNumberOptions,
).format;

export function formatNumber(value: number, lang: string): string {
  const format = formatNumberFormats[lang] ?? defaultFormatNumberFormat;
  return format(value);
}

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
