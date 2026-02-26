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

const palette = (
  c50: string,
  c100: string,
  c700: string,
  c800: string,
): Palette => ({ 50: c50, 100: c100, 700: c700, 800: c800 });

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

export const palettes: Record<PaletteName, Palette> = {
  blue: /*   */ palette("#D5D9DF", "#C2C7CF", "#58687D", "#163C6E"),
  brown: /*  */ palette("#E4D9CE", "#CDB9A7", "#6F5442", "#4E3A2D"),
  cyan: /*   */ palette("#DCE8EA", "#C9D8DC", "#5A7E86", "#2E5A64"),
  gray: /*   */ palette("#E3E3E4", "#D2D2D4", "#5B5B5E", "#3F3F42"),
  green: /*  */ palette("#DCEBE0", "#C8D9CE", "#5B7C63", "#35563C"),
  lime: /*   */ palette("#E7EDD6", "#D1DBA8", "#7B8744", "#5D6B2E"),
  orange: /* */ palette("#F2DDCC", "#E1C1A5", "#9B5A2C", "#7A3D1D"),
  pink: /*   */ palette("#EADAE3", "#D3BBC9", "#8B5872", "#65384F"),
  purple: /* */ palette("#E3DDEA", "#CEC5DB", "#6E5B86", "#4F3D64"),
  red: /*    */ palette("#E7CFCF", "#D9AEAE", "#a93a3a", "#6D1212"),
  teal: /*   */ palette("#D8E3E1", "#C7D6D4", "#587D77", "#145B4F"),
  yellow: /* */ palette("#FFF3C7", "#FFE58A", "#D6A100", "#A87F00"),
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
