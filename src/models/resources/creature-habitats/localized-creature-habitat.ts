import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import catalogue from "~/models/catalogue/catalogue";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedFieldSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type CreatureHabitat, creatureHabitatSchema } from "./creature-habitat";
import type { RelatedResourceEntries } from "../../catalogue/resource-relations";

//------------------------------------------------------------------------------
// Localized Creature Habitat Family Link
//------------------------------------------------------------------------------

const localizedCreatureHabitatFamilyLinkSchema = z.object({
  id: z.uuid(),
  kind: z.literal("creature_family"),
  name: z.string(),
});

//------------------------------------------------------------------------------
// Localized Creature Habitat Family List Field
//------------------------------------------------------------------------------

const localizedCreatureHabitatFamilyListFieldSchema = localizedFieldSchema.extend({
  resources: z.array(localizedCreatureHabitatFamilyLinkSchema),
});

//------------------------------------------------------------------------------
// Localized Creature Habitat
//------------------------------------------------------------------------------

export const localizedCreatureHabitatSchema = localizedResourceSchema(
  creatureHabitatSchema,
  z.literal("creature_habitat"),
).extend({
  families: localizedCreatureHabitatFamilyListFieldSchema,
});

export type LocalizedCreatureHabitat = z.infer<typeof localizedCreatureHabitatSchema>;

//------------------------------------------------------------------------------
// Use Creature Habitat Localization Context
//------------------------------------------------------------------------------

type CreatureHabitatLocalizationContext = ResourceLocalizationContext & {
  families: LocalizedCreatureHabitat["families"]["resources"];
};

const creatureFamilyResources = catalogue.createResourceStore("creature_family");
const useCreatureFamilyResources = creatureFamilyResources.useResources;

//------------------------------------------------------------------------------
// Use Creature Habitat Localization Context
//------------------------------------------------------------------------------

export function useCreatureHabitatLocalizationContext(
  _habitat: CreatureHabitat,
  related: RelatedResourceEntries<"creature_habitat">,
): CreatureHabitatLocalizationContext {
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
// Localize Creature Habitat
//------------------------------------------------------------------------------

export function localizeCreatureHabitat(
  habitat: CreatureHabitat,
  context: CreatureHabitatLocalizationContext,
): LocalizedCreatureHabitat {
  const families = context.families;

  return {
    ...localizeResource(habitat, context),

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
