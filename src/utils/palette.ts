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
  "azure",
  "black",
  "blue",
  "brick",
  "brown",
  "chocolate",
  "copper",
  "coral",
  "cyan",
  "gold",
  "gray",
  "green",
  "khaki",
  "lilac",
  "lime",
  "mauve",
  "navy",
  "olive",
  "orange",
  "pink",
  "purple",
  "red",
  "rose",
  "salmon",
  "slate",
  "teal",
  "tomato",
  "turquoise",
  "yellow",
]);

export type PaletteName = z.infer<typeof paletteNameSchema>;

export const paletteNames = paletteNameSchema.options;

//------------------------------------------------------------------------------
// Palettes
//------------------------------------------------------------------------------

export const palettes: Record<PaletteName, Palette> = {
  azure: /*     */ palette("#E6F7FF", "#BFEAFF", "#0097D6", "#006A97"),
  black: /*     */ palette("#F0F0F0", "#DADADA", "#1F1F1F", "#111111"),
  blue: /*      */ palette("#E6F0FF", "#C9DCFF", "#2566D4", "#1A4592"),
  brick: /*     */ palette("#F2E0DC", "#E4C2BA", "#A52A2A", "#7A1E1E"),
  brown: /*     */ palette("#EFE2D9", "#D8C0AF", "#6B3B23", "#4A2918"),
  chocolate: /* */ palette("#F3E0D3", "#E5C1A6", "#D2691E", "#9C4D16"),
  copper: /*    */ palette("#EFE2D9", "#D8C0AF", "#A0522D", "#7A3D22"),
  coral: /*     */ palette("#FFE5DA", "#FFC6B1", "#E56A3C", "#B84E2A"),
  cyan: /*      */ palette("#E0F4F4", "#B9E2E2", "#008B8B", "#006464"),
  gold: /*      */ palette("#F7EED4", "#EFD9A6", "#B8860B", "#8B6A08"),
  gray: /*      */ palette("#F1F1F1", "#D9D9D9", "#808080", "#5A5A5A"),
  green: /*     */ palette("#E2F1E2", "#C3E0C3", "#228B22", "#176417"),
  khaki: /*     */ palette("#F2EFD9", "#E1D9B0", "#A39B53", "#7A733E"),
  lilac: /*     */ palette("#F2E3E6", "#E3C7CE", "#B06A7A", "#874F5B"),
  lime: /*      */ palette("#E6F5E6", "#C8EAC8", "#2FA62F", "#227622"),
  mauve: /*    */ palette("#F1E6F7", "#DCC5EC", "#7F5A9A", "#5A3F70"),
  navy: /*      */ palette("#E6ECF5", "#C8D6EB", "#1B3B7A", "#122754"),
  olive: /*     */ palette("#F1EFD8", "#DDD7A8", "#808000", "#5E5E00"),
  orange: /*    */ palette("#FFE6DB", "#FFC7B1", "#D43A00", "#9E2A00"),
  pink: /*      */ palette("#FFE6F1", "#FFC7E0", "#D81B82", "#A1145F"),
  purple: /*    */ palette("#F1E6F7", "#DCC5EC", "#9A45B1", "#733282"),
  red: /*       */ palette("#F7DEE1", "#F0B7BE", "#DC143C", "#A60F2E"),
  rose: /*      */ palette("#EAD8DB", "#D2B6BE", "#8E4E5C", "#6C3842"),
  salmon: /*    */ palette("#FFE4DC", "#FFC5B7", "#E06F62", "#B5544A"),
  slate: /*     */ palette("#E9EDF1", "#CBD4DD", "#667586", "#4C5663"),
  teal: /*      */ palette("#E0F4F4", "#B9E2E2", "#00777A", "#00595B"),
  tomato: /*    */ palette("#FFE2DA", "#FFC1B2", "#E04F35", "#B33C28"),
  turquoise: /* */ palette("#DFF6F7", "#B6E9EB", "#00A9AC", "#007D80"),
  yellow: /*    */ palette("#FFEFD6", "#FFD9A8", "#D48600", "#A06400"),
};

//------------------------------------------------------------------------------
// Use Palette Name Options
//------------------------------------------------------------------------------

export function usePaletteNameOptions() {
  const { t } = useI18nLangContext(i18nContext);

  return useMemo(() => {
    return paletteNames
      .map((paletteName) => ({ label: t(paletteName), value: paletteName }))
      .sort(compareObjects("label"));
  }, [t]);
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  azure: {
    en: "Azure",
    it: "Azzurro",
  },
  black: {
    en: "Black",
    it: "Nero",
  },
  blue: {
    en: "Blue",
    it: "Blu",
  },
  brick: {
    en: "Brick",
    it: "Mattone",
  },
  brown: {
    en: "Brown",
    it: "Marrone",
  },
  chocolate: {
    en: "Chocolate",
    it: "Cioccolato",
  },
  copper: {
    en: "Copper",
    it: "Rame",
  },
  coral: {
    en: "Coral",
    it: "Corallo",
  },
  cyan: {
    en: "Cyan",
    it: "Ciano",
  },
  gold: {
    en: "Gold",
    it: "Oro",
  },
  gray: {
    en: "Gray",
    it: "Grigio",
  },
  green: {
    en: "Green",
    it: "Verde",
  },
  khaki: {
    en: "Khaki",
    it: "Cachi",
  },
  lilac: {
    en: "Lilac",
    it: "Lillà",
  },
  lime: {
    en: "Lime",
    it: "Lime",
  },
  mauve: {
    en: "Mauve",
    it: "Malva",
  },
  navy: {
    en: "Navy",
    it: "Blue Scuro",
  },
  olive: {
    en: "Olive",
    it: "Oliva",
  },
  orange: {
    en: "Orange",
    it: "Arancione",
  },
  pink: {
    en: "Pink",
    it: "Porpora",
  },
  purple: {
    en: "Purple",
    it: "Viola",
  },
  red: {
    en: "Red",
    it: "Rosso",
  },
  rose: {
    en: "Rose",
    it: "Rosa",
  },
  salmon: {
    en: "Salmon",
    it: "Salmone",
  },
  slate: {
    en: "Slate",
    it: "Ardesia",
  },
  teal: {
    en: "Teal",
    it: "Petrolio",
  },
  tomato: {
    en: "Tomato",
    it: "Pomodoro",
  },
  turquoise: {
    en: "Turquoise",
    it: "Turchese",
  },
  yellow: {
    en: "Yellow",
    it: "Giallo",
  },
};
