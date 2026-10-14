import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { vehicleStore } from "~/models/resources/vehicles/vehicle-store";
import ResourceDetailContent from "../../detail/resource-detail-content";
import ResourceDetailField from "../../detail/resource-detail-field";

type VehicleDetailResource = ReturnType<typeof vehicleStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Vehicle Detail
//------------------------------------------------------------------------------

export default function VehicleDetail({ resource }: { resource: VehicleDetailResource }) {
  const { t } = useI18nLangContext(i18nContext);
  const vehicle = resource;

  return (
    <ResourceDetailContent
      detailsContent={
        vehicle && (
          <SimpleGrid columns={{ base: 1, sm: 3 }} columnGap={6} rowGap={2}>
            <ResourceDetailField label={t("armor_class")}>{vehicle.ac}</ResourceDetailField>
            <ResourceDetailField label={t("hit_points")}>{vehicle.hp}</ResourceDetailField>
            <ResourceDetailField label={t("damage_threshold")}>
              {vehicle.damage_threshold}
            </ResourceDetailField>
            <ResourceDetailField label={t("crew")}>{vehicle.crew}</ResourceDetailField>
            <ResourceDetailField label={t("passengers")}>{vehicle.passengers}</ResourceDetailField>
            <ResourceDetailField label={t("cargo")}>{vehicle.cargo}</ResourceDetailField>
            <ResourceDetailField label={t("speed")}>{vehicle.speed}</ResourceDetailField>
            <ResourceDetailField label={t("cost")}>{vehicle.cost}</ResourceDetailField>
          </SimpleGrid>
        )
      }
      resource={vehicle}
    />
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  armor_class: { en: "Armor Class", it: "Classe Armatura" },
  cargo: { en: "Cargo Capacity", it: "Capacità di Carico" },
  cost: { en: "Cost", it: "Costo" },
  crew: { en: "Crew Capacity", it: "Capacità Equipaggio" },
  damage_threshold: { en: "Damage Threshold", it: "Soglia di Danno" },
  hit_points: { en: "Hit Points", it: "Punti Ferita" },
  passengers: { en: "Passenger Capacity", it: "Capacità Passeggeri" },
  speed: { en: "Speed", it: "Velocità" },
};
