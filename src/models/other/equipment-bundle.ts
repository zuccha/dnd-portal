import z from "zod";

//------------------------------------------------------------------------------
// Equipment Bundle
//------------------------------------------------------------------------------

export const equipmentBundleSchema = z.object({
  currency: z.number(),
  equipments: z.array(z.object({ id: z.uuid(), quantity: z.number() })),
});

export type EquipmentBundle = z.infer<typeof equipmentBundleSchema>;

//------------------------------------------------------------------------------
// Default Equipment Bundle
//------------------------------------------------------------------------------

export const defaultEquipmentBundle = {
  currency: 0,
  equipments: [],
};
