import { HStack, VStack } from "@chakra-ui/react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { characterClassStore } from "~/models/resources/character-classes/character-class-store";
import { type Spell } from "~/models/resources/spells/spell";
import type { SpellFormData } from "~/models/resources/spells/spell-form";
import { useSpellCastingTimeOptions } from "~/models/types/spell-casting-time";
import { useSpellDurationOptions } from "~/models/types/spell-duration";
import {
  parseSpellLevel,
  stringifySpellLevel,
  useSpellLevelOptions,
} from "~/models/types/spell-level";
import { useSpellRangeOptions } from "~/models/types/spell-range";
import { useSpellSchoolOptions } from "~/models/types/spell-school";
import type { Form } from "~/utils/form";
import { createResourceEditor } from "../resource-editor";
import {
  createDistanceInputField,
  createInputField,
  createMultipleSelectIdsField,
  createSelectEnumField,
  createSelectField,
  createSwitchField,
  createTextareaField,
  createTimeInputField,
} from "../resource-editor-form";

//------------------------------------------------------------------------------
// Create Spell Editor
//------------------------------------------------------------------------------

export type SpellEditorProps = {
  resource: Spell;
  sourceId: string;
};

export function createSpellEditor(form: Form<SpellFormData>) {
  //----------------------------------------------------------------------------
  // Resource Editor
  //----------------------------------------------------------------------------

  const ResourceEditor = createResourceEditor(form);

  //----------------------------------------------------------------------------
  // Casting Time
  //----------------------------------------------------------------------------

  const useCastingTime = form.createUseField("casting_time");
  const useCastingTimeValue = form.createUseField("casting_time_value");

  const CastingTimeField = createSelectEnumField({
    i18nContext: { label: { en: "Casting Time", it: "Tempo di Lancio" } },
    useField: useCastingTime,
    useOptions: useSpellCastingTimeOptions,
  });

  const CastingTimeValueField = createTimeInputField({
    i18nContext: { label: { en: "", it: "" } },
    useField: useCastingTimeValue,
  });

  const RitualField = createSwitchField({
    i18nContext: { label: { en: "Ritual", it: "Rituale" } },
    useField: form.createUseField("ritual"),
  });

  //----------------------------------------------------------------------------
  // Character Classes
  //----------------------------------------------------------------------------

  const CharacterClassIdsField = createMultipleSelectIdsField({
    i18nContext: {
      label: { en: "Classes", it: "Classi" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    useField: form.createUseField("character_class_ids"),
    useOptions: characterClassStore.useResourceOptions,
  });

  //------------------------------------------------------------------------------
  // Components
  //------------------------------------------------------------------------------

  const useVerbal = form.createUseField("verbal");
  const useSomatic = form.createUseField("somatic");
  const useMaterial = form.createUseField("material");

  const VerbalField = createSwitchField({
    i18nContext: { label: { en: "Verbal", it: "Verbale" } },
    useField: useVerbal,
  });

  const SomaticField = createSwitchField({
    i18nContext: { label: { en: "Somatic", it: "Somatico" } },
    useField: useSomatic,
  });

  const MaterialField = createSwitchField({
    i18nContext: { label: { en: "Material", it: "Materiale" } },
    useField: useMaterial,
  });

  const MaterialsField = createInputField({
    i18nContext: {
      label: { en: "Materials", it: "Materiali" },
      placeholder: { en: "None", it: "Nessuno" },
    },
    translatable: true,
    useField: form.createUseField("materials"),
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

  const UpgradeField = createTextareaField({
    i18nContext: {
      label: { en: "Upgrade", it: "Potenziamento" },
      placeholder: { en: "None", it: "Nessuna" },
    },
    inputProps: { rows: 5 },
    translatable: true,
    useField: form.createUseField("upgrade"),
  });

  //----------------------------------------------------------------------------
  // Duration
  //----------------------------------------------------------------------------

  const useDuration = form.createUseField("duration");
  const useDurationValue = form.createUseField("duration_value");

  const DurationField = createSelectEnumField({
    i18nContext: { label: { en: "Duration", it: "Durata" } },
    useField: useDuration,
    useOptions: useSpellDurationOptions,
  });

  const DurationValueField = createTimeInputField({
    i18nContext: { label: { en: "", it: "" } },
    useField: useDurationValue,
  });

  const ConcentrationField = createSwitchField({
    i18nContext: { label: { en: "Concentration", it: "Concentrazione" } },
    useField: form.createUseField("concentration"),
  });

  //------------------------------------------------------------------------------
  // Level
  //------------------------------------------------------------------------------

  const LevelField = createSelectField({
    i18nContext: { label: { en: "Level", it: "Livello" } },
    inputProps: {
      parse: parseSpellLevel,
      stringify: stringifySpellLevel,
    },
    useField: form.createUseField("level"),
    useOptions: useSpellLevelOptions,
  });

  //----------------------------------------------------------------------------
  // Range
  //----------------------------------------------------------------------------

  const useRange = form.createUseField("range");
  const useRangeValue = form.createUseField("range_value");

  const RangeField = createSelectEnumField({
    i18nContext: { label: { en: "Range", it: "Gittata" } },
    useField: useRange,
    useOptions: useSpellRangeOptions,
  });

  const RangeValueField = createDistanceInputField({
    i18nContext: { label: { en: "", it: "" } },
    useField: useRangeValue,
  });

  //----------------------------------------------------------------------------
  // School
  //----------------------------------------------------------------------------

  const SchoolField = createSelectEnumField({
    i18nContext: { label: { en: "School", it: "Scuola" } },
    useField: form.createUseField("school"),
    useOptions: useSpellSchoolOptions,
  });

  //----------------------------------------------------------------------------
  // Spell Editor
  //----------------------------------------------------------------------------

  return function SpellEditor({ sourceId, resource }: SpellEditorProps) {
    const [lang] = useI18nLang();

    const { value: castingTime } = useCastingTime(resource.casting_time);
    const { value: duration } = useDuration(resource.duration);
    const { value: range } = useRange(resource.range);
    const { value: material } = useMaterial(resource.material);

    return (
      <ResourceEditor resource={resource}>
        <HStack align="flex-start" gap={4}>
          <CharacterClassIdsField
            defaultValue={resource.character_class_ids}
            sourceId={sourceId}
          />
          <SchoolField defaultValue={resource.school} w="20em" />
          <LevelField defaultValue={resource.level} w="10em" />
        </HStack>

        <HStack align="flex-start" gap={4}>
          <VStack w="full">
            <HStack align="flex-end" w="full">
              <CastingTimeField defaultValue={resource.casting_time} />
              {castingTime === "value" && (
                <CastingTimeValueField
                  defaultValue={resource.casting_time_value ?? 0}
                />
              )}
            </HStack>
            <RitualField defaultValue={resource.ritual} />
          </VStack>

          <VStack w="full">
            <HStack align="flex-end" w="full">
              <DurationField defaultValue={resource.duration} />
              {duration === "value" && (
                <DurationValueField
                  defaultValue={resource.duration_value ?? 0}
                />
              )}
            </HStack>
            <ConcentrationField defaultValue={resource.concentration} />
          </VStack>
        </HStack>

        <HStack align="flex-end" flex={1} w="full">
          <RangeField defaultValue={resource.range} />
          {range === "value" && (
            <RangeValueField defaultValue={resource.range_value ?? 0} />
          )}
        </HStack>

        <HStack gap={8}>
          <VerbalField defaultValue={resource.verbal} />
          <SomaticField defaultValue={resource.somatic} />
          <MaterialField defaultValue={resource.material} />
        </HStack>

        {material && (
          <MaterialsField defaultValue={resource.materials?.[lang] ?? ""} />
        )}

        <DescriptionField defaultValue={resource.description[lang] ?? ""} />
        <UpgradeField defaultValue={resource.upgrade?.[lang] ?? ""} />
      </ResourceEditor>
    );
  };
}
