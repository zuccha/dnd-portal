import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import catalogue from "~/models/catalogue/catalogue";
import type { RelatedResourceEntries } from "~/models/catalogue/resource-relations";
import { formatChronicleDate } from "~/models/other/chronicle-date";
import type { Deity } from "~/models/resources/deities/deity";
import type { Faction } from "~/models/resources/factions/faction";
import type { Npc } from "~/models/resources/npcs/npc";
import type { Place } from "~/models/resources/places/place";
import type { Plane } from "~/models/resources/planes/plane";
import type { Relic } from "~/models/resources/relics/relic";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedFieldSchema,
  localizedResourceLinkSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type ChronicleEntry, chronicleEntrySchema } from "./chronicle-entry";
import type { Resource } from "../resource";

//------------------------------------------------------------------------------
// Localized Chronicle Entry Subject
//------------------------------------------------------------------------------

const localizedChronicleEntrySubjectSchema = localizedResourceLinkSchema(
  z.enum(["plane", "place", "faction", "npc", "deity", "relic"]),
);

//------------------------------------------------------------------------------
// Localized Chronicle Entry
//------------------------------------------------------------------------------

export const localizedChronicleEntrySchema = localizedResourceSchema(
  chronicleEntrySchema,
  z.literal("chronicle_entry"),
).extend({
  date: localizedFieldSchema,
  subjects: localizedFieldSchema.extend({
    resources: z.array(localizedChronicleEntrySubjectSchema),
  }),
});

export type LocalizedChronicleEntry = z.infer<typeof localizedChronicleEntrySchema>;

//------------------------------------------------------------------------------
// Chronicle Entry Localization Context
//------------------------------------------------------------------------------

type ChronicleEntryLocalizationContext = ResourceLocalizationContext & {
  subjects: LocalizedChronicleEntry["subjects"]["resources"];
};

const planeResources = catalogue.createResourceStore("plane");
const placeResources = catalogue.createResourceStore("place");
const factionResources = catalogue.createResourceStore("faction");
const deityResources = catalogue.createResourceStore("deity");
const npcResources = catalogue.createResourceStore("npc");
const relicResources = catalogue.createResourceStore("relic");
const usePlanes = planeResources.useResources as (resourceIds: string[]) => Plane[];
const usePlaces = placeResources.useResources as (resourceIds: string[]) => Place[];
const useFactions = factionResources.useResources as (resourceIds: string[]) => Faction[];
const useDeities = deityResources.useResources as (resourceIds: string[]) => Deity[];
const useNpcs = npcResources.useResources as (resourceIds: string[]) => Npc[];
const useRelics = relicResources.useResources as (resourceIds: string[]) => Relic[];

//------------------------------------------------------------------------------
// Use Chronicle Entry Localization Context
//------------------------------------------------------------------------------

export function useChronicleEntryLocalizationContext(
  _entry: ChronicleEntry,
  related: RelatedResourceEntries<"chronicle_entry">,
): ChronicleEntryLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const planeIds = related.subjects.filter(({ kind }) => kind === "plane").map(({ id }) => id);
  const placeIds = related.subjects.filter(({ kind }) => kind === "place").map(({ id }) => id);
  const factionIds = related.subjects.filter(({ kind }) => kind === "faction").map(({ id }) => id);
  const deityIds = related.subjects.filter(({ kind }) => kind === "deity").map(({ id }) => id);
  const npcIds = related.subjects.filter(({ kind }) => kind === "npc").map(({ id }) => id);
  const relicIds = related.subjects.filter(({ kind }) => kind === "relic").map(({ id }) => id);
  const planes = usePlanes(planeIds);
  const places = usePlaces(placeIds);
  const factions = useFactions(factionIds);
  const deities = useDeities(deityIds);
  const npcs = useNpcs(npcIds);
  const relics = useRelics(relicIds);
  const resourceByKey = useMemo<Record<string, Resource>>(
    () =>
      Object.fromEntries(
        [...planes, ...places, ...factions, ...npcs, ...deities, ...relics].map((resource) => [
          `${resource.kind}:${resource.id}`,
          resource,
        ]),
      ),
    [deities, factions, npcs, places, planes, relics],
  );
  const subjects = useMemo(
    () =>
      related.subjects
        .map(({ id, kind }) => {
          const resource = resourceByKey[`${kind}:${id}`];
          return resource ? { id, kind, name: translate(resource.name, context.lang) } : undefined;
        })
        .filter((resource): resource is NonNullable<typeof resource> => resource !== undefined),
    [context.lang, related.subjects, resourceByKey],
  );

  return useMemo(() => ({ ...context, subjects }), [context, subjects]);
}

//------------------------------------------------------------------------------
// Localize Chronicle Entry
//------------------------------------------------------------------------------

export function localizeChronicleEntry(
  entry: ChronicleEntry,
  context: ChronicleEntryLocalizationContext,
): LocalizedChronicleEntry {
  const date = formatChronicleDate(entry.date);
  const subjects = context.subjects;

  return {
    ...localizeResource(entry, context),
    date: { label: context.t("date"), value: date },
    description: translate(entry.description, context.lang),

    subjects: {
      label: context.t("subjects"),
      resources: subjects,
      value: subjects.map(({ name }) => name).join(", "),
    },
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  date: { en: "Date", it: "Data" },
  subjects: { en: "Related to", it: "Riguarda" },
};
