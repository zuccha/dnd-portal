import { useMemo } from "react";
import z from "zod";
import catalogue from "~/models/catalogue/catalogue";
import type { RelatedResourceEntries } from "~/models/catalogue/resource-relations";
import { useTranslateCreatureAlignment } from "../../types/creature-alignment";
import { useTranslatePlaneCategory } from "../../types/plane-category";
import { appendChronicleEntriesToDescription } from "../chronicle-entries/chronicle-entry-description";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedFieldSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Plane, planeSchema } from "./plane";
import type { ChronicleEntry } from "../chronicle-entries/chronicle-entry";

//------------------------------------------------------------------------------
// Localized Plane
//------------------------------------------------------------------------------

export const localizedPlaneSchema = localizedResourceSchema(planeSchema, z.literal("plane")).extend(
  {
    alignments: localizedFieldSchema,
    category: localizedFieldSchema,
  },
);

export type LocalizedPlane = z.infer<typeof localizedPlaneSchema>;

//------------------------------------------------------------------------------
// Plane Localization Context
//------------------------------------------------------------------------------

type PlaneLocalizationContext = ResourceLocalizationContext & {
  chronicleEntries: ChronicleEntry[];
  translateCreatureAlignment: (value: Plane["alignments"][number]) => string;
  translatePlaneCategory: (value: Plane["category"]) => string;
};

const chronicleEntryResources = catalogue.createResourceStore("chronicle_entry");
const useChronicleEntries = chronicleEntryResources.useResources as (
  resourceIds: string[],
) => ChronicleEntry[];

//------------------------------------------------------------------------------
// Use Plane Localization Context
//------------------------------------------------------------------------------

export function usePlaneLocalizationContext(
  _plane: Plane,
  related: RelatedResourceEntries<"plane">,
): PlaneLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const chronicleEntries = useChronicleEntries(related.chronicle_entries.map(({ id }) => id));
  const translateCreatureAlignment = useTranslateCreatureAlignment(context.lang);
  const translatePlaneCategory = useTranslatePlaneCategory(context.lang);

  return useMemo(
    () => ({ ...context, chronicleEntries, translateCreatureAlignment, translatePlaneCategory }),
    [chronicleEntries, context, translateCreatureAlignment, translatePlaneCategory],
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
    description: appendChronicleEntriesToDescription("", context.chronicleEntries, context.lang),

    alignments: {
      label: context.tp("alignments", plane.alignments.length),
      value: alignments,
    },
    category: {
      label: context.t("category"),
      value: category,
    },
  };
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
  "category": {
    en: "Category",
    it: "Categoria",
  },
};
