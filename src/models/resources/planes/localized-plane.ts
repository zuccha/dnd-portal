import { useCallback, useMemo } from "react";
import z from "zod";
import { useTranslateCreatureAlignment } from "../../types/creature-alignment";
import { useTranslatePlaneCategory } from "../../types/plane-category";
import {
  type ResourceLocalizationContext,
  formatInfo,
  localizeResource,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Plane, planeSchema } from "./plane";

//------------------------------------------------------------------------------
// Localized Plane
//------------------------------------------------------------------------------

export const localizedPlaneSchema = localizedResourceSchema(planeSchema, z.literal("plane")).extend(
  {
    alignments: z.string(),
    category: z.string(),
    info: z.string(),
  },
);

export type LocalizedPlane = z.infer<typeof localizedPlaneSchema>;

//------------------------------------------------------------------------------
// Plane Localization Context
//------------------------------------------------------------------------------

type PlaneLocalizationContext = ResourceLocalizationContext & {
  translateCreatureAlignment: (value: Plane["alignments"][number]) => string;
  translatePlaneCategory: (value: Plane["category"]) => string;
};

//------------------------------------------------------------------------------
// Use Plane Localization Context
//------------------------------------------------------------------------------

function usePlaneLocalizationContext(): PlaneLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const translateCreatureAlignment = useTranslateCreatureAlignment(context.lang);
  const translatePlaneCategory = useTranslatePlaneCategory(context.lang);

  return useMemo(
    () => ({ ...context, translateCreatureAlignment, translatePlaneCategory }),
    [context, translateCreatureAlignment, translatePlaneCategory],
  );
}

//------------------------------------------------------------------------------
// Localize Plane
//------------------------------------------------------------------------------

export function localizePlane(plane: Plane, context: PlaneLocalizationContext): LocalizedPlane {
  const alignments = plane.alignments.map(context.translateCreatureAlignment).join(", ");
  const category = context.translatePlaneCategory(plane.category);

  return {
    ...localizeResource(plane, context),
    descriptor: category,
    alignments,
    category,
    info: formatInfo([[context.tp("alignments", plane.alignments.length), alignments]]),
  };
}

//------------------------------------------------------------------------------
// Use Localize Plane
//------------------------------------------------------------------------------

export function useLocalizePlane(): (plane: Plane) => LocalizedPlane {
  const context = usePlaneLocalizationContext();
  return useCallback((plane) => localizePlane(plane, context), [context]);
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
