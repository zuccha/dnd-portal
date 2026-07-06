import z from "zod";
import { createLocalStore } from "~/store/local-store";
import { createMemoryStore } from "~/store/memory-store";

//------------------------------------------------------------------------------
// Print Quality
//------------------------------------------------------------------------------

const printQualitySchema = z.enum(["standard", "high_fidelity"]);

export type PrintQuality = z.infer<typeof printQualitySchema>;

export const printQualities = printQualitySchema.options;

//------------------------------------------------------------------------------
// Paper Type
//------------------------------------------------------------------------------

const paperTypeSchema = z.enum([
  "a3",
  "a4",
  "a5",
  "letter",
  "legal",
  "tabloid",
]);

export type PaperType = z.infer<typeof paperTypeSchema>;

export const paperTypes = paperTypeSchema.options;

//------------------------------------------------------------------------------
// Paper Layout
//------------------------------------------------------------------------------

const paperLayoutSchema = z.enum(["landscape", "portrait"]);

export type PaperLayout = z.infer<typeof paperLayoutSchema>;

export const paperLayouts = paperLayoutSchema.options;

//------------------------------------------------------------------------------
// Paper Sizes
//------------------------------------------------------------------------------

export const paperSizes: Record<PaperType, { height: number; width: number }> =
  {
    a3: { height: 16.54, width: 11.69 },
    a4: { height: 11.69, width: 8.27 },
    a5: { height: 8.27, width: 5.83 },
    legal: { height: 14, width: 8.5 },
    letter: { height: 11, width: 8.5 },
    tabloid: { height: 17, width: 11 },
  };

//------------------------------------------------------------------------------
// Print Deck Print Mode Stores
//------------------------------------------------------------------------------

export const useBackgroundColorVisible = createLocalStore(
  "print_deck_print_mode.background_color_visible",
  true,
  z.boolean().parse,
).use;

export const useHighFidelityPrintHelpDismissed = createLocalStore(
  "print_deck_print_mode.high_fidelity_print_help_dismissed",
  false,
  z.boolean().parse,
).use;

export const useBleedSize = createLocalStore(
  "print_deck_print_mode.bleed_size",
  { x: 0.05, y: 0.05 },
  z.object({ x: z.number(), y: z.number() }).parse,
).use;

export const useBleedVisible = createLocalStore(
  "print_deck_print_mode.bleed_visible",
  true,
  z.boolean().parse,
).use;

export const useCardCropMarksColor = createLocalStore(
  "print_deck_print_mode.card_crop_marks_color",
  "#00ff00",
  z.string().parse,
).use;

export const useCardCropMarksLength = createLocalStore(
  "print_deck_print_mode.card_crop_marks_length",
  0.15,
  z.number().parse,
).use;

export const useCardCropMarksVisible = createLocalStore(
  "print_deck_print_mode.card_crop_marks_visible",
  true,
  z.boolean().parse,
).use;

export const useIncludeEmptyBack = createLocalStore(
  "print_deck_print_mode.include_empty_back",
  false,
  z.boolean().parse,
).use;

export const usePageCropMarksColor = createLocalStore(
  "print_deck_print_mode.page_crop_marks_color",
  "#000000",
  z.string().parse,
).use;

export const usePageCropMarksLength = createLocalStore(
  "print_deck_print_mode.page_crop_marks_length",
  0.2,
  z.number().parse,
).use;

export const usePageCropMarksVisible = createLocalStore(
  "print_deck_print_mode.page_crop_marks_visible",
  true,
  z.boolean().parse,
).use;

export const usePaperType = createLocalStore(
  "print_deck_print_mode.paper_type",
  "a4",
  paperTypeSchema.parse,
).use;

export const usePaperLayout = createLocalStore(
  "print_deck_print_mode.paper_layout",
  "portrait",
  paperLayoutSchema.parse,
).use;

export const usePrintQuality = createLocalStore(
  "print_deck_print_mode.print_quality",
  "high_fidelity",
  printQualitySchema.parse,
).use;

export const useShowImage = createLocalStore(
  "print_deck_print_mode.show_image",
  true,
  z.boolean().parse,
).use;

export const useStandardPrintHelpDismissed = createLocalStore(
  "print_deck_print_mode.standard_print_help_dismissed",
  false,
  z.boolean().parse,
).use;

export const {
  set: setPrintDeckPrintModeActive,
  useValue: usePrintDeckPrintModeActive,
} = createMemoryStore("print_deck_print_mode.active", false);
