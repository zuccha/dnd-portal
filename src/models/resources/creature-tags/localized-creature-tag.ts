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
import { type CreatureTag, creatureTagSchema } from "./creature-tag";
import type { Creature } from "../creatures/creature";

//------------------------------------------------------------------------------
// Localized Creature Tag
//------------------------------------------------------------------------------

const localizedCreatureTagLinkSchema = localizedResourceLinkSchema(z.literal("creature"));

export const localizedCreatureTagSchema = localizedResourceSchema(
  creatureTagSchema,
  z.literal("creature_tag"),
).extend({
  creatures: localizedFieldSchema.extend({ resources: z.array(localizedCreatureTagLinkSchema) }),
});

//------------------------------------------------------------------------------
// Localized Creature Tag
//------------------------------------------------------------------------------

export type LocalizedCreatureTag = z.infer<typeof localizedCreatureTagSchema>;

//------------------------------------------------------------------------------
// Creature Tag Localization Context
//------------------------------------------------------------------------------

type CreatureTagLocalizationContext = ResourceLocalizationContext & {
  creatures: LocalizedCreatureTag["creatures"]["resources"];
};

const creatureResources = catalogue.createResourceStore("creature");
const useCreatureResourceIds = creatureResources.useActiveSourceReferenceResourceIds;
const useCreatureResources = creatureResources.useResources;

//------------------------------------------------------------------------------
// Use Creature Tag Localization Context
//------------------------------------------------------------------------------

export function useCreatureTagLocalizationContext(
  tag: CreatureTag,
): CreatureTagLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const creatureIds = useCreatureResourceIds();
  const creatures = (useCreatureResources(creatureIds) as Creature[]).filter(({ tag_ids }) =>
    tag_ids.includes(tag.id),
  );
  const localizedCreatures = useMemo(
    () =>
      creatures
        .map(({ id, name }) => ({
          id,
          kind: "creature" as const,
          name: translate(name, context.lang),
        }))
        .filter(({ name }) => name)
        .sort((a, b) => a.name.localeCompare(b.name, context.lang)),
    [context.lang, creatures],
  );

  return useMemo(
    () => ({ ...context, creatures: localizedCreatures }),
    [context, localizedCreatures],
  );
}

//------------------------------------------------------------------------------
// Localize Creature Tag
//------------------------------------------------------------------------------

export function localizeCreatureTag(
  creatureTag: CreatureTag,
  context: CreatureTagLocalizationContext,
): LocalizedCreatureTag {
  const creatures = context.creatures;

  return {
    ...localizeResource(creatureTag, context),

    creatures: {
      label: context.t("creatures"),
      resources: creatures,
      value: creatures.map(({ name }) => name).join(", "),
    },
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  creatures: { en: "Creatures", it: "Creature" },
};
