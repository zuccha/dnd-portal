import { HStack, type StackProps } from "@chakra-ui/react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Background } from "~/models/resources/backgrounds/background";
import type { BackgroundFormData } from "~/models/resources/backgrounds/background-form";
import type { StartingEquipmentGroup } from "~/models/resources/character-classes/starting-equipment";
import { toolStore } from "~/models/resources/equipment/tools/tool-store";
import { featStore } from "~/models/resources/feats/feat-store";
import type { ResourceOption } from "~/models/resources/resource";
import { useCreatureAbilityOptions } from "~/models/types/creature-ability";
import { useCreatureSkillOptions } from "~/models/types/creature-skill";
import Field from "~/ui/field";
import type { FieldBag, Form } from "~/utils/form";
import StartingEquipmentEditor from "../character-classes/starting-equipment-editor";
import { createResourceEditor } from "../resource-editor";
import {
  createInputField,
  createMultipleSelectEnumField,
} from "../resource-editor-form";
import ResourceSearch from "../resource-search";

//------------------------------------------------------------------------------
// Background Editor
//------------------------------------------------------------------------------

export type BackgroundEditorProps = {
  resource: Background;
  sourceId: string;
};

export function createBackgroundEditor(form: Form<BackgroundFormData>) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  //----------------------------------------------------------------------------
  // Ability Scores Field
  //----------------------------------------------------------------------------

  const AbilityScoresField = createMultipleSelectEnumField({
    i18nContext: {
      label: {
        en: "Ability Scores",
        it: "Punteggi di Caratteristica",
      },
      placeholder: {
        en: "None",
        it: "Nessuno",
      },
    },
    useField: form.createUseField("ability_scores"),
    useOptions: useCreatureAbilityOptions,
  });

  //----------------------------------------------------------------------------
  // Feat Field
  //----------------------------------------------------------------------------

  const FeatField = createSingleResourceField({
    i18nContext: {
      label: {
        en: "Feat",
        it: "Talento",
      },
      placeholder: {
        en: "Search feat",
        it: "Cerca talento",
      },
    },
    useField: form.createUseField("feat_id"),
    useOptions: featStore.useResourceOptions,
  });

  //----------------------------------------------------------------------------
  // Feat Notes Field
  //----------------------------------------------------------------------------

  const FeatNotesField = createInputField({
    i18nContext: {
      label: {
        en: "Feat Notes",
        it: "Note Talento",
      },
      placeholder: {
        en: "None",
        it: "Nessuna",
      },
    },
    translatable: true,
    useField: form.createUseField("feat_notes"),
  });

  //----------------------------------------------------------------------------
  // Skill Proficiencies Field
  //----------------------------------------------------------------------------

  const SkillProficienciesField = createMultipleSelectEnumField({
    i18nContext: {
      label: {
        en: "Skill Proficiencies",
        it: "Competenze nelle Abilità",
      },
      placeholder: {
        en: "None",
        it: "Nessuna",
      },
    },
    useField: form.createUseField("skill_proficiencies"),
    useOptions: useCreatureSkillOptions,
  });

  //----------------------------------------------------------------------------
  // Starting Equipment
  //----------------------------------------------------------------------------

  const useStartingEquipment = form.createUseField("starting_equipment");

  function StartingEquipmentField({
    sourceId,
    defaultValue,
  }: {
    sourceId: string;
    defaultValue: StartingEquipmentGroup[];
  }) {
    const { error, ...rest } = useStartingEquipment(defaultValue);
    const { t } = useI18nLangContext(i18nContext);
    const message = error ? t(error) : undefined;

    return (
      <Field error={message} label={t("starting_equipment.label")}>
        <StartingEquipmentEditor sourceId={sourceId} w="full" {...rest} />
      </Field>
    );
  }

  //----------------------------------------------------------------------------
  // Tool Proficiency Field
  //----------------------------------------------------------------------------

  const ToolProficiencyField = createSingleResourceField({
    i18nContext: {
      label: {
        en: "Tool Proficiency",
        it: "Competenza negli Strumenti",
      },
      placeholder: {
        en: "Search tool",
        it: "Cerca strumento",
      },
    },
    useField: form.createUseField("tool_proficiency_id"),
    useOptions: toolStore.useResourceOptions,
  });

  //----------------------------------------------------------------------------
  // Tool Notes Field
  //----------------------------------------------------------------------------

  const ToolNotesField = createInputField({
    i18nContext: {
      label: {
        en: "Tool Notes",
        it: "Note Strumento",
      },
      placeholder: {
        en: "None",
        it: "Nessuna",
      },
    },
    translatable: true,
    useField: form.createUseField("tool_notes"),
  });

  //----------------------------------------------------------------------------
  // Background Editor
  //----------------------------------------------------------------------------

  return function BackgroundEditor({
    resource,
    sourceId,
  }: BackgroundEditorProps) {
    const [lang] = useI18nLang();

    return (
      <ResourceEditor resource={resource}>
        <AbilityScoresField defaultValue={resource.ability_scores} />

        <HStack align="flex-start" gap={4} w="full">
          <FeatField defaultValue={resource.feat_id} sourceId={sourceId} />
          <FeatNotesField defaultValue={resource.feat_notes[lang] ?? ""} />
        </HStack>

        <HStack align="flex-start" gap={4} w="full">
          <ToolProficiencyField
            defaultValue={resource.tool_proficiency_id}
            sourceId={sourceId}
          />
          <ToolNotesField defaultValue={resource.tool_notes[lang] ?? ""} />
        </HStack>

        <SkillProficienciesField defaultValue={resource.skill_proficiencies} />

        <StartingEquipmentField
          defaultValue={resource.starting_equipment}
          sourceId={sourceId}
        />
      </ResourceEditor>
    );
  };
}

//------------------------------------------------------------------------------
// Create Single Resource Field
//------------------------------------------------------------------------------

type SingleResourceFieldProps = Omit<StackProps, "defaultValue"> & {
  defaultValue: string | null;
  sourceId: string;
};

function createSingleResourceField({
  i18nContext,
  useOptions,
  useField,
}: {
  i18nContext: {
    label: { en: string; it: string };
    placeholder: { en: string; it: string };
  };
  useOptions: (sourceId: string) => ResourceOption[];
  useField: (defaultValue: string | null) => FieldBag<string, string | null>;
}) {
  function SingleResourceField({
    sourceId,
    defaultValue,
    ...rest
  }: SingleResourceFieldProps) {
    const options = useOptions(sourceId);
    const { error, onValueChange, value } = useField(defaultValue);
    const { t } = useI18nLangContext(i18nContext);
    const message = error ? t(error) : undefined;

    return (
      <Field error={message} label={t("label")} {...rest}>
        <ResourceSearch
          onValueChange={(ids) => onValueChange(ids.at(-1) ?? null)}
          options={options}
          value={value ? [value] : []}
          withinDialog
        />
      </Field>
    );
  }

  return SingleResourceField;
}

//----------------------------------------------------------------------------
// I18n Context
//----------------------------------------------------------------------------

const i18nContext = {
  "starting_equipment.label": {
    en: "Equipment",
    it: "Equipaggiamento",
  },
};
