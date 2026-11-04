//------------------------------------------------------------------------------
// Raw Record
//------------------------------------------------------------------------------

type RawRecord = Record<string, unknown>;

//------------------------------------------------------------------------------
// Is Record
//------------------------------------------------------------------------------

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

//------------------------------------------------------------------------------
// Migrate Source Bundle Version 10
//------------------------------------------------------------------------------

export function migrateSourceBundleVersion10(bundle: RawRecord): RawRecord {
  const resources = bundle["resources"];

  if (isRecord(resources)) {
    for (const feat of Array.isArray(resources["feats"]) ? resources["feats"] : []) {
      if (!isRecord(feat)) continue;
      if (!("is_repeatable" in feat)) feat["is_repeatable"] = false;
    }

    for (const creature of Array.isArray(resources["creatures"]) ? resources["creatures"] : []) {
      if (!isRecord(creature)) continue;
      if (!("has_natural_armor" in creature)) creature["has_natural_armor"] = false;
      delete creature["passive_perception"];
    }
  }

  return { ...bundle, bundle_version: 11 };
}
