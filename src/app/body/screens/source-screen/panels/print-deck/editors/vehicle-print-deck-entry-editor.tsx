import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedVehicle } from "~/models/resources/vehicles/localized-vehicle";
import Field from "~/ui/field";
import Input from "~/ui/input";
import ResourcePrintDeckEntryEditor from "./resource-print-deck-entry-editor";
import type { PrintDeckEntryEditorProps } from "../print-deck-entry-editor-props";

//------------------------------------------------------------------------------
// Vehicle Print Deck Entry Editor
//------------------------------------------------------------------------------

export default function VehiclePrintDeckEntryEditor({
  localizedResource,
  onLocalizedResourceUpdate,
}: PrintDeckEntryEditorProps<LocalizedVehicle>) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <ResourcePrintDeckEntryEditor
      localizedResource={localizedResource}
      onLocalizedResourceUpdate={onLocalizedResourceUpdate}
    >
      <SimpleGrid columns={{ base: 1, sm: 3 }} gap={3}>
        <Field label={t("armor_class")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("armorClass", { ...localizedResource.armorClass, value })
            }
            placeholder={t("armor_class.placeholder")}
            value={localizedResource.armorClass.value}
          />
        </Field>
        <Field label={t("hit_points")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("hitPoints", { ...localizedResource.hitPoints, value })
            }
            placeholder={t("hit_points.placeholder")}
            value={localizedResource.hitPoints.value}
          />
        </Field>
        <Field label={t("damage_threshold")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("damageThreshold", {
                ...localizedResource.damageThreshold,
                value,
              })
            }
            placeholder={t("damage_threshold.placeholder")}
            value={localizedResource.damageThreshold.value}
          />
        </Field>
        <Field label={t("crew")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("crew", { ...localizedResource.crew, value })
            }
            placeholder={t("crew.placeholder")}
            value={localizedResource.crew.value}
          />
        </Field>
        <Field label={t("passengers")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("passengers", { ...localizedResource.passengers, value })
            }
            placeholder={t("passengers.placeholder")}
            value={localizedResource.passengers.value}
          />
        </Field>
        <Field label={t("cargo")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("cargo", { ...localizedResource.cargo, value })
            }
            placeholder={t("cargo.placeholder")}
            value={localizedResource.cargo.value}
          />
        </Field>
        <Field label={t("cost")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("cost", { ...localizedResource.cost, value })
            }
            placeholder={t("cost.placeholder")}
            value={localizedResource.cost.value}
          />
        </Field>
        <Field label={t("speed")}>
          <Input
            onValueChange={(value) =>
              onLocalizedResourceUpdate("speed", { ...localizedResource.speed, value })
            }
            placeholder={t("speed.placeholder")}
            value={localizedResource.speed.value}
          />
        </Field>
      </SimpleGrid>
    </ResourcePrintDeckEntryEditor>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "armor_class": {
    en: "Armor Class",
    it: "Classe Armatura",
  },
  "armor_class.placeholder": {
    en: "E.g. 15",
    it: "Es. 15",
  },
  "cargo": {
    en: "Cargo Capacity",
    it: "Capacità di Carico",
  },
  "cargo.placeholder": {
    en: "E.g. 100 tons",
    it: "Es. 100 tonnellate",
  },
  "cost": {
    en: "Cost",
    it: "Costo",
  },
  "cost.placeholder": {
    en: "E.g. 30,000 gp",
    it: "Es. 30.000 mo",
  },
  "crew": {
    en: "Crew Capacity",
    it: "Capacità Equipaggio",
  },
  "crew.placeholder": {
    en: "E.g. 20",
    it: "Es. 20",
  },
  "damage_threshold": {
    en: "Damage Threshold",
    it: "Soglia di Danno",
  },
  "damage_threshold.placeholder": {
    en: "E.g. 15",
    it: "Es. 15",
  },
  "hit_points": {
    en: "Hit Points",
    it: "Punti Ferita",
  },
  "hit_points.placeholder": {
    en: "E.g. 250",
    it: "Es. 250",
  },
  "passengers": {
    en: "Passenger Capacity",
    it: "Capacità Passeggeri",
  },
  "passengers.placeholder": {
    en: "E.g. 30",
    it: "Es. 30",
  },
  "speed": {
    en: "Speed",
    it: "Velocità",
  },
  "speed.placeholder": {
    en: "E.g. 4 mph",
    it: "Es. 6 km/h",
  },
};
