import { HStack, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";
import { useI18nLang } from "~/i18n/i18n-lang";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFormData } from "~/models/resources/resource-form";
import { useResourceVisibilityOptions } from "~/models/types/resource-visibility";
import type { Form } from "~/utils/form";
import {
  createInputField,
  createNumberInputField,
  createSelectEnumField,
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
  // Image Url Field
  //----------------------------------------------------------------------------

  const ImageUrlField = createInputField({
    i18nContext: {
      label: {
        en: "Image URL",
        it: "URL Immagine",
      },
      placeholder: {
        en: "None",
        it: "Nessuna",
      },
    },
    useField: form.createUseField("image_url"),
  });

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
        en: "None",
        it: "Nessuno",
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
  // Name Short
  //----------------------------------------------------------------------------

  const NameShortField = createInputField({
    i18nContext: {
      label: { en: "Abbreviation", it: "Abbreviazione" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    translatable: true,
    useField: form.createUseField("name_short"),
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

  const VisibilityField = createSelectEnumField({
    i18nContext: {
      label: {
        en: "Visibility",
        it: "Visibilità",
      },
    },
    useField: form.createUseField("visibility"),
    useOptions: useResourceVisibilityOptions,
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
          <NameShortField
            defaultValue={resource.name_short[lang] ?? ""}
            w="14em"
          />
          <PageField defaultValue={resource.page?.[lang] ?? 0} maxW="6em" />
          <VisibilityField defaultValue={resource.visibility} maxW="10em" />
        </HStack>

        <ImageUrlField defaultValue={resource.image_url ?? ""} />

        {children}
      </VStack>
    );
  };
}
