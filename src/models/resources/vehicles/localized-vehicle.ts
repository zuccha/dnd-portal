import { useCallback } from "react";
import z from "zod";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { useFormatCp } from "~/measures/cost";
import { useFormatCmh } from "~/measures/speed";
import { useFormatGrams } from "~/measures/weight";
import { formatNumber } from "~/utils/number";
import {
  formatInfo,
  localizedResourceSchema,
  useLocalizeResource,
} from "../localized-resource";
import { type Vehicle, vehicleSchema } from "./vehicle";

//------------------------------------------------------------------------------
// Localized Vehicle
//------------------------------------------------------------------------------

export const localizedVehicleSchema = localizedResourceSchema(
  vehicleSchema,
  z.literal("vehicle"),
).extend({
  ac: z.string(),
  cargo: z.string(),
  cost: z.string(),
  crew: z.string(),
  damage_threshold: z.string(),
  hp: z.string(),
  info: z.string(),
  passengers: z.string(),
  speed: z.string(),
});

export type LocalizedVehicle = z.infer<typeof localizedVehicleSchema>;

//------------------------------------------------------------------------------
// Use Localized Vehicle
//------------------------------------------------------------------------------

export function useLocalizeVehicle(): (vehicle: Vehicle) => LocalizedVehicle {
  const localizeResource = useLocalizeResource<Vehicle>();
  const { lang, t } = useI18nLangContext(i18nContext);
  const formatCost = useFormatCp();
  const formatCmh = useFormatCmh();
  const formatGrams = useFormatGrams();

  return useCallback(
    (vehicle: Vehicle): LocalizedVehicle => {
      const cost = formatCost(vehicle.cost);
      const speed = formatCmh(vehicle.speed);
      const crew = formatNumber(vehicle.crew_capacity, lang);
      const passengers = formatNumber(vehicle.passenger_capacity, lang);
      const cargo = formatGrams(vehicle.cargo);
      const ac = formatNumber(vehicle.ac, lang);
      const hp = formatNumber(vehicle.hp, lang);
      const damageThreshold = formatNumber(vehicle.damage_threshold, lang);

      return {
        ...localizeResource(vehicle),
        descriptor: t("subtitle"),
        details: translate(vehicle.description, lang),

        ac,
        cargo,
        cost,
        crew,
        damage_threshold: damageThreshold,
        hp,
        info: formatInfo([
          [t("speed"), speed],
          [t("crew"), crew],
          [t("passengers"), passengers],
        ]),
        passengers,
        speed,
      };
    },
    [formatCmh, formatCost, formatGrams, lang, localizeResource, t],
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  ac: {
    en: "AC",
    it: "CA",
  },
  cargo: {
    en: "Cargo",
    it: "Carico",
  },
  cost: {
    en: "Cost",
    it: "Costo",
  },
  crew: {
    en: "Crew",
    it: "Equipaggio",
  },
  damage_threshold: {
    en: "Damage Threshold",
    it: "Soglia di Danno",
  },
  hp: {
    en: "HP",
    it: "PF",
  },
  passengers: {
    en: "Passengers",
    it: "Passeggeri",
  },
  speed: {
    en: "Speed",
    it: "Velocità",
  },
  subtitle: {
    en: "Vehicle",
    it: "Veicolo",
  },
};
