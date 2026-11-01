import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import catalogue from "~/models/catalogue/catalogue";
import { resourceFeatureKindSchema } from "../../types/resource-feature-kind";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedFieldSchema,
  localizedResourceLinkSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Feature, featureSchema } from "./feature";
import type { RelatedResourceEntries } from "../../catalogue/resource-relations";
import type { Resource } from "../resource";

//------------------------------------------------------------------------------
// Grantor Catalogue Stores
//------------------------------------------------------------------------------

const characterClassResources = catalogue.createResourceStore("character_class");
const characterSubclassResources = catalogue.createResourceStore("character_subclass");

const useCharacterClassResources = characterClassResources.useResources;
const useCharacterSubclassResources = characterSubclassResources.useResources;

//------------------------------------------------------------------------------
// Localized Grantor Schemas
//------------------------------------------------------------------------------

const localizedFeatureGrantorSchema = localizedResourceLinkSchema(resourceFeatureKindSchema).extend(
  { level: z.string() },
);

const localizedFeatureGrantorGroupSchema = z.object({
  label: z.string(),
  values: z.array(localizedFeatureGrantorSchema),
});

//------------------------------------------------------------------------------
// Localized Feature
//------------------------------------------------------------------------------

export const localizedFeatureSchema = localizedResourceSchema(
  featureSchema,
  z.literal("feature"),
).extend({
  display_name: localizedFieldSchema,
  granted_by: z.array(localizedFeatureGrantorGroupSchema),
  granted_by_label: z.string(),
});

export type LocalizedFeature = z.infer<typeof localizedFeatureSchema>;

//------------------------------------------------------------------------------
// Feature Localization Context
//------------------------------------------------------------------------------

type FeatureLocalizationContext = ResourceLocalizationContext & {
  grantedBy: z.infer<typeof localizedFeatureGrantorGroupSchema>[];
};

//------------------------------------------------------------------------------
// Use Feature Localization Context
//------------------------------------------------------------------------------

export function useFeatureLocalizationContext(
  _feature: Feature,
  related: RelatedResourceEntries<"feature">,
): FeatureLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const characterClasses = useCharacterClassResources(
    related.character_classes.map(({ id }) => id),
  ) as Resource[];
  const characterSubclasses = useCharacterSubclassResources(
    related.character_subclasses.map(({ id }) => id),
  ) as Resource[];

  const grantedBy = [
    {
      label: context.t("character_classes"),
      values: related.character_classes.flatMap((entry) => {
        const resource = characterClasses.find(({ id }) => id === entry.id);
        return resource
          ? [localizeFeatureGrantor(entry, translate(resource.name, context.lang), context)]
          : [];
      }),
    },
    {
      label: context.t("character_subclasses"),
      values: related.character_subclasses.flatMap((entry) => {
        const resource = characterSubclasses.find(({ id }) => id === entry.id);
        return resource
          ? [localizeFeatureGrantor(entry, translate(resource.name, context.lang), context)]
          : [];
      }),
    },
  ]
    .map((group) => ({
      ...group,
      values: group.values.sort((a, b) => a.name.localeCompare(b.name, context.lang)),
    }))
    .filter(({ values }) => values.length > 0);

  return useMemo(() => ({ ...context, grantedBy }), [context, grantedBy]);
}

//------------------------------------------------------------------------------
// Localize Feature
//------------------------------------------------------------------------------

export function localizeFeature(
  feature: Feature,
  context: FeatureLocalizationContext,
): LocalizedFeature {
  return {
    ...localizeResource(feature, context),
    descriptor: context.t("descriptor"),
    description: translate(feature.description, context.lang),

    display_name: {
      label: context.t("display_name"),
      value: translate(feature.display_name, context.lang),
    },
    granted_by: context.grantedBy,
    granted_by_label: context.t("granted_by"),
  };
}

//------------------------------------------------------------------------------
// Localize Feature Grantor
//------------------------------------------------------------------------------

function localizeFeatureGrantor(
  entry: { id: string; kind: string; minimum_level: number },
  name: string,
  context: ResourceLocalizationContext,
) {
  return {
    id: entry.id,
    kind: entry.kind as z.infer<typeof localizedFeatureGrantorSchema>["kind"],
    level: entry.minimum_level ? context.ti("level_with_value", `${entry.minimum_level}`) : "",
    name,
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  character_classes: {
    en: "Classes",
    it: "Classi",
  },
  character_subclasses: {
    en: "Subclasses",
    it: "Sottoclassi",
  },
  descriptor: {
    en: "Feature",
    it: "Privilegio",
  },
  display_name: {
    en: "Display Name",
    it: "Nome Visualizzato",
  },
  granted_by: {
    en: "Granted By",
    it: "Concesso da",
  },
  level_with_value: {
    en: "(Level <1>)",
    it: "(Livello <1>)",
  },
};
