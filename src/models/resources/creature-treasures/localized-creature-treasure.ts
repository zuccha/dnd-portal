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
import { type CreatureTreasure, creatureTreasureSchema } from "./creature-treasure";
import type { RelatedResourceEntries } from "../../catalogue/resource-relations";

//------------------------------------------------------------------------------
// Localized Creature Treasure Family Link
//------------------------------------------------------------------------------

const localizedCreatureTreasureFamilyLinkSchema = localizedResourceLinkSchema(
  z.literal("creature_family"),
);

//------------------------------------------------------------------------------
// Localized Creature Treasure Family List Field
//------------------------------------------------------------------------------

const localizedCreatureTreasureFamilyListFieldSchema = localizedFieldSchema.extend({
  resources: z.array(localizedCreatureTreasureFamilyLinkSchema),
});

//------------------------------------------------------------------------------
// Localized Creature Treasure Schema
//------------------------------------------------------------------------------

export const localizedCreatureTreasureSchema = localizedResourceSchema(
  creatureTreasureSchema,
  z.literal("creature_treasure"),
).extend({
  families: localizedCreatureTreasureFamilyListFieldSchema,
});

//------------------------------------------------------------------------------
// Localized Creature Treasure
//------------------------------------------------------------------------------

export type LocalizedCreatureTreasure = z.infer<typeof localizedCreatureTreasureSchema>;

//------------------------------------------------------------------------------
// Creature Treasure Localization Context
//------------------------------------------------------------------------------

type CreatureTreasureLocalizationContext = ResourceLocalizationContext & {
  families: LocalizedCreatureTreasure["families"]["resources"];
};

const creatureFamilyResources = catalogue.createResourceStore("creature_family");
const useCreatureFamilyResources = creatureFamilyResources.useResources;

//------------------------------------------------------------------------------
// Use Creature Treasure Localization Context
//------------------------------------------------------------------------------

export function useCreatureTreasureLocalizationContext(
  _treasure: CreatureTreasure,
  related: RelatedResourceEntries<"creature_treasure">,
): CreatureTreasureLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const families = useCreatureFamilyResources(related.families.map(({ id }) => id));
  const localizedFamilies = useMemo(
    () =>
      families
        .map(({ id, name }) => ({
          id,
          kind: "creature_family" as const,
          name: translate(name, context.lang),
        }))
        .filter(({ name }) => name)
        .sort((a, b) => a.name.localeCompare(b.name, context.lang)),
    [context, families],
  );

  return useMemo(() => ({ ...context, families: localizedFamilies }), [context, localizedFamilies]);
}

//------------------------------------------------------------------------------
// Localize Creature Treasure
//------------------------------------------------------------------------------

export function localizeCreatureTreasure(
  treasure: CreatureTreasure,
  context: CreatureTreasureLocalizationContext,
): LocalizedCreatureTreasure {
  const families = context.families;

  return {
    ...localizeResource(treasure, context),

    families: {
      label: context.t("families"),
      resources: families,
      value: families.map(({ name }) => name).join(", "),
    },
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  families: { en: "Families", it: "Famiglie" },
};
