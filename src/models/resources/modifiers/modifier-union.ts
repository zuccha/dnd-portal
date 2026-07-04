import z from "zod";
import {
  equipmentModifierUnionSchema,
  localizedEquipmentModifierUnionSchema,
} from "./equipment/equipment-modifier-union";

//------------------------------------------------------------------------------
//  Modifier Union
//------------------------------------------------------------------------------

export const modifierUnionSchema = z.discriminatedUnion("kind", [
  equipmentModifierUnionSchema,
]);

export type ModifierUnion = z.infer<typeof modifierUnionSchema>;

//------------------------------------------------------------------------------
// Localized Modifier Union
//------------------------------------------------------------------------------

export const localizedModifierUnionSchema = z.discriminatedUnion("kind", [
  localizedEquipmentModifierUnionSchema,
]);

export type LocalizedModifierUnion = z.infer<
  typeof localizedModifierUnionSchema
>;
