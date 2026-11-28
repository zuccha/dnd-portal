import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import catalogue from "~/models/catalogue/catalogue";
import type { RelatedResourceEntries } from "~/models/catalogue/resource-relations";
import { formatChronicleDate } from "~/models/other/chronicle-date";
import type { CharacterClass } from "~/models/resources/character-classes/character-class";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import { speciesStore } from "~/models/resources/species/species-store";
import type { PcStatus } from "~/models/types/pc-status";
import { useTranslatePcStatus } from "~/models/types/pc-status";
import { nilUuid } from "~/utils/uuid";
import { appendChronicleEntriesToDescription } from "../chronicle-entries/chronicle-entry-description";
import {
  type LocalizedResourceLink,
  type ResourceLocalizationContext,
  localizeResource,
  localizedFieldSchema,
  localizedResourceLinkSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Pc, pcSchema } from "./pc";
import type { ChronicleEntry } from "../chronicle-entries/chronicle-entry";

//------------------------------------------------------------------------------
// Localized PC Schema
//------------------------------------------------------------------------------

export const localizedPcSchema = localizedResourceSchema(pcSchema, z.literal("pc")).extend({
  classes: localizedFieldSchema.extend({
    resources: z.array(localizedResourceLinkSchema(z.literal("character_class"))),
  }),
  date_of_birth: localizedFieldSchema,
  date_of_death: localizedFieldSchema,
  level: localizedFieldSchema,
  species: localizedFieldSchema.extend({
    resource: localizedResourceLinkSchema(z.literal("species")).nullable(),
  }),
  status: localizedFieldSchema,
});

//------------------------------------------------------------------------------
// Localized PC Type
//------------------------------------------------------------------------------

export type LocalizedPc = z.infer<typeof localizedPcSchema>;

//------------------------------------------------------------------------------
// PC Localization Context
//------------------------------------------------------------------------------

type PcLocalizationContext = ResourceLocalizationContext & {
  characterClasses: CharacterClass[];
  chronicleEntries: ChronicleEntry[];
  speciesName: string;
  translatePcStatus: (status: PcStatus) => string;
};

const useCharacterClasses = characterClassStore.useResources as (
  resourceIds: string[],
) => CharacterClass[];
const chronicleEntryResources = catalogue.createResourceStore("chronicle_entry");
const useChronicleEntries = chronicleEntryResources.useResources as (
  resourceIds: string[],
) => ChronicleEntry[];
const useLocalizedSpeciesName = speciesStore.useLocalizedResourceName;

//------------------------------------------------------------------------------
// Use PC Localization Context
//------------------------------------------------------------------------------

export function usePcLocalizationContext(
  pc: Pc,
  related: RelatedResourceEntries<"pc">,
): PcLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const characterClasses = useCharacterClasses(pc.class_ids);
  const chronicleEntries = useChronicleEntries(related.chronicle_entries.map(({ id }) => id));
  const speciesName = useLocalizedSpeciesName(pc.species_id ?? nilUuid);
  const translatePcStatus = useTranslatePcStatus(context.lang);

  return useMemo(
    () => ({ ...context, characterClasses, chronicleEntries, speciesName, translatePcStatus }),
    [characterClasses, chronicleEntries, context, speciesName, translatePcStatus],
  );
}

//------------------------------------------------------------------------------
// Localize PC
//------------------------------------------------------------------------------

export function localizePc(pc: Pc, context: PcLocalizationContext): LocalizedPc {
  const classes = pc.class_ids.flatMap((id) => {
    const characterClass = context.characterClasses.find((entry) => entry.id === id);
    return characterClass
      ? [
          {
            id,
            kind: "character_class" as const,
            name: translate(characterClass.name, context.lang),
          },
        ]
      : [];
  });
  const speciesName = pc.species_id ? context.speciesName : "";
  const species: LocalizedResourceLink<"species"> | null = pc.species_id
    ? { id: pc.species_id, kind: "species", name: speciesName }
    : null;
  const status = context.translatePcStatus(pc.status);

  return {
    ...localizeResource(pc, context),
    description: appendChronicleEntriesToDescription(
      translate(pc.description, context.lang),
      context.chronicleEntries,
      context.lang,
    ),

    classes: {
      label: context.t("classes"),
      resources: classes,
      value: classes.map(({ name }) => name).join(", "),
    },
    date_of_birth: {
      label: context.t("date_of_birth"),
      value: pc.date_of_birth ? formatChronicleDate(pc.date_of_birth) : "",
    },
    date_of_death: {
      label: context.t("date_of_death"),
      value: pc.date_of_death ? formatChronicleDate(pc.date_of_death) : "",
    },
    level: {
      label: context.t("level"),
      value: String(pc.level),
    },
    species: {
      label: context.t("species"),
      resource: species,
      value: speciesName,
    },
    status: {
      label: context.t("status"),
      value: status,
    },
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  classes: { en: "Classes", it: "Classi" },
  date_of_birth: { en: "Date of Birth", it: "Data di nascita" },
  date_of_death: { en: "Date of Death", it: "Data di morte" },
  level: { en: "Level", it: "Livello" },
  species: { en: "Species", it: "Specie" },
  status: { en: "Status", it: "Stato" },
};
