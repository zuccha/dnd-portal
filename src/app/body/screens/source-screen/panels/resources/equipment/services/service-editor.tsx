import { HStack } from "@chakra-ui/react";
import { useI18nLang } from "~/i18n/i18n-lang";
import type { Service } from "~/models/resources/services/service";
import type { ServiceFormData } from "~/models/resources/services/service-form";
import { useServiceCategoryOptions } from "~/models/types/service-category";
import { useServiceCostPeriodOptions } from "~/models/types/service-cost-period";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../../resource-editor";
import {
  createCostInputField,
  createInputField,
  createSelectEnumField,
  createTextareaField,
} from "../../resource-editor-form";

//------------------------------------------------------------------------------
// Create Service Editor
//------------------------------------------------------------------------------

export type ServiceEditorProps = {
  resource: Service;
};

export function createServiceEditor(form: Form<ServiceFormData>) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  //----------------------------------------------------------------------------
  // Category
  //----------------------------------------------------------------------------

  const CategoryField = createSelectEnumField({
    i18nContext: { label: { en: "Category", it: "Categoria" } },
    useField: form.createUseField("category"),
    useOptions: useServiceCategoryOptions,
  });

  //----------------------------------------------------------------------------
  // Cost
  //----------------------------------------------------------------------------

  const CostField = createCostInputField({
    i18nContext: { label: { en: "Cost", it: "Costo" } },
    inputProps: { min: 0 },
    useField: form.createUseField("cost"),
  });

  //----------------------------------------------------------------------------
  // Cost Period
  //----------------------------------------------------------------------------

  const CostPeriodField = createSelectEnumField({
    i18nContext: { label: { en: "Cost Period", it: "Periodo" } },
    useField: form.createUseField("cost_period"),
    useOptions: useServiceCostPeriodOptions,
  });

  //----------------------------------------------------------------------------
  // Availability
  //----------------------------------------------------------------------------

  const AvailabilityField = createInputField({
    i18nContext: {
      label: { en: "Availability", it: "Disponibilità" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    translatable: true,
    useField: form.createUseField("availability"),
  });

  //----------------------------------------------------------------------------
  // Description
  //----------------------------------------------------------------------------

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
  // Service Editor
  //----------------------------------------------------------------------------

  return function ServiceEditor({ resource }: ServiceEditorProps) {
    const [lang] = useI18nLang();

    return (
      <ResourceEditor resource={resource}>
        <HStack align="flex-start" gap={4} w="full">
          <CategoryField defaultValue={resource.category} />
          <CostField defaultValue={resource.cost} />
          <CostPeriodField defaultValue={resource.cost_period} />
        </HStack>

        <AvailabilityField defaultValue={resource.availability[lang] ?? ""} />
        <DescriptionField defaultValue={resource.description[lang] ?? ""} />
      </ResourceEditor>
    );
  };
}
