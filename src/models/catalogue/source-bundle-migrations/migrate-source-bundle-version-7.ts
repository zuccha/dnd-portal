import { createDeterministicUuid } from "~/utils/uuid";

type RawRecord = Record<string, unknown>;

const habitatNames: Record<string, { en: string; it: string }> = {
  any: { en: "Anywhere", it: "Ovunque" },
  arctic: { en: "Arctic", it: "Artico" },
  coastal: { en: "Coastal", it: "Costa" },
  desert: { en: "Desert", it: "Deserto" },
  forest: { en: "Forest", it: "Foresta" },
  grassland: { en: "Grassland", it: "Prateria" },
  hill: { en: "Hill", it: "Collina" },
  mountain: { en: "Mountain", it: "Montagna" },
  planar: { en: "Planar", it: "Planare" },
  swamp: { en: "Swamp", it: "Palude" },
  underdark: { en: "Underdark", it: "Sottosuolo" },
  underwater: { en: "Underwater", it: "Sott'Acqua" },
  urban: { en: "Urban", it: "Città" },
};

//------------------------------------------------------------------------------
// Is Record
//------------------------------------------------------------------------------

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

//------------------------------------------------------------------------------
// Migrate Source Bundle Version 7
//------------------------------------------------------------------------------

export function migrateSourceBundleVersion7(bundle: RawRecord): RawRecord {
  const resources = bundle["resources"];
  if (!isRecord(resources)) return bundle;

  const families = Array.isArray(resources["creature_families"])
    ? resources["creature_families"].filter(isRecord)
    : [];
  const habitats = new Map<string, RawRecord>();
  const habitatPositionById = new Map<string, number>();
  const relations: RawRecord[] = [];

  for (const family of families) {
    const habitatValues = Array.isArray(family["habitats"]) ? family["habitats"] : [];
    const seenInFamily = new Set<string>();

    for (const [position, value] of habitatValues.entries()) {
      if (typeof value !== "string" || seenInFamily.has(value)) continue;
      seenInFamily.add(value);

      const sourceId = typeof family["source_id"] === "string" ? family["source_id"] : "";
      const id = createDeterministicUuid([sourceId, "creature_habitat", value]);
      const names = habitatNames[value] ?? { en: value, it: value };
      const habitat =
        habitats.get(id) ??
        ({
          id,
          kind: "creature_habitat",
          source_code: family["source_code"],
          source_id: sourceId,
          source_version: family["source_version"],
          image_url: null,
          visibility: family["visibility"] ?? "public",
          name: names,
          page: null,
        } satisfies RawRecord);

      habitats.set(id, habitat);
      const familyId = family["id"];
      if (typeof familyId !== "string") continue;

      relations.push({
        resource_1_id: familyId,
        resource_1_kind: "creature_family",
        resource_1_position: position,
        resource_2_id: id,
        resource_2_kind: "creature_habitat",
        resource_2_position: habitatPositionById.get(id) ?? 0,
      });
      habitatPositionById.set(id, (habitatPositionById.get(id) ?? 0) + 1);
    }

    delete family["habitats"];
  }

  const currentHabitatResources = Array.isArray(resources["creature_habitats"])
    ? resources["creature_habitats"].filter(isRecord)
    : [];
  const currentHabitatIds = new Set(currentHabitatResources.map((habitat) => habitat["id"]));

  return {
    ...bundle,
    bundle_version: 8,
    relations: {
      ...(isRecord(bundle["relations"]) ? bundle["relations"] : {}),
      creature_families_and_creature_habitats: relations,
    },
    resources: {
      ...resources,
      creature_habitats: [
        ...currentHabitatResources,
        ...[...habitats.values()].filter((habitat) => !currentHabitatIds.has(habitat["id"])),
      ],
    },
  };
}
