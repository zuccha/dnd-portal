import { useMemo } from "react";
import z from "zod";
import { useI18nLangContext } from "../i18n/i18n-lang-context";
import { compareObjects } from "./object";

//------------------------------------------------------------------------------
// Palette
//------------------------------------------------------------------------------

export type Palette = {
  "50": string;
  "100": string;
  "700": string;
  "800": string;
};

export const defaultPalette = {
  50: "#fafafa",
  100: "#f4f4f5",
  700: "#3f3f46",
  800: "#27272a",
};

//------------------------------------------------------------------------------
// Palette Name
//------------------------------------------------------------------------------

export const paletteNameSchema = z.enum([
  "blue",
  "brown",
  "cyan",
  "gray",
  "green",
  "lime",
  "orange",
  "pink",
  "purple",
  "red",
  "teal",
  "yellow",
]);

export type PaletteName = z.infer<typeof paletteNameSchema>;

export const paletteNames = paletteNameSchema.options;

//------------------------------------------------------------------------------
// Palettes
//------------------------------------------------------------------------------

export const chakraPalettes: Record<PaletteName, Palette> = {
  blue: { 50: "#eff6ff", 100: "#dbeafe", 700: "#173da6", 800: "#1a3478" },
  brown: { 50: "#E4D9CE", 100: "#CDB9A7", 700: "#6F5442", 800: "#4E3A2D" },
  cyan: { 50: "#ecfeff", 100: "#cffafe", 700: "#0c5c72", 800: "#134152" },
  gray: { 50: "#fafafa", 100: "#f4f4f5", 700: "#3f3f46", 800: "#27272a" },
  green: { 50: "#f0fdf4", 100: "#dcfce7", 700: "#116932", 800: "#124a28" },
  lime: { 50: "#E7EDD6", 100: "#D1DBA8", 700: "#7B8744", 800: "#5D6B2E" },
  orange: { 50: "#fff7ed", 100: "#ffedd5", 700: "#92310a", 800: "#6c2710" },
  pink: { 50: "#fdf2f8", 100: "#fce7f3", 700: "#a41752", 800: "#6d0e34" },
  purple: { 50: "#faf5ff", 100: "#f3e8ff", 700: "#641ba3", 800: "#4a1772" },
  red: { 50: "#fef2f2", 100: "#fee2e2", 700: "#991919", 800: "#511111" },
  teal: { 50: "#f0fdfa", 100: "#ccfbf1", 700: "#0c5d56", 800: "#114240" },
  yellow: { 50: "#fefce8", 100: "#fef9c3", 700: "#845209", 800: "#713f12" },
};

export const customPalettes: Record<PaletteName, Palette> = {
  blue: { 50: "#D5D9DF", 100: "#C2C7CF", 700: "#58687D", 800: "#163C6E" },
  brown: { 50: "#E4D9CE", 100: "#CDB9A7", 700: "#6F5442", 800: "#4E3A2D" },
  cyan: { 50: "#DCE8EA", 100: "#C9D8DC", 700: "#5A7E86", 800: "#2E5A64" },
  gray: { 50: "#E3E3E4", 100: "#D2D2D4", 700: "#5B5B5E", 800: "#3F3F42" },
  green: { 50: "#DCEBE0", 100: "#C8D9CE", 700: "#5B7C63", 800: "#35563C" },
  lime: { 50: "#E7EDD6", 100: "#D1DBA8", 700: "#7B8744", 800: "#5D6B2E" },
  orange: { 50: "#F2DDCC", 100: "#E1C1A5", 700: "#9B5A2C", 800: "#7A3D1D" },
  pink: { 50: "#EADAE3", 100: "#D3BBC9", 700: "#8B5872", 800: "#65384F" },
  purple: { 50: "#E3DDEA", 100: "#CEC5DB", 700: "#6E5B86", 800: "#4F3D64" },
  red: { 50: "#DED2D2", 100: "#CFC2C2", 700: "#7D5858", 800: "#6D1515" },
  teal: { 50: "#D8E3E1", 100: "#C7D6D4", 700: "#587D77", 800: "#145B4F" },
  yellow: { 50: "#F3E7C7", 100: "#E2CF98", 700: "#8E7A2D", 800: "#6E5B1E" },
};

//------------------------------------------------------------------------------
// Use Palette Name Options
//------------------------------------------------------------------------------

export function usePaletteNameOptions() {
  const { t } = useI18nLangContext(i18nContext);

  return useMemo(() => {
    return paletteNames
      .map((paletteName) => ({
        label: t(`palette_name[${paletteName}]`),
        value: paletteName,
      }))
      .sort(compareObjects("label"));
  }, [t]);
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "palette_name[blue]": {
    en: "Blue",
    it: "Blue",
  },
  "palette_name[brown]": {
    en: "Brown",
    it: "Marrone",
  },
  "palette_name[cyan]": {
    en: "Cyan",
    it: "Ciano",
  },
  "palette_name[gray]": {
    en: "Gray",
    it: "Grigio",
  },
  "palette_name[green]": {
    en: "Green",
    it: "Verde",
  },
  "palette_name[lime]": {
    en: "Lime",
    it: "Lime",
  },
  "palette_name[magenta]": {
    en: "Magenta",
    it: "Magenta",
  },
  "palette_name[orange]": {
    en: "Orange",
    it: "Arancione",
  },
  "palette_name[pink]": {
    en: "Pink",
    it: "Rosa",
  },
  "palette_name[purple]": {
    en: "Purple",
    it: "Viola",
  },
  "palette_name[red]": {
    en: "Red",
    it: "Rosso",
  },
  "palette_name[teal]": {
    en: "Teal",
    it: "Verde Mare",
  },
  "palette_name[yellow]": {
    en: "Yellow",
    it: "Giallo",
  },
};
