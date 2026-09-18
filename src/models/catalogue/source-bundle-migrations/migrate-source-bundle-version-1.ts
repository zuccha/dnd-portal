type RawRecord = Record<string, any>;

//------------------------------------------------------------------------------
// Is Record
//------------------------------------------------------------------------------

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

//------------------------------------------------------------------------------
// Migrate Starting Equipment Entries
//------------------------------------------------------------------------------

function migrateStartingEquipmentEntries(entries: RawRecord[]): unknown[][] {
  const groups: RawRecord[][] = [];

  for (const entry of entries) {
    const groupIndex = Number(entry["choice_group"] ?? 0);
    const optionIndex = Number(entry["choice_option"] ?? 0);
    const group = (groups[groupIndex] ??= []);
    const bundle = (group[optionIndex] ??= { currency: 0, equipments: [] });
    const equipmentId = entry["equipment_id"];

    if (equipmentId) {
      const equipment = bundle["equipments"].find((item: RawRecord) => item["id"] === equipmentId);
      if (equipment) equipment["quantity"] += entry["quantity"];
      else {
        bundle["equipments"].push({
          id: equipmentId,
          notes: entry["notes"] ?? {},
          quantity: entry["quantity"],
        });
      }
    } else {
      bundle["currency"] += entry["quantity"];
    }
  }

  return groups.map((group) => group.filter(Boolean));
}

//------------------------------------------------------------------------------
// Migrate Starting Equipment
//------------------------------------------------------------------------------

function migrateStartingEquipment(resource: RawRecord): void {
  const entries = resource["starting_equipment_entries"];
  if (Array.isArray(entries)) {
    resource["starting_equipment"] = migrateStartingEquipmentEntries(entries);
    delete resource["starting_equipment_entries"];
    return;
  }

  const startingEquipment = resource["starting_equipment"];
  if (!Array.isArray(startingEquipment)) {
    resource["starting_equipment"] = [];
    return;
  }

  resource["starting_equipment"] = startingEquipment.map((group) => {
    if (Array.isArray(group)) return group;
    if (!isRecord(group) || !Array.isArray(group["options"])) return [];
    return group["options"].map((option) =>
      isRecord(option) && isRecord(option["bundle"]) ? option["bundle"] : option,
    );
  });
}

//------------------------------------------------------------------------------
// Migrate Source Bundle Version 1
//------------------------------------------------------------------------------

export function migrateSourceBundleVersion1(bundle: RawRecord): RawRecord {
  const resources = bundle["resources"];
  if (!isRecord(resources)) return bundle;

  for (const kind of ["backgrounds", "character_classes"]) {
    const resourcesByKind = resources[kind];
    if (Array.isArray(resourcesByKind)) {
      resourcesByKind.forEach((resource) => {
        if (isRecord(resource)) migrateStartingEquipment(resource);
      });
    }
  }

  return bundle;
}
