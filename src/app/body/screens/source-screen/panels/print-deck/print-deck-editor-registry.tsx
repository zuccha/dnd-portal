import {
  backgroundForm,
  backgroundFormDataToResource,
} from "~/models/resources/backgrounds/background-form";
import { backgroundStore } from "~/models/resources/backgrounds/background-store";
import {
  characterClassForm,
  characterClassFormDataToResource,
} from "~/models/resources/character-classes/character-class-form";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import {
  characterSubclassForm,
  characterSubclassFormDataToResource,
} from "~/models/resources/character-subclasses/character-subclass-form";
import { characterSubclassStore } from "~/models/resources/character-subclasses/character-subclass-store";
import {
  creatureTagForm,
  creatureTagFormDataToResource,
} from "~/models/resources/creature-tags/creature-tag-form";
import { creatureTagStore } from "~/models/resources/creature-tags/creature-tag-store";
import {
  creatureForm,
  creatureFormDataToResource,
} from "~/models/resources/creatures/creature-form";
import { creatureStore } from "~/models/resources/creatures/creature-store";
import {
  eldritchInvocationForm,
  eldritchInvocationFormDataToResource,
} from "~/models/resources/eldritch-invocations/eldritch-invocation-form";
import { eldritchInvocationStore } from "~/models/resources/eldritch-invocations/eldritch-invocation-store";
import { armorForm, armorFormDataToResource } from "~/models/resources/equipment/armors/armor-form";
import { armorStore } from "~/models/resources/equipment/armors/armor-store";
import { itemForm, itemFormDataToResource } from "~/models/resources/equipment/items/item-form";
import { itemStore } from "~/models/resources/equipment/items/item-store";
import { toolForm, toolFormDataToResource } from "~/models/resources/equipment/tools/tool-form";
import { toolStore } from "~/models/resources/equipment/tools/tool-store";
import {
  weaponForm,
  weaponFormDataToResource,
} from "~/models/resources/equipment/weapons/weapon-form";
import { weaponStore } from "~/models/resources/equipment/weapons/weapon-store";
import { featForm, featFormDataToResource } from "~/models/resources/feats/feat-form";
import { featStore } from "~/models/resources/feats/feat-store";
import { featureForm, featureFormDataToResource } from "~/models/resources/features/feature-form";
import { featureStore } from "~/models/resources/features/feature-store";
import {
  languageForm,
  languageFormDataToResource,
} from "~/models/resources/languages/language-form";
import { languageStore } from "~/models/resources/languages/language-store";
import {
  maneuverForm,
  maneuverFormDataToResource,
} from "~/models/resources/maneuvers/maneuver-form";
import { maneuverStore } from "~/models/resources/maneuvers/maneuver-store";
import {
  metamagicForm,
  metamagicFormDataToResource,
} from "~/models/resources/metamagics/metamagic-form";
import { metamagicStore } from "~/models/resources/metamagics/metamagic-store";
import {
  armorModifierForm,
  armorModifierFormDataToResource,
} from "~/models/resources/modifiers/equipment/armors/armor-modifier-form";
import { armorModifierStore } from "~/models/resources/modifiers/equipment/armors/armor-modifier-store";
import {
  itemModifierForm,
  itemModifierFormDataToResource,
} from "~/models/resources/modifiers/equipment/items/item-modifier-form";
import { itemModifierStore } from "~/models/resources/modifiers/equipment/items/item-modifier-store";
import {
  toolModifierForm,
  toolModifierFormDataToResource,
} from "~/models/resources/modifiers/equipment/tools/tool-modifier-form";
import { toolModifierStore } from "~/models/resources/modifiers/equipment/tools/tool-modifier-store";
import {
  weaponModifierForm,
  weaponModifierFormDataToResource,
} from "~/models/resources/modifiers/equipment/weapons/weapon-modifier-form";
import { weaponModifierStore } from "~/models/resources/modifiers/equipment/weapons/weapon-modifier-store";
import { planeForm, planeFormDataToResource } from "~/models/resources/planes/plane-form";
import { planeStore } from "~/models/resources/planes/plane-store";
import type { TranslationFields } from "~/models/resources/resource";
import type { LocalizedResourceUnion, ResourceUnion } from "~/models/resources/resource-union";
import { serviceForm, serviceFormDataToResource } from "~/models/resources/services/service-form";
import { serviceStore } from "~/models/resources/services/service-store";
import { speciesForm, speciesFormDataToResource } from "~/models/resources/species/species-form";
import { speciesStore } from "~/models/resources/species/species-store";
import { spellForm, spellFormDataToResource } from "~/models/resources/spells/spell-form";
import { spellStore } from "~/models/resources/spells/spell-store";
import { vehicleForm, vehicleFormDataToResource } from "~/models/resources/vehicles/vehicle-form";
import { vehicleStore } from "~/models/resources/vehicles/vehicle-store";
import type { Form } from "~/utils/form";
import { createBackgroundEditor } from "../resources/backgrounds/background-editor";
import { createCharacterClassEditor } from "../resources/character-classes/character-class-editor";
import { createCharacterSubclassEditor } from "../resources/character-subclasses/character-subclass-editor";
import { createCreatureTagEditor } from "../resources/creature-tag/creature-tag-editor";
import { createCreatureEditor } from "../resources/creatures/creature-editor";
import { createEldritchInvocationEditor } from "../resources/eldritch-invocations/eldritch-invocation-editor";
import { createArmorEditor } from "../resources/equipment/armors/armor-editor";
import { createItemEditor } from "../resources/equipment/items/item-editor";
import { createToolEditor } from "../resources/equipment/tools/tool-editor";
import { createWeaponEditor } from "../resources/equipment/weapons/weapon-editor";
import { createFeatEditor } from "../resources/feats/feat-editor";
import { createFeatureEditor } from "../resources/features/feature-editor";
import { createLanguageEditor } from "../resources/languages/language-editor";
import { createManeuverEditor } from "../resources/maneuvers/maneuver-editor";
import { createMetamagicEditor } from "../resources/metamagics/metamagic-editor";
import { createArmorModifierEditor } from "../resources/modifiers/equipment/armors/armor-modifier-editor";
import { createItemModifierEditor } from "../resources/modifiers/equipment/items/item-modifier-editor";
import { createToolModifierEditor } from "../resources/modifiers/equipment/tools/tool-modifier-editor";
import { createWeaponModifierEditor } from "../resources/modifiers/equipment/weapons/weapon-modifier-editor";
import { createPlaneEditor } from "../resources/planes/plane-editor";
import { createServiceEditor } from "../resources/services/service-editor";
import { createSpeciesEditor } from "../resources/species/species-editor";
import { createSpellEditor } from "../resources/spells/spell-editor";
import { createVehicleEditor } from "../resources/vehicles/vehicle-editor";
import type { PrintDeckResourceKind } from "./print-deck-registry";

//------------------------------------------------------------------------------
// Print Deck Editor Patch
//------------------------------------------------------------------------------

export type PrintDeckEditorPatch = Partial<ResourceUnion>;

//------------------------------------------------------------------------------
// Print Deck Editor Registry Entry
//------------------------------------------------------------------------------

export type PrintDeckEditorRegistryEntry = {
  Editor: React.FC<{ resource: unknown; sourceId: string }>;
  form: Form<Record<string, unknown>>;
  parseFormData: (
    data: Partial<Record<string, unknown>>,
    lang: string,
  ) => PrintDeckEditorPatch | string;
  translationFields: TranslationFields<ResourceUnion>[];
  localizeResource: (resource: unknown, context: unknown) => LocalizedResourceUnion;
  useLocalizationContext: (resource: unknown) => unknown;
};

export type PrintDeckEditorRegistry = Partial<
  Record<PrintDeckResourceKind, PrintDeckEditorRegistryEntry>
>;

//------------------------------------------------------------------------------
// Cast Entry
//------------------------------------------------------------------------------

function castEntry(entry: unknown): PrintDeckEditorRegistryEntry {
  return entry as PrintDeckEditorRegistryEntry;
}

//------------------------------------------------------------------------------
// Print Deck Editor Registry
//------------------------------------------------------------------------------

export const printDeckEditorRegistry = {
  armor: castEntry({
    Editor: createArmorEditor(armorForm),
    form: armorForm,
    parseFormData: armorFormDataToResource,
    translationFields: armorStore.translationFields,
    localizeResource: armorStore.localizeResource,
    useLocalizationContext: armorStore.useLocalizationContext,
  }),
  armor_modifier: castEntry({
    Editor: createArmorModifierEditor(armorModifierForm, armorStore),
    form: armorModifierForm,
    parseFormData: armorModifierFormDataToResource,
    translationFields: armorModifierStore.translationFields,
    localizeResource: armorModifierStore.localizeResource,
    useLocalizationContext: armorModifierStore.useLocalizationContext,
  }),
  background: castEntry({
    Editor: createBackgroundEditor(backgroundForm),
    form: backgroundForm,
    parseFormData: backgroundFormDataToResource,
    translationFields: backgroundStore.translationFields,
    localizeResource: backgroundStore.localizeResource,
    useLocalizationContext: backgroundStore.useLocalizationContext,
  }),
  character_class: castEntry({
    Editor: createCharacterClassEditor(characterClassForm),
    form: characterClassForm,
    parseFormData: characterClassFormDataToResource,
    translationFields: characterClassStore.translationFields,
    localizeResource: characterClassStore.localizeResource,
    useLocalizationContext: characterClassStore.useLocalizationContext,
  }),
  character_subclass: castEntry({
    Editor: createCharacterSubclassEditor(characterSubclassForm),
    form: characterSubclassForm,
    parseFormData: characterSubclassFormDataToResource,
    translationFields: characterSubclassStore.translationFields,
    localizeResource: characterSubclassStore.localizeResource,
    useLocalizationContext: characterSubclassStore.useLocalizationContext,
  }),
  creature: castEntry({
    Editor: createCreatureEditor(creatureForm),
    form: creatureForm,
    parseFormData: creatureFormDataToResource,
    translationFields: creatureStore.translationFields,
    localizeResource: creatureStore.localizeResource,
    useLocalizationContext: creatureStore.useLocalizationContext,
  }),
  creature_tag: castEntry({
    Editor: createCreatureTagEditor(creatureTagForm),
    form: creatureTagForm,
    parseFormData: creatureTagFormDataToResource,
    translationFields: creatureTagStore.translationFields,
    localizeResource: creatureTagStore.localizeResource,
    useLocalizationContext: creatureTagStore.useLocalizationContext,
  }),
  eldritch_invocation: castEntry({
    Editor: createEldritchInvocationEditor(eldritchInvocationForm),
    form: eldritchInvocationForm,
    parseFormData: eldritchInvocationFormDataToResource,
    translationFields: eldritchInvocationStore.translationFields,
    localizeResource: eldritchInvocationStore.localizeResource,
    useLocalizationContext: eldritchInvocationStore.useLocalizationContext,
  }),
  feat: castEntry({
    Editor: createFeatEditor(featForm),
    form: featForm,
    parseFormData: featFormDataToResource,
    translationFields: featStore.translationFields,
    localizeResource: featStore.localizeResource,
    useLocalizationContext: featStore.useLocalizationContext,
  }),
  feature: castEntry({
    Editor: createFeatureEditor(featureForm),
    form: featureForm,
    parseFormData: featureFormDataToResource,
    translationFields: featureStore.translationFields,
    localizeResource: featureStore.localizeResource,
    useLocalizationContext: featureStore.useLocalizationContext,
  }),
  item: castEntry({
    Editor: createItemEditor(itemForm),
    form: itemForm,
    parseFormData: itemFormDataToResource,
    translationFields: itemStore.translationFields,
    localizeResource: itemStore.localizeResource,
    useLocalizationContext: itemStore.useLocalizationContext,
  }),
  item_modifier: castEntry({
    Editor: createItemModifierEditor(itemModifierForm, itemStore),
    form: itemModifierForm,
    parseFormData: itemModifierFormDataToResource,
    translationFields: itemModifierStore.translationFields,
    localizeResource: itemModifierStore.localizeResource,
    useLocalizationContext: itemModifierStore.useLocalizationContext,
  }),
  language: castEntry({
    Editor: createLanguageEditor(languageForm),
    form: languageForm,
    parseFormData: languageFormDataToResource,
    translationFields: languageStore.translationFields,
    localizeResource: languageStore.localizeResource,
    useLocalizationContext: languageStore.useLocalizationContext,
  }),
  maneuver: castEntry({
    Editor: createManeuverEditor(maneuverForm),
    form: maneuverForm,
    parseFormData: maneuverFormDataToResource,
    translationFields: maneuverStore.translationFields,
    localizeResource: maneuverStore.localizeResource,
    useLocalizationContext: maneuverStore.useLocalizationContext,
  }),
  metamagic: castEntry({
    Editor: createMetamagicEditor(metamagicForm),
    form: metamagicForm,
    parseFormData: metamagicFormDataToResource,
    translationFields: metamagicStore.translationFields,
    localizeResource: metamagicStore.localizeResource,
    useLocalizationContext: metamagicStore.useLocalizationContext,
  }),
  plane: castEntry({
    Editor: createPlaneEditor(planeForm),
    form: planeForm,
    parseFormData: planeFormDataToResource,
    translationFields: planeStore.translationFields,
    localizeResource: planeStore.localizeResource,
    useLocalizationContext: planeStore.useLocalizationContext,
  }),
  service: castEntry({
    Editor: createServiceEditor(serviceForm),
    form: serviceForm,
    parseFormData: serviceFormDataToResource,
    translationFields: serviceStore.translationFields,
    localizeResource: serviceStore.localizeResource,
    useLocalizationContext: serviceStore.useLocalizationContext,
  }),
  species: castEntry({
    Editor: createSpeciesEditor(speciesForm),
    form: speciesForm,
    parseFormData: speciesFormDataToResource,
    translationFields: speciesStore.translationFields,
    localizeResource: speciesStore.localizeResource,
    useLocalizationContext: speciesStore.useLocalizationContext,
  }),
  spell: castEntry({
    Editor: createSpellEditor(spellForm),
    form: spellForm,
    parseFormData: spellFormDataToResource,
    translationFields: spellStore.translationFields,
    localizeResource: spellStore.localizeResource,
    useLocalizationContext: spellStore.useLocalizationContext,
  }),
  tool: castEntry({
    Editor: createToolEditor(toolForm),
    form: toolForm,
    parseFormData: toolFormDataToResource,
    translationFields: toolStore.translationFields,
    localizeResource: toolStore.localizeResource,
    useLocalizationContext: toolStore.useLocalizationContext,
  }),
  tool_modifier: castEntry({
    Editor: createToolModifierEditor(toolModifierForm, toolStore),
    form: toolModifierForm,
    parseFormData: toolModifierFormDataToResource,
    translationFields: toolModifierStore.translationFields,
    localizeResource: toolModifierStore.localizeResource,
    useLocalizationContext: toolModifierStore.useLocalizationContext,
  }),
  vehicle: castEntry({
    Editor: createVehicleEditor(vehicleForm),
    form: vehicleForm,
    parseFormData: vehicleFormDataToResource,
    translationFields: vehicleStore.translationFields,
    localizeResource: vehicleStore.localizeResource,
    useLocalizationContext: vehicleStore.useLocalizationContext,
  }),
  weapon: castEntry({
    Editor: createWeaponEditor(weaponForm),
    form: weaponForm,
    parseFormData: weaponFormDataToResource,
    translationFields: weaponStore.translationFields,
    localizeResource: weaponStore.localizeResource,
    useLocalizationContext: weaponStore.useLocalizationContext,
  }),
  weapon_modifier: castEntry({
    Editor: createWeaponModifierEditor(weaponModifierForm, weaponStore),
    form: weaponModifierForm,
    parseFormData: weaponModifierFormDataToResource,
    translationFields: weaponModifierStore.translationFields,
    localizeResource: weaponModifierStore.localizeResource,
    useLocalizationContext: weaponModifierStore.useLocalizationContext,
  }),
} satisfies PrintDeckEditorRegistry;

//------------------------------------------------------------------------------
// Get Print Deck Editor Registry Entry
//------------------------------------------------------------------------------

export function getPrintDeckEditorRegistryEntry(
  kind: PrintDeckResourceKind,
): PrintDeckEditorRegistryEntry | undefined {
  return printDeckEditorRegistry[kind];
}
