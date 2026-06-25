import { HStack } from "@chakra-ui/react";
import { useI18nLang } from "~/i18n/i18n-lang";
import type { Vehicle } from "~/models/resources/vehicles/vehicle";
import type { VehicleFormData } from "~/models/resources/vehicles/vehicle-form";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import {
  createCostInputField,
  createNumberInputField,
  createSpeedInputField,
  createTextareaField,
  createWeightInputField,
} from "../resource-editor-form";

//------------------------------------------------------------------------------
// Create Vehicle Editor
//------------------------------------------------------------------------------

export type VehicleEditorProps = {
  resource: Vehicle;
};

export function createVehicleEditor(form: Form<VehicleFormData>) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  //----------------------------------------------------------------------------
  // Fields
  //----------------------------------------------------------------------------

  const CostField = createCostInputField({
    i18nContext: { label: { en: "Cost", it: "Costo" } },
    inputProps: { min: 0 },
    useField: form.createUseField("cost"),
  });

  const SpeedField = createSpeedInputField({
    i18nContext: { label: { en: "Speed", it: "Velocità" } },
    inputProps: { min: 0 },
    useField: form.createUseField("speed"),
  });

  const CrewField = createNumberInputField({
    i18nContext: { label: { en: "Crew", it: "Equipaggio" } },
    inputProps: { min: 0 },
    useField: form.createUseField("crew_capacity"),
  });

  const PassengersField = createNumberInputField({
    i18nContext: { label: { en: "Passengers", it: "Passeggeri" } },
    inputProps: { min: 0 },
    useField: form.createUseField("passenger_capacity"),
  });

  const CargoField = createWeightInputField({
    i18nContext: { label: { en: "Cargo", it: "Carico" } },
    inputProps: { min: 0 },
    useField: form.createUseField("cargo"),
  });

  const AcField = createNumberInputField({
    i18nContext: { label: { en: "Armor Class", it: "Classe Armatura" } },
    inputProps: { min: 0 },
    useField: form.createUseField("ac"),
  });

  const HpField = createNumberInputField({
    i18nContext: { label: { en: "Hit Points", it: "Punti Ferita" } },
    inputProps: { min: 0 },
    useField: form.createUseField("hp"),
  });

  const DamageThresholdField = createNumberInputField({
    i18nContext: {
      label: { en: "Damage Threshold", it: "Soglia di Danno" },
    },
    inputProps: { min: 0 },
    useField: form.createUseField("damage_threshold"),
  });

  const DescriptionField = createTextareaField({
    i18nContext: {
      label: { en: "Description", it: "Descrizione" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    inputProps: { rows: 5 },
    translatable: true,
    useField: form.createUseField("description"),
  });

  //----------------------------------------------------------------------------
  // Vehicle Editor
  //----------------------------------------------------------------------------

  return function VehicleEditor({ resource }: VehicleEditorProps) {
    const [lang] = useI18nLang();

    return (
      <ResourceEditor resource={resource}>
        <HStack w="full">
          <CostField defaultValue={resource.cost} />
          <SpeedField defaultValue={resource.speed} />
          <CargoField defaultValue={resource.cargo} />
        </HStack>

        <HStack w="full">
          <CrewField defaultValue={resource.crew_capacity} />
          <PassengersField defaultValue={resource.passenger_capacity} />
        </HStack>

        <HStack w="full">
          <HpField defaultValue={resource.hp} />
          <AcField defaultValue={resource.ac} />
          <DamageThresholdField defaultValue={resource.damage_threshold} />
        </HStack>

        <DescriptionField defaultValue={resource.description[lang] ?? ""} />
      </ResourceEditor>
    );
  };
}
