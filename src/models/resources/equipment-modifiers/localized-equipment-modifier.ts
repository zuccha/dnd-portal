import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useFormatCp } from "~/measures/cost";
import { useFormatGrams } from "~/measures/weight";
import { useTranslateEquipmentRarity } from "~/models/types/equipment-rarity";
import {
  formatDetails,
  localizedResourceSchema,
  useLocalizeResource,
} from "../localized-resource";
import {
  type EquipmentModifier,
  equipmentModifierSchema,
} from "./equipment-modifier";

//------------------------------------------------------------------------------
// Localized Equipment Modifier
//------------------------------------------------------------------------------

export const localizedEquipmentModifierSchema = localizedResourceSchema(
  equipmentModifierSchema,
).extend({
  applies_to: z.string(),
  attunement_notes_delta: z.string(),
  composite_name: z.string(),
  cost_delta: z.string(),
  magic: z.string(),
  make_magic: z.boolean(),
  notes_delta: z.string(),
  rarity_minimum: z.string(),
  required_attunement_slots_minimum: z.string(),
  weight_delta: z.string(),
});

export type LocalizedEquipmentModifier = z.infer<
  typeof localizedEquipmentModifierSchema
>;

//------------------------------------------------------------------------------
// Use Localize Equipment Modifier
//------------------------------------------------------------------------------

export function useLocalizeEquipmentModifier(): (
  equipmentModifier: EquipmentModifier,
) => LocalizedEquipmentModifier {
  const localizeResource = useLocalizeResource<EquipmentModifier>();
  const { lang, t, ti } = useI18nLangContext(i18nContext);
  const formatCost = useFormatCp();
  const formatWeight = useFormatGrams();
  const translateRarity = useTranslateEquipmentRarity(lang);

  return useCallback(
    (equipmentModifier: EquipmentModifier): LocalizedEquipmentModifier => {
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
        ...localizeResource(equipmentModifier),
        descriptor: appliesTo,
        details: formatDetails(notesDelta, attunementNotesDelta),

        applies_to: appliesTo,
        attunement_notes_delta: attunementNotesDelta,
        composite_name: translate(equipmentModifier.composite_name, lang),
        cost_delta: formatSigned(equipmentModifier.cost_delta, formatCost),
        magic: equipmentModifier.make_magic ? t("magic") : "",
        make_magic: equipmentModifier.make_magic,
        notes_delta: notesDelta,
        rarity_minimum: rarityMinimum,
        required_attunement_slots_minimum:
          requiredAttunementSlotsMinimum ?
            ti("attunement_slots_minimum", requiredAttunementSlotsMinimum)
          : "",
        weight_delta: formatSigned(
          equipmentModifier.weight_delta,
          formatWeight,
        ),
      };
    },
    [formatCost, formatWeight, lang, localizeResource, t, ti, translateRarity],
  );
}

//------------------------------------------------------------------------------
// Format Signed
//------------------------------------------------------------------------------

function formatSigned(
  value: number,
  formatter: (absoluteValue: number) => string,
): string {
  if (value === 0) return "";

  const sign = value > 0 ? "+" : "-";
  return `${sign}${formatter(Math.abs(value))}`;
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
