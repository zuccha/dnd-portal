import z from "zod";
import { equipmentBundleSchema } from "../../other/equipment-bundle";

//------------------------------------------------------------------------------
// Starting Equipment Option
//------------------------------------------------------------------------------

export const startingEquipmentOptionSchema = z.object({
  bundle: equipmentBundleSchema,
  option: z.number(),
});

export type StartingEquipmentOption = z.infer<typeof startingEquipmentOptionSchema>;

//------------------------------------------------------------------------------
// Starting Equipment Group
//------------------------------------------------------------------------------

export const startingEquipmentGroupSchema = z.object({
  group: z.number(),
  options: z.array(startingEquipmentOptionSchema),
});

export type StartingEquipmentGroup = z.infer<typeof startingEquipmentGroupSchema>;
