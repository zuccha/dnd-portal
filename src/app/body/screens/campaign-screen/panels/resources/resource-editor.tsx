import { HStack, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { characterClassForm } from "~/models/resources/character-classes/character-class-form";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFormData } from "~/models/resources/resource-form";
import { useCampaignRoleOptions } from "~/models/types/campaign-role";
import type { Form } from "~/utils/form";
import {
  createInputField,
  createNumberInputField,
  createSelectField,
} from "./resource-editor-form";

//------------------------------------------------------------------------------
// Create Resource Editor
//------------------------------------------------------------------------------

export type ResourceEditorProps = {
  children?: ReactNode;
  resource: Resource;
};

export function createResourceEditor<D extends ResourceFormData>(
  form: Form<D>,
) {
  //----------------------------------------------------------------------------
  // Name Field
  //----------------------------------------------------------------------------

  const NameField = createInputField({
    i18nContext: {
      label: {
        en: "Name",
        it: "Nome",
      },
      placeholder: {
        en: "E.g.: Barbarian",
        it: "Es: Barbaro",
      },
    },
    i18nContextExtra: {
      "error.empty": {
        en: "The name cannot be empty",
        it: "Il nome non può essere vuoto",
      },
    },
    translatable: true,
    useField: form.createUseField("name", (name) =>
      name ? undefined : "error.empty",
    ),
  });

  //----------------------------------------------------------------------------
  // Page Field
  //----------------------------------------------------------------------------

  const PageField = createNumberInputField({
    i18nContext: {
      label: {
        en: "Page",
        it: "Pagina",
      },
    },
    translatable: true,
    useField: form.createUseField("page"),
  });

  //----------------------------------------------------------------------------
  // Visibility Field Field
  //----------------------------------------------------------------------------

  const VisibilityField = createSelectField({
    i18nContext: {
      label: {
        en: "Visibility",
        it: "Visibilità",
      },
    },
    useField: characterClassForm.createUseField("visibility"),
    useOptions: useCampaignRoleOptions,
  });

  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  return function ResourceEditor({ children, resource }: ResourceEditorProps) {
    const [lang] = useI18nLang();

    return (
      <VStack align="stretch" gap={4}>
        <HStack align="flex-start" gap={4}>
          <NameField defaultValue={resource.name[lang] ?? ""} />
          <PageField defaultValue={resource.page?.[lang] ?? 0} maxW="6em" />
          <VisibilityField defaultValue={resource.visibility} maxW="10em" />
        </HStack>

        {children}
      </VStack>
    );
  };
}
