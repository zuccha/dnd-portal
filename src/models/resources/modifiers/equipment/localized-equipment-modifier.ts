import { useCallback, useMemo } from "react";
import z, { type ZodType } from "zod";
import { translate } from "~/i18n/i18n-string";
import { useFormatCp } from "~/measures/cost";
import { useFormatGrams } from "~/measures/weight";
import { useTranslateEquipmentRarity } from "~/models/types/equipment-rarity";
import { formatDetails, useResourceLocalizationContext } from "../../localized-resource";
import {
  type ModifierLocalizationContext,
  localizeModifier,
  localizedModifierSchema,
} from "../localized-modifier";
import { type EquipmentModifier } from "./equipment-modifier";

//------------------------------------------------------------------------------
// Localized Equipment Modifier
//------------------------------------------------------------------------------

export function localizedEquipmentModifierSchema<EM extends EquipmentModifier>(
  schema: ZodType<EM>,
  kindSchema: ZodType<EM["kind"]>,
) {
  return localizedModifierSchema(schema, kindSchema).extend({
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

export type LocalizedEquipmentModifier<EM extends EquipmentModifier> = z.infer<
  ReturnType<typeof localizedEquipmentModifierSchema<EM>>
>;

//------------------------------------------------------------------------------
// Equipment Modifier Localization Context
//------------------------------------------------------------------------------

type EquipmentModifierLocalizationContext = ModifierLocalizationContext & {
  formatCost: ReturnType<typeof useFormatCp>;
  formatWeight: ReturnType<typeof useFormatGrams>;
  translateRarity: ReturnType<typeof useTranslateEquipmentRarity>;
};

//------------------------------------------------------------------------------
// Use Equipment Modifier Localization Context
//------------------------------------------------------------------------------

function useEquipmentModifierLocalizationContext(): EquipmentModifierLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const formatCost = useFormatCp();
  const formatWeight = useFormatGrams();
  const translateRarity = useTranslateEquipmentRarity(context.lang);

  return useMemo(
    () => ({ ...context, formatCost, formatWeight, translateRarity }),
    [context, formatCost, formatWeight, translateRarity],
  );
}

//------------------------------------------------------------------------------
// Localize Equipment Modifier
//------------------------------------------------------------------------------

function localizeEquipmentModifier<EM extends EquipmentModifier>(
  equipmentModifier: EM,
  context: EquipmentModifierLocalizationContext,
): LocalizedEquipmentModifier<EM> {
  const appliesTo = translate(equipmentModifier.applies_to, context.lang);
  const attunementNotesDelta = translate(equipmentModifier.attunement_notes_delta, context.lang);
  const notesDelta = translate(equipmentModifier.notes_delta, context.lang);
  const rarityMinimum = equipmentModifier.rarity_minimum
    ? context.translateRarity(equipmentModifier.rarity_minimum)
    : "";
  const requiredAttunementSlotsMinimum =
    equipmentModifier.required_attunement_slots_minimum > 0
      ? `${equipmentModifier.required_attunement_slots_minimum}`
      : "";

  return {
    ...localizeModifier(equipmentModifier, context),
    _raw: equipmentModifier,
    descriptor: appliesTo,
    details: formatDetails(notesDelta, attunementNotesDelta),

    attunement_notes_delta: attunementNotesDelta,
    cost_delta: context.formatCost(equipmentModifier.cost_delta),
    magic: equipmentModifier.make_magic ? context.t("magic") : "",
    make_magic: equipmentModifier.make_magic,
    notes_delta: notesDelta,
    rarity_minimum: rarityMinimum,
    required_attunement_slots_minimum: requiredAttunementSlotsMinimum
      ? context.ti("attunement_slots_minimum", requiredAttunementSlotsMinimum)
      : "",
    weight_delta: context.formatWeight(equipmentModifier.weight_delta),
  };
}

//------------------------------------------------------------------------------
// Use Localize Equipment Modifier
//------------------------------------------------------------------------------

export function useLocalizeEquipmentModifier<EM extends EquipmentModifier>(): (
  equipmentModifier: EM,
) => LocalizedEquipmentModifier<EM> {
  const context = useEquipmentModifierLocalizationContext();
  return useCallback(
    (equipmentModifier) => localizeEquipmentModifier(equipmentModifier, context),
    [context],
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
