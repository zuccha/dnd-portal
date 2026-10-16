import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import catalogue from "~/models/catalogue/catalogue";
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
const armorResources = catalogue.createResourceStore("armor");
const itemResources = catalogue.createResourceStore("item");
const toolResources = catalogue.createResourceStore("tool");
const weaponResources = catalogue.createResourceStore("weapon");
const featResources = catalogue.createResourceStore("feat");
const speciesResources = catalogue.createResourceStore("species");

const useCharacterClassResources = characterClassResources.useResources;
const useCharacterSubclassResources = characterSubclassResources.useResources;
const useArmorResources = armorResources.useResources;
const useItemResources = itemResources.useResources;
const useToolResources = toolResources.useResources;
const useWeaponResources = weaponResources.useResources;
const useFeatResources = featResources.useResources;
const useSpeciesResources = speciesResources.useResources;

//------------------------------------------------------------------------------
// Localized Grantor Schemas
//------------------------------------------------------------------------------

const localizedFeatureGrantorSchema = localizedResourceLinkSchema(
  z.enum([
    "armor",
    "character_class",
    "character_subclass",
    "feat",
    "item",
    "species",
    "tool",
    "weapon",
  ]),
).extend({ level: z.string() });

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
  displayName: localizedFieldSchema,
  grantedBy: z.array(localizedFeatureGrantorGroupSchema),
  grantedByLabel: z.string(),
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
  const armors = useArmorResources(
    related.equipments.filter(({ kind }) => kind === "armor").map(({ id }) => id),
  ) as Resource[];
  const items = useItemResources(
    related.equipments.filter(({ kind }) => kind === "item").map(({ id }) => id),
  ) as Resource[];
  const tools = useToolResources(
    related.equipments.filter(({ kind }) => kind === "tool").map(({ id }) => id),
  ) as Resource[];
  const weapons = useWeaponResources(
    related.equipments.filter(({ kind }) => kind === "weapon").map(({ id }) => id),
  ) as Resource[];
  const feats = useFeatResources(related.feats.map(({ id }) => id)) as Resource[];
  const species = useSpeciesResources(related.species.map(({ id }) => id)) as Resource[];
  const namesById = useMemo(
    () =>
      new Map<string, string>(
        [...armors, ...items, ...tools, ...weapons].map(({ id, name }) => [
          id,
          translate(name, context.lang),
        ]),
      ),
    [armors, context.lang, items, tools, weapons],
  );

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
    {
      label: context.t("equipment"),
      values: related.equipments.flatMap((entry) => {
        const name = namesById.get(entry.id);
        return name ? [localizeFeatureGrantor(entry, name, context)] : [];
      }),
    },
    {
      label: context.t("feats"),
      values: related.feats.flatMap((entry) => {
        const resource = feats.find(({ id }) => id === entry.id);
        return resource
          ? [localizeFeatureGrantor(entry, translate(resource.name, context.lang), context)]
          : [];
      }),
    },
    {
      label: context.t("species"),
      values: related.species.flatMap((entry) => {
        const resource = species.find(({ id }) => id === entry.id);
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
    details: translate(feature.description, context.lang),

    displayName: {
      label: context.t("display_name"),
      value: translate(feature.display_name, context.lang),
    },
    grantedBy: context.grantedBy,
    grantedByLabel: context.t("granted_by"),
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
  equipment: {
    en: "Equipment",
    it: "Equipaggiamento",
  },
  feats: {
    en: "Feats",
    it: "Talenti",
  },
  granted_by: {
    en: "Granted By",
    it: "Concesso da",
  },
  level_with_value: {
    en: "(Level <1>)",
    it: "(Livello <1>)",
  },
  species: {
    en: "Species",
    it: "Specie",
  },
};
