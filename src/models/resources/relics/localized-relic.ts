import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import catalogue from "~/models/catalogue/catalogue";
import type { RelatedResourceEntries } from "~/models/catalogue/resource-relations";
import { useTranslateRelicType } from "../../types/relic-type";
import { appendChronicleEntriesToDescription } from "../chronicle-entries/chronicle-entry-description";
import { equipmentReferenceStore } from "../equipment/equipment-reference-store";
import {
  type LocalizedResourceLink,
  type ResourceLocalizationContext,
  localizeResource,
  localizedFieldSchema,
  localizedResourceLinkSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Relic, relicSchema } from "./relic";
import type { ChronicleEntry } from "../chronicle-entries/chronicle-entry";
import type { Equipment } from "../equipment/equipment";

//------------------------------------------------------------------------------
// Localized Relic Schema
//------------------------------------------------------------------------------

export const localizedRelicSchema = localizedResourceSchema(relicSchema, z.literal("relic")).extend(
  {
    equipment: localizedFieldSchema.extend({
      resource: localizedResourceLinkSchema(z.enum(["armor", "item", "tool", "weapon"])).nullable(),
    }),
    type: localizedFieldSchema,
  },
);

//------------------------------------------------------------------------------
// Localized Relic Type
//------------------------------------------------------------------------------

export type LocalizedRelic = z.infer<typeof localizedRelicSchema>;

//------------------------------------------------------------------------------
// Relic Localization Context
//------------------------------------------------------------------------------

type RelicLocalizationContext = ResourceLocalizationContext & {
  chronicleEntries: ChronicleEntry[];
  equipmentEntries: LocalizedResourceLink<Equipment["kind"]>[];
  translateRelicType: (value: Relic["type"]) => string;
};

const chronicleEntryResources = catalogue.createResourceStore("chronicle_entry");
const useChronicleEntries = chronicleEntryResources.useResources as (
  resourceIds: string[],
) => ChronicleEntry[];
const useLocalizedEquipmentEntries = equipmentReferenceStore.useLocalizedEquipmentEntries;

//------------------------------------------------------------------------------
// Use Relic Localization Context
//------------------------------------------------------------------------------

export function useRelicLocalizationContext(
  _relic: Relic,
  related: RelatedResourceEntries<"relic">,
): RelicLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const chronicleEntries = useChronicleEntries(related.chronicle_entries.map(({ id }) => id));
  const equipmentEntries = useLocalizedEquipmentEntries(context.lang);
  const translateRelicType = useTranslateRelicType(context.lang);

  return useMemo(
    () => ({ ...context, chronicleEntries, equipmentEntries, translateRelicType }),
    [chronicleEntries, context, equipmentEntries, translateRelicType],
  );
}

//------------------------------------------------------------------------------
// Localize Relic
//------------------------------------------------------------------------------

export function localizeRelic(relic: Relic, context: RelicLocalizationContext): LocalizedRelic {
  const equipment = context.equipmentEntries.find(({ id }) => id === relic.equipment_id) ?? null;
  const type = context.translateRelicType(relic.type);

  return {
    ...localizeResource(relic, context),
    description: appendChronicleEntriesToDescription(
      translate(relic.description, context.lang),
      context.chronicleEntries,
      context.lang,
    ),

    descriptor: type,
    equipment: {
      label: context.t("equipment"),
      resource: equipment,
      value: equipment?.name ?? "",
    },
    type: {
      label: context.t("type"),
      value: type,
    },
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  equipment: { en: "Equipment", it: "Equipaggiamento" },
  type: { en: "Type", it: "Tipo" },
};
