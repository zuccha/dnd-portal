import z from "zod";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type CreatureTreasure, creatureTreasureSchema } from "./creature-treasure";

//------------------------------------------------------------------------------
// Localized Creature Treasure Schema
//------------------------------------------------------------------------------

export const localizedCreatureTreasureSchema = localizedResourceSchema(
  creatureTreasureSchema,
  z.literal("creature_treasure"),
);

//------------------------------------------------------------------------------
// Localized Creature Treasure
//------------------------------------------------------------------------------

export type LocalizedCreatureTreasure = z.infer<typeof localizedCreatureTreasureSchema>;

//------------------------------------------------------------------------------
// Use Creature Treasure Localization Context
//------------------------------------------------------------------------------

export function useCreatureTreasureLocalizationContext(
  _treasure: CreatureTreasure,
): ResourceLocalizationContext {
  return useResourceLocalizationContext();
}

//------------------------------------------------------------------------------
// Localize Creature Treasure
//------------------------------------------------------------------------------

export function localizeCreatureTreasure(
  treasure: CreatureTreasure,
  context: ResourceLocalizationContext,
): LocalizedCreatureTreasure {
  return localizeResource(treasure, context);
}
