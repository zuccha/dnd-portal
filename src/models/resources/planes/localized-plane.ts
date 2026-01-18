import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useTranslateCreatureAlignment } from "../../types/creature-alignment";
import { useTranslatePlaneCategory } from "../../types/plane-category";
import {
  formatInfo,
  localizedResourceSchema,
  useLocalizeResource,
} from "../localized-resource";
import { type Plane, planeSchema } from "./plane";

//------------------------------------------------------------------------------
// Localized Plane
//------------------------------------------------------------------------------

export const localizedPlaneSchema = localizedResourceSchema(planeSchema).extend(
  {
    alignments: z.string(),
    category: z.string(),
    info: z.string(),
  },
);

export type LocalizedPlane = z.infer<typeof localizedPlaneSchema>;

//------------------------------------------------------------------------------
// Use Localized Plane
//------------------------------------------------------------------------------

export function useLocalizePlane(): (plane: Plane) => LocalizedPlane {
  const localizeResource = useLocalizeResource<Plane>();
  const { lang, tp } = useI18nLangContext(i18nContext);

  const translateCreatureAlignment = useTranslateCreatureAlignment(lang);
  const translatePlaneCategory = useTranslatePlaneCategory(lang);

  return useCallback(
    (plane: Plane): LocalizedPlane => {
      const alignments = plane.alignments
        .map(translateCreatureAlignment)
        .map(({ label }) => label)
        .join(", ");
      const category = translatePlaneCategory(plane.category).label;

      return {
        ...localizeResource(plane),
        descriptor: category,

        alignments,
        category,
        info: formatInfo([
          [tp("alignments", plane.alignments.length), alignments],
        ]),
      };
    },
    [localizeResource, tp, translateCreatureAlignment, translatePlaneCategory],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "alignments/*": {
    en: "Alignments",
    it: "Allineamenti",
  },
  "alignments/1": {
    en: "Alignment",
    it: "Allineamento",
  },
};
