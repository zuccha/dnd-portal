import { createDeterministicUuid } from "~/utils/uuid";

//------------------------------------------------------------------------------
// Raw Record
//------------------------------------------------------------------------------

type RawRecord = Record<string, unknown>;

const treasureNames: Record<string, { en: string; it: string }> = {
  any: { en: "Any", it: "Qualsiasi" },
  individual: { en: "Individual", it: "Individuale" },
  arcana: { en: "Arcana", it: "Arcano" },
  armaments: { en: "Armaments", it: "Armamenti" },
  implements: { en: "Implements", it: "Strumenti" },
  relics: { en: "Relics", it: "Reliquie" },
  none: { en: "None", it: "Nessuno" },
};

//------------------------------------------------------------------------------
// Is Record
//------------------------------------------------------------------------------

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

//------------------------------------------------------------------------------
// Migrate Source Bundle Version 8
//------------------------------------------------------------------------------

export function migrateSourceBundleVersion8(bundle: RawRecord): RawRecord {
  const resources = bundle["resources"];
  if (!isRecord(resources)) return bundle;

  const families = Array.isArray(resources["creature_families"])
    ? resources["creature_families"].filter(isRecord)
    : [];
  const treasures = new Map<string, RawRecord>();
  const treasurePositionById = new Map<string, number>();
  const relations: RawRecord[] = [];

  for (const family of families) {
    const treasureValues = Array.isArray(family["treasures"]) ? family["treasures"] : [];
    const seenInFamily = new Set<string>();

    for (const [position, value] of treasureValues.entries()) {
      if (typeof value !== "string" || seenInFamily.has(value)) continue;
      seenInFamily.add(value);

      const sourceId = typeof family["source_id"] === "string" ? family["source_id"] : "";
      const id = createDeterministicUuid([sourceId, "creature_treasure", value]);
      const name = treasureNames[value] ?? { en: value, it: value };
      const treasure =
        treasures.get(id) ??
        ({
          id,
          kind: "creature_treasure",
          source_code: family["source_code"],
          source_id: sourceId,
          source_version: family["source_version"],
          image_url: null,
          visibility: family["visibility"] ?? "public",
          name,
          page: null,
        } satisfies RawRecord);

      treasures.set(id, treasure);
      const familyId = family["id"];
      if (typeof familyId !== "string") continue;

      relations.push({
        resource_1_id: familyId,
        resource_1_kind: "creature_family",
        resource_1_position: position,
        resource_2_id: id,
        resource_2_kind: "creature_treasure",
        resource_2_position: treasurePositionById.get(id) ?? 0,
      });
      treasurePositionById.set(id, (treasurePositionById.get(id) ?? 0) + 1);
    }

    delete family["treasures"];
  }

  const currentTreasureResources = Array.isArray(resources["creature_treasures"])
    ? resources["creature_treasures"].filter(isRecord)
    : [];
  const currentTreasureIds = new Set(currentTreasureResources.map((treasure) => treasure["id"]));

  return {
    ...bundle,
    bundle_version: 9,
    relations: {
      ...(isRecord(bundle["relations"]) ? bundle["relations"] : {}),
      creature_families_and_creature_treasures: relations,
    },
    resources: {
      ...resources,
      creature_treasures: [
        ...currentTreasureResources,
        ...[...treasures.values()].filter((treasure) => !currentTreasureIds.has(treasure["id"])),
      ],
    },
  };
}
