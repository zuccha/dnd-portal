import { useMemo } from "react";
import z, { ZodType } from "zod";
import type { I18nLangContext } from "~/i18n/i18n-lang";
import { translate } from "~/i18n/i18n-string";
import { useFormatCp } from "~/measures/cost";
import { useFormatGrams } from "~/measures/weight";
import { italic } from "~/ui/rich-text-page";
import { useLocalizedFeatureEntries } from "../../other/feature-entries";
import { useTranslateEquipmentRarity } from "../../types/equipment-rarity";
import {
  type ResourceLocalizationContext,
  formatDescription,
  localizedFieldSchema,
  localizeResource,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Equipment } from "./equipment";
import type { RelatedResourceEntries } from "../../catalogue/resource-relations";

//------------------------------------------------------------------------------
// Localized Equipment
//------------------------------------------------------------------------------

export const localizedEquipmentSchema = <E extends Equipment>(
  equipmentSchema: ZodType<E>,
  kindSchema: ZodType<E["kind"]>,
) =>
  localizedResourceSchema(equipmentSchema, kindSchema).extend({
    attunement: localizedFieldSchema,
    cost: localizedFieldSchema,
    is_magic: z.boolean(),
    magic_status: localizedFieldSchema,
    rarity: localizedFieldSchema,
    weight: localizedFieldSchema,
  });

export type LocalizedEquipment<E extends Equipment> = z.infer<
  ReturnType<typeof localizedEquipmentSchema<E>>
>;

//------------------------------------------------------------------------------
// Equipment Localization Context
//------------------------------------------------------------------------------

export type EquipmentLocalizationContext = ResourceLocalizationContext & {
  formatCost: ReturnType<typeof useFormatCp>;
  featureEntries: string;
  formatWeight: ReturnType<typeof useFormatGrams>;
  translateRarity: (value: Equipment["rarity"]) => string;
};

//------------------------------------------------------------------------------
// Use Equipment Localization Context
//------------------------------------------------------------------------------

export function useEquipmentLocalizationContext(
  _equipment: Equipment,
  related: RelatedResourceEntries<Equipment["kind"]>,
  context: I18nLangContext = i18nContext,
): EquipmentLocalizationContext {
  const mergedContext = useMemo(() => ({ ...i18nContext, ...context }), [context]);
  const resourceContext = useResourceLocalizationContext(mergedContext);
  const formatWeight = useFormatGrams();
  const formatCost = useFormatCp();
  const featureEntries = useLocalizedFeatureEntries(related.features, true);
  const translateRarity = useTranslateEquipmentRarity(resourceContext.lang);

  return useMemo(
    () => ({
      ...resourceContext,
      featureEntries,
      formatCost,
      formatWeight,
      translateRarity,
    }),
    [featureEntries, formatCost, formatWeight, resourceContext, translateRarity],
  );
}

//------------------------------------------------------------------------------
// Localize Equipment
//------------------------------------------------------------------------------

export function localizeEquipment<E extends Equipment>(
  equipment: E,
  context: EquipmentLocalizationContext,
): LocalizedEquipment<E> {
  const rarity = context.translateRarity(equipment.rarity);
  const attunementNotes = translate(equipment.attunement_notes, context.lang);
  const attunementSlots = equipment.required_attunement_slots;
  const attunement =
    equipment.is_magic && attunementSlots > 0
      ? attunementNotes
        ? context.tpi(
            "attunement.with_notes",
            attunementSlots,
            `${attunementSlots}`,
            attunementNotes,
          )
        : context.tpi("attunement", attunementSlots, `${attunementSlots}`)
      : "";
  const notes = translate(equipment.description, context.lang);
  const features = context.featureEntries;
  const cost = equipment.cost === null ? "" : context.formatCost(equipment.cost);
  const attunementValue =
    attunementSlots <= 0
      ? context.t("no")
      : attunementSlots === 1
        ? context.t("yes")
        : context.ti("attunement.slots", `${attunementSlots}`);
  const weight = equipment.weight === null ? "" : context.formatWeight(equipment.weight);

  return {
    ...localizeResource(equipment, context),
    description: formatDescription(attunement, notes, features),

    attunement: {
      label: context.t("attunement.label"),
      value: attunementValue,
    },
    cost: {
      label: context.t("cost"),
      value: cost,
    },
    is_magic: equipment.is_magic,
    magic_status: {
      label: context.t("magic"),
      value: context.t(equipment.is_magic ? "yes" : "no"),
    },
    rarity: {
      label: context.t("rarity"),
      value: rarity,
    },
    weight: {
      label: context.t("weight"),
      value: weight,
    },
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "attunement.label": { en: "Attunement", it: "Sintonia" },
  "attunement.slots": { en: "<1> slots", it: "<1> slot" },
  "attunement.with_notes/*": {
    en: italic("Requires attunement <2> (<1> slots)."),
    it: italic("Richiede sintonia <2> (<1> slot)."),
  },
  "attunement.with_notes/1": {
    en: italic("Requires attunement <2>."),
    it: italic("Richiede sintonia <2>."),
  },
  "attunement/*": {
    en: italic("Requires attunement (<1> slots)."),
    it: italic("Richiede sintonia (<1> slot)."),
  },
  "attunement/1": {
    en: italic("Requires attunement."),
    it: italic("Richiede sintonia."),
  },
  "cost": { en: "Cost", it: "Costo" },
  "magic": { en: "Magical", it: "Magico" },
  "no": { en: "No", it: "No" },
  "rarity": { en: "Rarity", it: "Rarità" },
  "weight": { en: "Weight", it: "Peso" },
  "yes": { en: "Yes", it: "Sì" },
};
