import { z } from "zod";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Place Type
//------------------------------------------------------------------------------

export const placeTypeSchema = z.enum([
  "continent",
  "country",
  "region",
  "city",
  "town",
  "village",
  "settlement",
  "district",
  "building",
  "site",
  "other",
]);

//------------------------------------------------------------------------------
// Place Types
//------------------------------------------------------------------------------

export const placeTypes = placeTypeSchema.options;

//------------------------------------------------------------------------------
// Place Type
//------------------------------------------------------------------------------

export type PlaceType = z.infer<typeof placeTypeSchema>;

//------------------------------------------------------------------------------
// Place Type Hooks
//------------------------------------------------------------------------------

export const { useOptions: usePlaceTypeOptions, useTranslate: useTranslatePlaceType } =
  createTypeTranslationHooks(placeTypes, {
    building: { en: "Building", it: "Edificio" },
    city: { en: "City", it: "Città" },
    continent: { en: "Continent", it: "Continente" },
    district: { en: "Neighborhood", it: "Quartiere" },
    country: { en: "Nation", it: "Nazione" },
    other: { en: "Other Place", it: "Altro Luogo" },
    region: { en: "Region", it: "Regione" },
    settlement: { en: "Settlement", it: "Insediamento" },
    site: { en: "Point of Interest", it: "Luogo di Interesse" },
    town: { en: "Town", it: "Cittadina" },
    village: { en: "Village", it: "Villaggio" },
  });
