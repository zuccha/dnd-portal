import {
  backgroundForm,
  backgroundFormDataToDB,
} from "~/models/resources/backgrounds/background-form";
import { backgroundStore } from "~/models/resources/backgrounds/background-store";
import {
  characterClassForm,
  characterClassFormDataToDB,
} from "~/models/resources/character-classes/character-class-form";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import {
  characterSubclassForm,
  characterSubclassFormDataToDB,
} from "~/models/resources/character-subclasses/character-subclass-form";
import { characterSubclassStore } from "~/models/resources/character-subclasses/character-subclass-store";
import {
  creatureTagForm,
  creatureTagFormDataToDB,
} from "~/models/resources/creature-tags/creature-tag-form";
import { creatureTagStore } from "~/models/resources/creature-tags/creature-tag-store";
import {
  creatureForm,
  creatureFormDataToDB,
} from "~/models/resources/creatures/creature-form";
import { creatureStore } from "~/models/resources/creatures/creature-store";
import {
  eldritchInvocationForm,
  eldritchInvocationFormDataToDB,
} from "~/models/resources/eldritch-invocations/eldritch-invocation-form";
import { eldritchInvocationStore } from "~/models/resources/eldritch-invocations/eldritch-invocation-store";
import {
  armorForm,
  armorFormDataToDB,
} from "~/models/resources/equipment/armors/armor-form";
import { armorStore } from "~/models/resources/equipment/armors/armor-store";
import {
  itemForm,
  itemFormDataToDB,
} from "~/models/resources/equipment/items/item-form";
import { itemStore } from "~/models/resources/equipment/items/item-store";
import {
  toolForm,
  toolFormDataToDB,
} from "~/models/resources/equipment/tools/tool-form";
import { toolStore } from "~/models/resources/equipment/tools/tool-store";
import {
  weaponForm,
  weaponFormDataToDB,
} from "~/models/resources/equipment/weapons/weapon-form";
import { weaponStore } from "~/models/resources/equipment/weapons/weapon-store";
import { featForm, featFormDataToDB } from "~/models/resources/feats/feat-form";
import { featStore } from "~/models/resources/feats/feat-store";
import {
  featureForm,
  featureFormDataToDB,
} from "~/models/resources/features/feature-form";
import { featureStore } from "~/models/resources/features/feature-store";
import {
  languageForm,
  languageFormDataToDB,
} from "~/models/resources/languages/language-form";
import { languageStore } from "~/models/resources/languages/language-store";
import {
  maneuverForm,
  maneuverFormDataToDB,
} from "~/models/resources/maneuvers/maneuver-form";
import { maneuverStore } from "~/models/resources/maneuvers/maneuver-store";
import {
  metamagicForm,
  metamagicFormDataToDB,
} from "~/models/resources/metamagics/metamagic-form";
import { metamagicStore } from "~/models/resources/metamagics/metamagic-store";
import {
  armorModifierForm,
  armorModifierFormDataToDB,
} from "~/models/resources/modifiers/equipment/armors/armor-modifier-form";
import { armorModifierStore } from "~/models/resources/modifiers/equipment/armors/armor-modifier-store";
import {
  itemModifierForm,
  itemModifierFormDataToDB,
} from "~/models/resources/modifiers/equipment/items/item-modifier-form";
import { itemModifierStore } from "~/models/resources/modifiers/equipment/items/item-modifier-store";
import {
  toolModifierForm,
  toolModifierFormDataToDB,
} from "~/models/resources/modifiers/equipment/tools/tool-modifier-form";
import { toolModifierStore } from "~/models/resources/modifiers/equipment/tools/tool-modifier-store";
import {
  weaponModifierForm,
  weaponModifierFormDataToDB,
} from "~/models/resources/modifiers/equipment/weapons/weapon-modifier-form";
import { weaponModifierStore } from "~/models/resources/modifiers/equipment/weapons/weapon-modifier-store";
import {
  planeForm,
  planeFormDataToDB,
} from "~/models/resources/planes/plane-form";
import { planeStore } from "~/models/resources/planes/plane-store";
import type { LocalizedResourceUnion } from "~/models/resources/resource-union";
import {
  serviceForm,
  serviceFormDataToDB,
} from "~/models/resources/services/service-form";
import { serviceStore } from "~/models/resources/services/service-store";
import {
  speciesForm,
  speciesFormDataToDB,
} from "~/models/resources/species/species-form";
import { speciesStore } from "~/models/resources/species/species-store";
import {
  spellForm,
  spellFormDataToDB,
} from "~/models/resources/spells/spell-form";
import { spellStore } from "~/models/resources/spells/spell-store";
import {
  vehicleForm,
  vehicleFormDataToDB,
} from "~/models/resources/vehicles/vehicle-form";
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
import { createServiceEditor } from "../resources/equipment/services/service-editor";
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
import { createSpeciesEditor } from "../resources/species/species-editor";
import { createSpellEditor } from "../resources/spells/spell-editor";
import { createVehicleEditor } from "../resources/vehicles/vehicle-editor";
import type { PrintDeckResourceKind } from "./print-deck-registry";

//------------------------------------------------------------------------------
// Print Deck Editor Patch
//------------------------------------------------------------------------------

export type PrintDeckEditorPatch = {
  resource: Record<string, unknown>;
  translation: Record<string, unknown>;
};

//------------------------------------------------------------------------------
// Print Deck Editor Registry Entry
//------------------------------------------------------------------------------

export type PrintDeckEditorRegistryEntry = {
  Editor: React.FC<{ resource: unknown; sourceId: string }>;
  form: Form<Record<string, unknown>>;
  parseFormData: (
    data: Partial<Record<string, unknown>>,
  ) => PrintDeckEditorPatch | string;
  useLocalizeResource: (
    sourceId: string,
  ) => (resource: unknown) => LocalizedResourceUnion;
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
    parseFormData: armorFormDataToDB,
    useLocalizeResource: armorStore.useLocalizeResource,
  }),
  armor_modifier: castEntry({
    Editor: createArmorModifierEditor(armorModifierForm, armorStore),
    form: armorModifierForm,
    parseFormData: armorModifierFormDataToDB,
    useLocalizeResource: armorModifierStore.useLocalizeResource,
  }),
  background: castEntry({
    Editor: createBackgroundEditor(backgroundForm),
    form: backgroundForm,
    parseFormData: backgroundFormDataToDB,
    useLocalizeResource: backgroundStore.useLocalizeResource,
  }),
  character_class: castEntry({
    Editor: createCharacterClassEditor(characterClassForm),
    form: characterClassForm,
    parseFormData: characterClassFormDataToDB,
    useLocalizeResource: characterClassStore.useLocalizeResource,
  }),
  character_subclass: castEntry({
    Editor: createCharacterSubclassEditor(characterSubclassForm),
    form: characterSubclassForm,
    parseFormData: characterSubclassFormDataToDB,
    useLocalizeResource: characterSubclassStore.useLocalizeResource,
  }),
  creature: castEntry({
    Editor: createCreatureEditor(creatureForm),
    form: creatureForm,
    parseFormData: creatureFormDataToDB,
    useLocalizeResource: creatureStore.useLocalizeResource,
  }),
  creature_tag: castEntry({
    Editor: createCreatureTagEditor(creatureTagForm),
    form: creatureTagForm,
    parseFormData: creatureTagFormDataToDB,
    useLocalizeResource: creatureTagStore.useLocalizeResource,
  }),
  eldritch_invocation: castEntry({
    Editor: createEldritchInvocationEditor(eldritchInvocationForm),
    form: eldritchInvocationForm,
    parseFormData: eldritchInvocationFormDataToDB,
    useLocalizeResource: eldritchInvocationStore.useLocalizeResource,
  }),
  feat: castEntry({
    Editor: createFeatEditor(featForm),
    form: featForm,
    parseFormData: featFormDataToDB,
    useLocalizeResource: featStore.useLocalizeResource,
  }),
  feature: castEntry({
    Editor: createFeatureEditor(featureForm),
    form: featureForm,
    parseFormData: featureFormDataToDB,
    useLocalizeResource: featureStore.useLocalizeResource,
  }),
  item: castEntry({
    Editor: createItemEditor(itemForm),
    form: itemForm,
    parseFormData: itemFormDataToDB,
    useLocalizeResource: itemStore.useLocalizeResource,
  }),
  item_modifier: castEntry({
    Editor: createItemModifierEditor(itemModifierForm, itemStore),
    form: itemModifierForm,
    parseFormData: itemModifierFormDataToDB,
    useLocalizeResource: itemModifierStore.useLocalizeResource,
  }),
  language: castEntry({
    Editor: createLanguageEditor(languageForm),
    form: languageForm,
    parseFormData: languageFormDataToDB,
    useLocalizeResource: languageStore.useLocalizeResource,
  }),
  maneuver: castEntry({
    Editor: createManeuverEditor(maneuverForm),
    form: maneuverForm,
    parseFormData: maneuverFormDataToDB,
    useLocalizeResource: maneuverStore.useLocalizeResource,
  }),
  metamagic: castEntry({
    Editor: createMetamagicEditor(metamagicForm),
    form: metamagicForm,
    parseFormData: metamagicFormDataToDB,
    useLocalizeResource: metamagicStore.useLocalizeResource,
  }),
  plane: castEntry({
    Editor: createPlaneEditor(planeForm),
    form: planeForm,
    parseFormData: planeFormDataToDB,
    useLocalizeResource: planeStore.useLocalizeResource,
  }),
  service: castEntry({
    Editor: createServiceEditor(serviceForm),
    form: serviceForm,
    parseFormData: serviceFormDataToDB,
    useLocalizeResource: serviceStore.useLocalizeResource,
  }),
  species: castEntry({
    Editor: createSpeciesEditor(speciesForm),
    form: speciesForm,
    parseFormData: speciesFormDataToDB,
    useLocalizeResource: speciesStore.useLocalizeResource,
  }),
  spell: castEntry({
    Editor: createSpellEditor(spellForm),
    form: spellForm,
    parseFormData: spellFormDataToDB,
    useLocalizeResource: spellStore.useLocalizeResource,
  }),
  tool: castEntry({
    Editor: createToolEditor(toolForm),
    form: toolForm,
    parseFormData: toolFormDataToDB,
    useLocalizeResource: toolStore.useLocalizeResource,
  }),
  tool_modifier: castEntry({
    Editor: createToolModifierEditor(toolModifierForm, toolStore),
    form: toolModifierForm,
    parseFormData: toolModifierFormDataToDB,
    useLocalizeResource: toolModifierStore.useLocalizeResource,
  }),
  vehicle: castEntry({
    Editor: createVehicleEditor(vehicleForm),
    form: vehicleForm,
    parseFormData: vehicleFormDataToDB,
    useLocalizeResource: vehicleStore.useLocalizeResource,
  }),
  weapon: castEntry({
    Editor: createWeaponEditor(weaponForm),
    form: weaponForm,
    parseFormData: weaponFormDataToDB,
    useLocalizeResource: weaponStore.useLocalizeResource,
  }),
  weapon_modifier: castEntry({
    Editor: createWeaponModifierEditor(weaponModifierForm, weaponStore),
    form: weaponModifierForm,
    parseFormData: weaponModifierFormDataToDB,
    useLocalizeResource: weaponModifierStore.useLocalizeResource,
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
