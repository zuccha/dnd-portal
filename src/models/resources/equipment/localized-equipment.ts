import { useMemo } from "react";
import z, { ZodType } from "zod";
import type { I18nLangContext } from "~/i18n/i18n-lang";
import { translate } from "~/i18n/i18n-string";
import { useFormatCp } from "~/measures/cost";
import { useFormatGrams } from "~/measures/weight";
import { useLocalizedFeatureEntries } from "../../other/feature-entries";
import { useTranslateEquipmentRarity } from "../../types/equipment-rarity";
import {
  type ResourceLocalizationContext,
  formatDetails,
  localizeResource,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Equipment } from "./equipment";

//------------------------------------------------------------------------------
// Localized Equipment
//------------------------------------------------------------------------------

export const localizedEquipmentSchema = <E extends Equipment>(
  equipmentSchema: ZodType<E>,
  kindSchema: ZodType<E["kind"]>,
) =>
  localizedResourceSchema(equipmentSchema, kindSchema).extend({
    cost: z.string(),
    magic: z.boolean(),
    magic_type: z.string(),
    rarity: z.string(),
    weight: z.string(),
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
  equipment: Equipment,
  context: I18nLangContext = i18nContext,
): EquipmentLocalizationContext {
  const mergedContext = useMemo(() => ({ ...i18nContext, ...context }), [context]);
  const resourceContext = useResourceLocalizationContext(mergedContext);
  const formatWeight = useFormatGrams();
  const formatCost = useFormatCp();
  const featureEntries = useLocalizedFeatureEntries(equipment.feature_entries);
  const translateRarity = useTranslateEquipmentRarity(resourceContext.lang);

  return useMemo(
    () => ({
      ...resourceContext,
      formatCost,
      featureEntries,
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
    equipment.magic && attunementSlots > 0
      ? attunementNotes
        ? context.tpi(
            "attunement.with_notes",
            attunementSlots,
            `${attunementSlots}`,
            attunementNotes,
          )
        : context.tpi("attunement", attunementSlots, `${attunementSlots}`)
      : "";
  const notes = translate(equipment.notes, context.lang);
  const features = context.featureEntries;

  return {
    ...localizeResource(equipment, context),
    details: formatDetails(attunement, notes, features),
    cost: equipment.cost === null ? "" : context.formatCost(equipment.cost),
    magic: equipment.magic,
    magic_type: equipment.magic
      ? equipment.rarity === "artifact"
        ? context.t("magic_type.magic.artifact")
        : context.ti("magic_type.magic", rarity)
      : context.t("magic_type.non_magic"),
    rarity,
    weight: equipment.weight === null ? "" : context.formatWeight(equipment.weight),
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "attunement.with_notes/*": {
    en: "_Requires attunement <2> (<1> slots)._",
    it: "_Richiede sintonia <2> (<1> slot)._",
  },
  "attunement.with_notes/1": {
    en: "_Requires attunement <2>._",
    it: "_Richiede sintonia <2>._",
  },
  "attunement/*": {
    en: "_Requires attunement (<1> slots)._",
    it: "_Richiede sintonia (<1> slot)._",
  },
  "attunement/1": {
    en: "_Requires attunement._",
    it: "_Richiede sintonia._",
  },
  "magic_type.magic": {
    en: "<1> Magic Item",
    it: "Oggetto Magico <1>",
  },
  "magic_type.magic.artifact": {
    en: "Magic Artifact",
    it: "Artefatto Magico",
  },
  "magic_type.non_magic": {
    en: "Nonmagic Item",
    it: "Oggetto Non Magico",
  },
};
