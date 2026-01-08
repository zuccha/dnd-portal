import { useCallback } from "react";
import z from "zod";
import { useI18nLang } from "~/i18n/i18n-lang";
import { useTranslateCreatureAlignment } from "../../types/creature-alignment";
import { useTranslatePlaneCategory } from "../../types/plane-category";
import {
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
  },
);

export type LocalizedPlane = z.infer<typeof localizedPlaneSchema>;

//------------------------------------------------------------------------------
// Use Localized Plane
//------------------------------------------------------------------------------

export function useLocalizePlane(): (plane: Plane) => LocalizedPlane {
  const localizeResource = useLocalizeResource<Plane>();
  const [lang] = useI18nLang();

  const translateCreatureAlignment = useTranslateCreatureAlignment(lang);
  const translatePlaneCategory = useTranslatePlaneCategory(lang);

  return useCallback(
    (plane: Plane): LocalizedPlane => {
      return {
        ...localizeResource(plane),
        alignments: plane.alignments
          .map(translateCreatureAlignment)
          .map(({ label }) => label)
          .join(", "),
        category: translatePlaneCategory(plane.category).label,
      };
    },
    [localizeResource, translateCreatureAlignment, translatePlaneCategory],
  );
}
