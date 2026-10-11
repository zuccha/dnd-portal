type RawRecord = Record<string, unknown>;

//------------------------------------------------------------------------------
// Is Record
//------------------------------------------------------------------------------

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

//------------------------------------------------------------------------------
// Migrate Summoner Language Mode
//------------------------------------------------------------------------------

function migrateSummonerLanguageMode(resource: RawRecord): void {
  const languagesSpokenBySummoner = resource["languages_spoken_by_summoner"];

  if (typeof languagesSpokenBySummoner === "boolean") {
    resource["summoner_language_mode"] = languagesSpokenBySummoner ? "understands" : "none";
  }

  delete resource["languages_spoken_by_summoner"];
}

//------------------------------------------------------------------------------
// Migrate Source Bundle Version 3
//------------------------------------------------------------------------------

export function migrateSourceBundleVersion3(bundle: RawRecord): RawRecord {
  const resources = bundle["resources"];
  if (!isRecord(resources)) return bundle;

  const creatures = resources["creatures"];
  if (!Array.isArray(creatures)) return bundle;

  for (const creature of creatures) {
    if (isRecord(creature)) migrateSummonerLanguageMode(creature);
  }

  return bundle;
}
