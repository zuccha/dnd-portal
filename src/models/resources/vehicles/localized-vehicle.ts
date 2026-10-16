import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import { useFormatCp } from "~/measures/cost";
import { useFormatCmh } from "~/measures/speed";
import { useFormatGrams } from "~/measures/weight";
import { formatNumber } from "~/utils/number";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedFieldSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Vehicle, vehicleSchema } from "./vehicle";

const localizedVehicleFieldSchema = localizedFieldSchema.extend({
  shortLabel: z.string(),
});

//------------------------------------------------------------------------------
// Localized Vehicle
//------------------------------------------------------------------------------

export const localizedVehicleSchema = localizedResourceSchema(
  vehicleSchema,
  z.literal("vehicle"),
).extend({
  armorClass: localizedVehicleFieldSchema,
  cargo: localizedFieldSchema,
  cost: localizedFieldSchema,
  crew: localizedVehicleFieldSchema,
  damageThreshold: localizedVehicleFieldSchema,
  hitPoints: localizedVehicleFieldSchema,
  passengers: localizedVehicleFieldSchema,
  speed: localizedFieldSchema,
});

export type LocalizedVehicle = z.infer<typeof localizedVehicleSchema>;

//------------------------------------------------------------------------------
// Vehicle Localization Context
//------------------------------------------------------------------------------

type VehicleLocalizationContext = ResourceLocalizationContext & {
  formatCost: ReturnType<typeof useFormatCp>;
  formatCmh: ReturnType<typeof useFormatCmh>;
  formatGrams: ReturnType<typeof useFormatGrams>;
};

//------------------------------------------------------------------------------
// Use Vehicle Localization Context
//------------------------------------------------------------------------------

export function useVehicleLocalizationContext(_vehicle: Vehicle): VehicleLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const formatCost = useFormatCp();
  const formatCmh = useFormatCmh();
  const formatGrams = useFormatGrams();

  return useMemo(
    () => ({ ...context, formatCost, formatCmh, formatGrams }),
    [context, formatCmh, formatCost, formatGrams],
  );
}

//------------------------------------------------------------------------------
// Localize Vehicle
//------------------------------------------------------------------------------

export function localizeVehicle(
  vehicle: Vehicle,
  context: VehicleLocalizationContext,
): LocalizedVehicle {
  return {
    ...localizeResource(vehicle, context),
    descriptor: context.t("descriptor"),
    details: translate(vehicle.description, context.lang),

    armorClass: {
      label: context.t("armor_class"),
      shortLabel: context.t("armor_class.short"),
      value: formatNumber(vehicle.armor_class, context.lang),
    },
    cargo: {
      label: context.t("cargo"),
      value: context.formatGrams(vehicle.cargo),
    },
    cost: {
      label: context.t("cost"),
      value: context.formatCost(vehicle.cost),
    },
    crew: {
      label: context.t("crew"),
      shortLabel: context.t("crew.short"),
      value: formatNumber(vehicle.crew_capacity, context.lang),
    },
    damageThreshold: {
      label: context.t("damage_threshold"),
      shortLabel: context.t("damage_threshold.short"),
      value: formatNumber(vehicle.damage_threshold, context.lang),
    },
    hitPoints: {
      label: context.t("hit_points"),
      shortLabel: context.t("hit_points.short"),
      value: formatNumber(vehicle.hit_points, context.lang),
    },
    passengers: {
      label: context.t("passengers"),
      shortLabel: context.t("passengers.short"),
      value: formatNumber(vehicle.passenger_capacity, context.lang),
    },
    speed: {
      label: context.t("speed"),
      value: context.formatCmh(vehicle.speed),
    },
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "armor_class": {
    en: "Armor Class",
    it: "Classe Armatura",
  },
  "armor_class.short": {
    en: "AC",
    it: "CA",
  },
  "cargo": {
    en: "Cargo Capacity",
    it: "Capacità di Carico",
  },
  "cost": {
    en: "Cost",
    it: "Costo",
  },
  "crew": {
    en: "Crew Capacity",
    it: "Capacità Equipaggio",
  },
  "crew.short": {
    en: "Crew",
    it: "Equipaggio",
  },
  "damage_threshold": {
    en: "Damage Threshold",
    it: "Soglia di Danno",
  },
  "damage_threshold.short": {
    en: "DT",
    it: "SD",
  },
  "hit_points": {
    en: "Hit Points",
    it: "Punti Ferita",
  },
  "hit_points.short": {
    en: "HP",
    it: "PF",
  },
  "passengers": {
    en: "Passenger Capacity",
    it: "Capacità Passeggeri",
  },
  "passengers.short": {
    en: "Passengers",
    it: "Passeggeri",
  },
  "speed": {
    en: "Speed",
    it: "Velocità",
  },
  "descriptor": {
    en: "Vehicle",
    it: "Veicolo",
  },
};
