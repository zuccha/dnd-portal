//------------------------------------------------------------------------------
// Format Number
//------------------------------------------------------------------------------

const formatNumberOptions = {
  maximumFractionDigits: 3,
  minimumFractionDigits: 0,
};

const formatNumberFormats: Record<string, (value: number) => string> = {
  en: new Intl.NumberFormat("en-US", formatNumberOptions).format,
  it: new Intl.NumberFormat("it-IT", formatNumberOptions).format,
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
// Format Number As Word
//------------------------------------------------------------------------------

const numberAsWord: Record<string, Record<number, string>> = {
  en: {
    0: "zero",
    1: "one",
    2: "two",
    3: "three",
    4: "four",
    5: "five",
    6: "six",
    7: "seven",
    8: "eight",
    9: "nine",
    10: "ten",
  },
  it: {
    0: "zero",
    1: "uno",
    2: "due",
    3: "tre",
    4: "quattro",
    5: "cinque",
    6: "sei",
    7: "sette",
    8: "otto",
    9: "nove",
    10: "dieci",
  },
};

export function formatNumberAsWord(value: number, lang: string): string {
  const word = numberAsWord[lang]?.[value];
  if (word) return word;
  return formatNumber(value, lang);
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
