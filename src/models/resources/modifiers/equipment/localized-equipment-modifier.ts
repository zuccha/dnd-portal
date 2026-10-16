import { useMemo } from "react";
import z, { type ZodType } from "zod";
import { translate } from "~/i18n/i18n-string";
import { useFormatCp } from "~/measures/cost";
import { useFormatGrams } from "~/measures/weight";
import { equipmentReferenceStore } from "~/models/resources/equipment/equipment-reference-store";
import { useTranslateEquipmentRarity } from "~/models/types/equipment-rarity";
import {
  formatDetails,
  localizedFieldSchema,
  localizedResourceLinkSchema,
  useResourceLocalizationContext,
} from "../../localized-resource";
import {
  type ModifierLocalizationContext,
  localizeModifier,
  localizedModifierSchema,
} from "../localized-modifier";
import { type EquipmentModifier } from "./equipment-modifier";

const useLocalizedEquipmentEntries = equipmentReferenceStore.useLocalizedEquipmentEntries;

//------------------------------------------------------------------------------
// Localized Equipment Modifier
//------------------------------------------------------------------------------

export function localizedEquipmentModifierSchema<EM extends EquipmentModifier>(
  schema: ZodType<EM>,
  kindSchema: ZodType<EM["kind"]>,
) {
  return localizedModifierSchema(schema, kindSchema).extend({
    additionalCost: localizedFieldSchema.optional(),
    additionalWeight: localizedFieldSchema,
    attunement: localizedFieldSchema.optional(),
    attunementNotesDelta: z.string(),
    costDelta: z.string(),
    magic: z.string(),
    magicStatus: localizedFieldSchema,
    makeMagic: z.boolean(),
    minimumRarity: localizedFieldSchema.optional(),
    notesDelta: z.string(),
    rarityMinimum: z.string(),
    requiredAttunementSlotsMinimum: z.string(),
    supportedEquipment: localizedFieldSchema.extend({
      resources: z.array(localizedResourceLinkSchema(z.enum(["armor", "item", "tool", "weapon"]))),
    }),
    weightDelta: z.string(),
  });
}

export type LocalizedEquipmentModifier<EM extends EquipmentModifier> = z.infer<
  ReturnType<typeof localizedEquipmentModifierSchema<EM>>
>;

//------------------------------------------------------------------------------
// Equipment Modifier Localization Context
//------------------------------------------------------------------------------

export type EquipmentModifierLocalizationContext = ModifierLocalizationContext & {
  formatCost: ReturnType<typeof useFormatCp>;
  formatWeight: ReturnType<typeof useFormatGrams>;
  localizedEquipmentEntries: ReturnType<typeof useLocalizedEquipmentEntries>;
  translateRarity: ReturnType<typeof useTranslateEquipmentRarity>;
};

//------------------------------------------------------------------------------
// Use Equipment Modifier Localization Context
//------------------------------------------------------------------------------

export function useEquipmentModifierLocalizationContext(
  _equipmentModifier: EquipmentModifier,
): EquipmentModifierLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const formatCost = useFormatCp();
  const formatWeight = useFormatGrams();
  const localizedEquipmentEntries = useLocalizedEquipmentEntries(context.lang);
  const translateRarity = useTranslateEquipmentRarity(context.lang);

  return useMemo(
    () => ({ ...context, formatCost, formatWeight, localizedEquipmentEntries, translateRarity }),
    [context, formatCost, formatWeight, localizedEquipmentEntries, translateRarity],
  );
}

//------------------------------------------------------------------------------
// Localize Equipment Modifier
//------------------------------------------------------------------------------

export function localizeEquipmentModifier<EM extends EquipmentModifier>(
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
  const equipmentIds = new Set(equipmentModifier.equipment_ids);
  const supportedEquipmentResources = context.localizedEquipmentEntries
    .filter(({ id }) => equipmentIds.has(id))
    .sort((a, b) => a.name.localeCompare(b.name, context.lang));
  return {
    ...localizeModifier(equipmentModifier, context),
    _raw: equipmentModifier,
    descriptor: appliesTo,
    details: formatDetails(notesDelta, attunementNotesDelta),

    additionalCost:
      equipmentModifier.cost_delta !== 0
        ? {
            label: context.t("additional_cost"),
            value: context.formatCost(equipmentModifier.cost_delta),
          }
        : undefined,
    additionalWeight: {
      label: context.t("additional_weight"),
      value: context.formatWeight(equipmentModifier.weight_delta),
    },
    attunement: equipmentModifier.make_magic
      ? {
          label: context.t("attunement_label"),
          value:
            equipmentModifier.required_attunement_slots_minimum <= 0
              ? context.t("no")
              : equipmentModifier.required_attunement_slots_minimum === 1
                ? context.t("yes")
                : context.ti(
                    "attunement_slots",
                    `${equipmentModifier.required_attunement_slots_minimum}`,
                  ),
        }
      : undefined,
    attunementNotesDelta,
    costDelta: context.formatCost(equipmentModifier.cost_delta),
    magic: equipmentModifier.make_magic ? context.t("magic") : "",
    magicStatus: {
      label: context.t("magic"),
      value: context.t(equipmentModifier.make_magic ? "yes" : "no"),
    },
    makeMagic: equipmentModifier.make_magic,
    minimumRarity: equipmentModifier.make_magic
      ? {
          label: context.t("minimum_rarity"),
          value: rarityMinimum,
        }
      : undefined,
    notesDelta,
    rarityMinimum,
    requiredAttunementSlotsMinimum: requiredAttunementSlotsMinimum
      ? context.ti("attunement_slots_minimum", requiredAttunementSlotsMinimum)
      : "",
    supportedEquipment: {
      label: context.t("supported_equipment"),
      resources: supportedEquipmentResources,
      value: supportedEquipmentResources.map(({ name }) => name).join(", "),
    },
    weightDelta: context.formatWeight(equipmentModifier.weight_delta),
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  additional_cost: {
    en: "Additional Cost",
    it: "Costo Addizionale",
  },
  additional_weight: {
    en: "Additional Weight",
    it: "Peso Addizionale",
  },
  attunement_label: {
    en: "Attunement",
    it: "Sintonia",
  },
  attunement_slots: {
    en: "<1> slots",
    it: "<1> slot",
  },
  attunement_slots_minimum: {
    en: "<1> attunement slots",
    it: "<1> slot sintonia",
  },
  magic: {
    en: "Magic",
    it: "Magico",
  },
  minimum_attunement_slots: {
    en: "Minimum Attunement Slots",
    it: "Slot Minimi di Sintonia",
  },
  minimum_rarity: {
    en: "Minimum Rarity",
    it: "Rarità Min.",
  },
  no: {
    en: "No",
    it: "No",
  },
  supported_equipment: {
    en: "Supported Equipment",
    it: "Equipaggiamento Supportato",
  },
  yes: {
    en: "Yes",
    it: "Sì",
  },
};
