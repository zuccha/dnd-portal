import { useCallback } from "react";
import z, { type ZodType } from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useFormatCp } from "~/measures/cost";
import { useFormatGrams } from "~/measures/weight";
import { useTranslateEquipmentRarity } from "~/models/types/equipment-rarity";
import { formatDetails } from "../../localized-resource";
import {
  createLocalizedModifierSchema,
  useLocalizeModifier,
} from "../localized-modifier";
import {
  type EquipmentModifier,
  equipmentModifierSchema,
} from "./equipment-modifier";

//------------------------------------------------------------------------------
// Localized Equipment Modifier
//------------------------------------------------------------------------------

export function createLocalizedEquipmentModifierSchema<
  R extends EquipmentModifier,
>(schema: ZodType<R>) {
  return createLocalizedModifierSchema(schema).extend({
    attunement_notes_delta: z.string(),
    cost_delta: z.string(),
    magic: z.string(),
    make_magic: z.boolean(),
    notes_delta: z.string(),
    rarity_minimum: z.string(),
    required_attunement_slots_minimum: z.string(),
    weight_delta: z.string(),
  });
}

export const localizedEquipmentModifierSchema =
  createLocalizedEquipmentModifierSchema(equipmentModifierSchema);

export type LocalizedEquipmentModifier = z.infer<
  typeof localizedEquipmentModifierSchema
>;

//------------------------------------------------------------------------------
// Use Localize Equipment Modifier
//------------------------------------------------------------------------------

export type LocalizedEquipmentModifierFor<R extends EquipmentModifier> = Omit<
  LocalizedEquipmentModifier,
  "_raw"
> & { _raw: R };

export function useLocalizeEquipmentModifier<
  R extends EquipmentModifier = EquipmentModifier,
>(): (equipmentModifier: R) => LocalizedEquipmentModifierFor<R> {
  const localizeModifier = useLocalizeModifier();
  const { lang, t, ti } = useI18nLangContext(i18nContext);
  const formatCost = useFormatCp();
  const formatWeight = useFormatGrams();
  const translateRarity = useTranslateEquipmentRarity(lang);

  return useCallback(
    (equipmentModifier: R): LocalizedEquipmentModifierFor<R> => {
      const appliesTo = translate(equipmentModifier.applies_to, lang);
      const attunementNotesDelta = translate(
        equipmentModifier.attunement_notes_delta,
        lang,
      );
      const notesDelta = translate(equipmentModifier.notes_delta, lang);
      const rarityMinimum =
        equipmentModifier.rarity_minimum ?
          translateRarity(equipmentModifier.rarity_minimum).label
        : "";
      const requiredAttunementSlotsMinimum =
        equipmentModifier.required_attunement_slots_minimum > 0 ?
          `${equipmentModifier.required_attunement_slots_minimum}`
        : "";

      return {
        ...localizeModifier(equipmentModifier),
        _raw: equipmentModifier,
        descriptor: appliesTo,
        details: formatDetails(notesDelta, attunementNotesDelta),

        attunement_notes_delta: attunementNotesDelta,
        cost_delta: formatCost(equipmentModifier.cost_delta),
        magic: equipmentModifier.make_magic ? t("magic") : "",
        make_magic: equipmentModifier.make_magic,
        notes_delta: notesDelta,
        rarity_minimum: rarityMinimum,
        required_attunement_slots_minimum:
          requiredAttunementSlotsMinimum ?
            ti("attunement_slots_minimum", requiredAttunementSlotsMinimum)
          : "",
        weight_delta: formatWeight(equipmentModifier.weight_delta),
      };
    },
    [formatCost, formatWeight, lang, localizeModifier, t, ti, translateRarity],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  attunement_slots_minimum: {
    en: "<1> attunement slots",
    it: "<1> slot sintonia",
  },
  magic: {
    en: "Magic",
    it: "Magico",
  },
};
