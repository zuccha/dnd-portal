import { useMemo } from "react";
import z from "zod";
import { creatureHabitatStore } from "../creature-habitats/creature-habitat-store";
import { creatureTreasureStore } from "../creature-treasures/creature-treasure-store";
import { creatureStore } from "../creatures/creature-store";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedFieldSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { planeStore } from "../planes/plane-store";
import { type CreatureFamily, creatureFamilySchema } from "./creature-family";
import type { RelatedResourceEntries } from "../../catalogue/resource-relations";

//------------------------------------------------------------------------------
// Localized Creature Family Link
//------------------------------------------------------------------------------

const localizedCreatureFamilyLinkSchema = z.object({
  id: z.uuid(),
  kind: z.enum(["creature", "creature_habitat", "creature_treasure", "plane"]),
  name: z.string(),
});

//------------------------------------------------------------------------------
// Localized Creature Family List Field
//------------------------------------------------------------------------------

const localizedCreatureFamilyListFieldSchema = localizedFieldSchema.extend({
  resources: z.array(localizedCreatureFamilyLinkSchema),
});

//------------------------------------------------------------------------------
// Localized Creature Family
//------------------------------------------------------------------------------

export const localizedCreatureFamilySchema = localizedResourceSchema(
  creatureFamilySchema,
  z.literal("creature_family"),
).extend({
  creatures: localizedCreatureFamilyListFieldSchema,
  habitats: localizedCreatureFamilyListFieldSchema,
  planes: localizedCreatureFamilyListFieldSchema,
  treasures: localizedCreatureFamilyListFieldSchema,
});

//------------------------------------------------------------------------------
// Localized Creature Family
//------------------------------------------------------------------------------

export type LocalizedCreatureFamily = z.infer<typeof localizedCreatureFamilySchema>;

//------------------------------------------------------------------------------
// Creature Family Localization Context
//------------------------------------------------------------------------------

type CreatureFamilyLocalizationContext = ResourceLocalizationContext & {
  creatureNames: string[];
  creatureResources: ReturnType<typeof creatureStore.useResources>;
  habitatNames: string[];
  planeNames: string[];
  related: RelatedResourceEntries<"creature_family">;
  treasureNames: string[];
};

const useCreatureResourceIds = creatureStore.useResourceIds;
const useCreatureResources = creatureStore.useResources;
const useLocalizedCreatureNames = creatureStore.useLocalizedResourceNames;
const useLocalizedHabitatNames = creatureHabitatStore.useLocalizedResourceNames;
const useLocalizedPlaneNames = planeStore.useLocalizedResourceNames;
const useLocalizedTreasureNames = creatureTreasureStore.useLocalizedResourceNames;

//------------------------------------------------------------------------------
// Use Creature Family Localization Context
//------------------------------------------------------------------------------

export function useCreatureFamilyLocalizationContext(
  family: CreatureFamily,
  related: RelatedResourceEntries<"creature_family">,
): CreatureFamilyLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const creatureIds = useCreatureResourceIds(family.source_id);
  const creatureResources = useCreatureResources(creatureIds).filter(
    (creature) => creature.family_id === family.id,
  );
  const creatureNames = useLocalizedCreatureNames(creatureResources.map(({ id }) => id));
  const habitatNames = useLocalizedHabitatNames(related.habitats.map(({ id }) => id));
  const planeNames = useLocalizedPlaneNames(family.plane_ids);
  const treasureNames = useLocalizedTreasureNames(related.treasures.map(({ id }) => id));

  return useMemo(
    () => ({
      ...context,
      creatureNames,
      creatureResources,
      habitatNames,
      planeNames,
      related,
      treasureNames,
    }),
    [context, creatureNames, creatureResources, habitatNames, planeNames, related, treasureNames],
  );
}

//------------------------------------------------------------------------------
// Localize Creature Family
//------------------------------------------------------------------------------

export function localizeCreatureFamily(
  family: CreatureFamily,
  context: CreatureFamilyLocalizationContext,
): LocalizedCreatureFamily {
  const createField = (
    label: string,
    entries: {
      id: string;
      kind: "creature" | "creature_habitat" | "creature_treasure" | "plane";
    }[],
    names: string[],
  ) => {
    const resources = entries
      .flatMap(({ id, kind }, index) => {
        const name = names[index];
        return name ? [{ id, kind, name }] : [];
      })
      .sort((a, b) => a.name.localeCompare(b.name, context.lang));

    return {
      label,
      resources,
      value: resources.map(({ name }) => name).join(", "),
    };
  };

  const creatures = context.creatureResources.map(({ id }, index) => ({
    id,
    kind: "creature" as const,
    name: context.creatureNames[index] ?? "",
  }));
  const planes = family.plane_ids.map((id, index) => ({
    id,
    kind: "plane" as const,
    name: context.planeNames[index] ?? "",
  }));

  return {
    ...localizeResource(family, context),

    creatures: createField(
      context.tp("creatures", creatures.length),
      creatures,
      creatures.map(({ name }) => name),
    ),
    habitats: createField(
      context.tp("habitats", context.related.habitats.length),
      context.related.habitats,
      context.habitatNames,
    ),
    planes: createField(
      context.tp("planes", family.plane_ids.length),
      planes,
      planes.map(({ name }) => name),
    ),
    treasures: createField(
      context.tp("treasures", context.related.treasures.length),
      context.related.treasures,
      context.treasureNames,
    ),
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "creatures/*": { en: "Creatures", it: "Creature" },
  "creatures/1": { en: "Creature", it: "Creatura" },
  "habitats/*": { en: "Habitats", it: "Habitat" },
  "habitats/1": { en: "Habitat", it: "Habitat" },
  "planes/*": { en: "Planes", it: "Piani" },
  "planes/1": { en: "Plane", it: "Piano" },
  "treasures/*": { en: "Treasures", it: "Tesori" },
  "treasures/1": { en: "Treasure", it: "Tesoro" },
};
