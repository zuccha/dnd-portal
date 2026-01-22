import { HStack } from "@chakra-ui/react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { equipmentStore } from "~/models/resources/equipment/equipment-store";
import type { Tool } from "~/models/resources/equipment/tools/tool";
import type { ToolFormData } from "~/models/resources/equipment/tools/tool-form";
import { useCreatureAbilityOptions } from "~/models/types/creature-ability";
import { useToolTypeOptions } from "~/models/types/tool-type";
import type { Form } from "~/utils/form";
import {
  createResourceSearchField,
  createSelectEnumField,
  createTextareaField,
} from "../../resource-editor-form";
import { createEquipmentEditor } from "../equipment-editor";

//------------------------------------------------------------------------------
// Tool Editor
//------------------------------------------------------------------------------

export type ToolEditorProps = {
  campaignId: string;
  resource: Tool;
};

export function createToolEditor(form: Form<ToolFormData>) {
  //----------------------------------------------------------------------------
  // Equipment Editor
  //----------------------------------------------------------------------------

  const EquipmentEditor = createEquipmentEditor(form);

  //------------------------------------------------------------------------------
  // Ability
  //------------------------------------------------------------------------------

  const AbilityField = createSelectEnumField({
    i18nContext: { label: { en: "Ability", it: "Caratteristica" } },
    useField: form.createUseField("ability"),
    useOptions: useCreatureAbilityOptions,
  });

  //----------------------------------------------------------------------------
  // Craft
  //----------------------------------------------------------------------------

  const CraftIdsField = createResourceSearchField({
    i18nContext: {
      label: { en: "Craft", it: "Creazioni" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    useField: form.createUseField("craft_ids"),
    useOptions: equipmentStore.useResourceOptions,
  });

  //------------------------------------------------------------------------------
  // Type
  //------------------------------------------------------------------------------

  const TypeField = createSelectEnumField({
    i18nContext: { label: { en: "Type", it: "Tipo" } },
    useField: form.createUseField("type"),
    useOptions: useToolTypeOptions,
  });

  //----------------------------------------------------------------------------
  // Utilize
  //----------------------------------------------------------------------------

  const UtilizeField = createTextareaField({
    i18nContext: {
      label: { en: "Utilize", it: "Utilizzo" },
      placeholder: { en: "None", it: "Nessuno" },
    },
    inputProps: { rows: 5 },
    translatable: true,
    useField: form.createUseField("utilize"),
  });

  //----------------------------------------------------------------------------
  // Tool Editor
  //----------------------------------------------------------------------------

  return function ToolEditor({ campaignId, resource }: ToolEditorProps) {
    const [lang] = useI18nLang();

    return (
      <EquipmentEditor resource={resource}>
        <HStack align="flex-start" gap={4}>
          <TypeField defaultValue={resource.type} />
          <AbilityField defaultValue={resource.ability} />
        </HStack>

        <UtilizeField defaultValue={resource.utilize[lang] ?? ""} />
        <CraftIdsField
          campaignId={campaignId}
          defaultValue={resource.craft_ids}
        />
      </EquipmentEditor>
    );
  };
}
