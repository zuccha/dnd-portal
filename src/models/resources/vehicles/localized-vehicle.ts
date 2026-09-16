import { useCallback, useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import { useFormatCp } from "~/measures/cost";
import { useFormatCmh } from "~/measures/speed";
import { useFormatGrams } from "~/measures/weight";
import { formatNumber } from "~/utils/number";
import {
  type ResourceLocalizationContext,
  formatInfo,
  localizeResource,
  localizedResourceSchema,
  useResourceLocalizationContext,
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

function useVehicleLocalizationContext(): VehicleLocalizationContext {
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
  const cost = context.formatCost(vehicle.cost);
  const speed = context.formatCmh(vehicle.speed);
  const crew = formatNumber(vehicle.crew_capacity, context.lang);
  const passengers = formatNumber(vehicle.passenger_capacity, context.lang);
  const cargo = context.formatGrams(vehicle.cargo);
  const ac = formatNumber(vehicle.ac, context.lang);
  const hp = formatNumber(vehicle.hp, context.lang);
  const damageThreshold = formatNumber(vehicle.damage_threshold, context.lang);

  return {
    ...localizeResource(vehicle, context),
    descriptor: context.t("subtitle"),
    details: translate(vehicle.description, context.lang),
    ac,
    cargo,
    cost,
    crew,
    damage_threshold: damageThreshold,
    hp,
    info: formatInfo([
      [context.t("speed"), speed],
      [context.t("crew"), crew],
      [context.t("passengers"), passengers],
    ]),
    passengers,
    speed,
  };
}

//------------------------------------------------------------------------------
// Use Localize Vehicle
//------------------------------------------------------------------------------

export function useLocalizeVehicle(): (vehicle: Vehicle) => LocalizedVehicle {
  const context = useVehicleLocalizationContext();
  return useCallback((vehicle) => localizeVehicle(vehicle, context), [context]);
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
