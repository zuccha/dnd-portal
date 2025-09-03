import { HStack, Textarea, VStack } from "@chakra-ui/react";
import { useImperativeHandle, useState } from "react";
import useListCollection from "../../../../../../hooks/use-list-collection";
import {
  convertDistanceImpToMet,
  convertDistanceMetToImp,
  parseDistanceImp,
  parseDistanceMet,
  useDistanceImpUnitOptions,
  useDistanceMetUnitOptions,
} from "../../../../../../i18n/i18n-distance";
import type { I18nLang } from "../../../../../../i18n/i18n-lang";
import {
  type I18nLangContextBag,
  useI18nLangContext,
} from "../../../../../../i18n/i18n-lang-context";
import {
  parseTime,
  useTimeUnitOptions,
} from "../../../../../../i18n/i18n-time";
import { useCharacterClassOptions } from "../../../../../../resources/character-class";
import { type Spell, updateSpell } from "../../../../../../resources/spell";
import { useSpellCastingTimeOptions } from "../../../../../../resources/spell-casting-time";
import { useSpellDurationOptions } from "../../../../../../resources/spell-duration";
import { useSpellLevelOptions } from "../../../../../../resources/spell-level";
import { useSpellRangeOptions } from "../../../../../../resources/spell-range";
import { useSpellSchoolOptions } from "../../../../../../resources/spell-school";
import {
  type SpellTranslation,
  updateSpellTranslation,
} from "../../../../../../resources/spell-translation";
import Field from "../../../../../../ui/field";
import Input from "../../../../../../ui/input";
import NumberInput from "../../../../../../ui/number-input";
import Select from "../../../../../../ui/select";
import Switch from "../../../../../../ui/switch";
import type { ResourceEditorContentProps } from "../resources/resource-editor";

//------------------------------------------------------------------------------
// Spell Editor
//------------------------------------------------------------------------------

export default function SpellEditor({
  disabled,
  errors,
  ref,
  resource,
}: ResourceEditorContentProps<Spell>) {
  const langContextBag = useI18nLangContext(i18nContext);
  const { lang, t, tp } = langContextBag;

  const [level, setLevel] = useState(resource.level);
  const [ritual, setRitual] = useState(resource.ritual);
  const [concentration, setConcentration] = useState(resource.concentration);
  const [verbal, setVerbal] = useState(resource.verbal);
  const [somatic, setSomatic] = useState(resource.somatic);
  const [material, setMaterial] = useState(resource.material);

  useImperativeHandle(ref, () => ({
    save: (formData) => saveSpell(resource.id, lang, formData, langContextBag),
  }));

  return (
    <VStack align="stretch" gap={4}>
      <HStack gap={4}>
        <SpellEditorName
          defaultName={resource.name[lang] ?? ""}
          disabled={disabled}
          errors={errors}
          label={t("name.label")}
          placeholder={t("name.placeholder")}
        />
        <SpellEditorLevel
          disabled={disabled}
          errors={errors}
          label={t("level.label")}
          level={level}
          onLevelChange={setLevel}
        />
      </HStack>

      <HStack gap={4}>
        <SpellEditorCharacterClasses
          defaultCharacterClasses={resource.character_classes}
          disabled={disabled}
          errors={errors}
          label={t("character_classes.label")}
        />
        <SpellEditorSchool
          defaultSchool={resource.school}
          disabled={disabled}
          errors={errors}
          label={t("school.label")}
        />
      </HStack>

      <HStack gap={4}>
        <SpellEditorCastingTime
          defaultCastingTime={resource.casting_time}
          defaultCastingTimeValue={resource.casting_time_value}
          disabled={disabled}
          errors={errors}
          label={t("casting_time.label")}
        />

        <SpellEditorDuration
          defaultDuration={resource.duration}
          defaultDurationValue={resource.duration_value}
          disabled={disabled}
          errors={errors}
          label={t("duration.label")}
        />
      </HStack>

      <HStack gap={4}>
        <Switch
          checked={ritual}
          disabled={disabled}
          flex={1}
          label={t("ritual.label")}
          name="ritual"
          onCheckedChange={setRitual}
          size="lg"
        />

        <Switch
          checked={concentration}
          disabled={disabled}
          flex={1}
          label={t("concentration.label")}
          name="concentration"
          onCheckedChange={setConcentration}
          size="lg"
        />
      </HStack>

      <SpellEditorRange
        defaultRange={resource.range}
        defaultRangeImpValue={resource.range_value_imp}
        defaultRangeMetValue={resource.range_value_met}
        disabled={disabled}
        errors={errors}
        label={t("range.label")}
      />

      <HStack gap={8}>
        <Switch
          checked={verbal}
          disabled={disabled}
          label={t("verbal.label")}
          name="verbal"
          onCheckedChange={setVerbal}
          size="lg"
        />

        <Switch
          checked={somatic}
          disabled={disabled}
          label={t("somatic.label")}
          name="somatic"
          onCheckedChange={setSomatic}
          size="lg"
        />

        <Switch
          checked={material}
          disabled={disabled}
          label={t("material.label")}
          name="material"
          onCheckedChange={setMaterial}
          size="lg"
        />
      </HStack>

      {material && (
        <SpellEditorMaterials
          defaultMaterials={resource.materials?.[lang] ?? ""}
          disabled={disabled}
          errors={errors}
          label={t("materials.label")}
          placeholder={t("materials.placeholder")}
        />
      )}

      <SpellEditorDescription
        defaultDescription={resource.description[lang] ?? ""}
        disabled={disabled}
        errors={errors}
        label={t("description.label")}
        placeholder={t("description.placeholder")}
      />

      <SpellEditorUpdate
        defaultUpgrade={resource.upgrade?.[lang] ?? ""}
        disabled={disabled}
        errors={errors}
        label={tp("upgrade.label", level)}
        placeholder={tp("upgrade.placeholder", level)}
      />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Name
//------------------------------------------------------------------------------

function SpellEditorName({
  defaultName,
  disabled,
  errors,
  label,
  placeholder,
}: {
  defaultName: string;
  disabled: boolean;
  errors: Record<string, string>;
  label: string;
  placeholder: string;
}) {
  const [name, setName] = useState(defaultName);
  const error = errors["name"];

  return (
    <Field disabled={disabled} invalid={!!error} label={label}>
      <Input
        name="name"
        onValueChange={setName}
        placeholder={placeholder}
        value={name}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Level
//------------------------------------------------------------------------------

function SpellEditorLevel({
  disabled,
  errors,
  label,
  level,
  onLevelChange,
}: {
  disabled: boolean;
  errors: Record<string, string>;
  label: string;
  level: Spell["level"];
  onLevelChange: (level: Spell["level"]) => void;
}) {
  const levelOptions = useListCollection(useSpellLevelOptions());
  const error = errors["level"];

  return (
    <Field disabled={disabled} invalid={!!error} label={label} maxW="5em">
      <Select
        name="level"
        onValueChange={(level) =>
          onLevelChange(parseInt(level) as Spell["level"])
        }
        options={levelOptions}
        value={`${level}`}
        withinDialog
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Character Classes
//------------------------------------------------------------------------------

function SpellEditorCharacterClasses({
  defaultCharacterClasses,
  disabled,
  errors,
  label,
}: {
  defaultCharacterClasses: Spell["character_classes"];
  disabled: boolean;
  errors: Record<string, string>;
  label: string;
}) {
  const characterClassOptions = useListCollection(useCharacterClassOptions());
  const [characterClasses, setCharacterClasses] = useState(
    defaultCharacterClasses
  );
  const error = errors["character_classes"];

  return (
    <Field disabled={disabled} invalid={!!error} label={label}>
      <Select
        multiple
        name="character-classes"
        onValueChange={setCharacterClasses}
        options={characterClassOptions}
        value={characterClasses}
        withinDialog
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Spell Editor School
//------------------------------------------------------------------------------

function SpellEditorSchool({
  defaultSchool,
  disabled,
  errors,
  label,
}: {
  defaultSchool: Spell["school"];
  disabled: boolean;
  errors: Record<string, string>;
  label: string;
}) {
  const schoolOptions = useListCollection(useSpellSchoolOptions());
  const [school, setSchool] = useState(defaultSchool);
  const error = errors["school"];

  return (
    <Field disabled={disabled} invalid={!!error} label={label}>
      <Select
        name="school"
        onValueChange={setSchool}
        options={schoolOptions}
        value={school}
        withinDialog
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Spell Editor CastingTime
//------------------------------------------------------------------------------

function SpellEditorCastingTime({
  defaultCastingTime,
  defaultCastingTimeValue,
  disabled,
  errors,
  label,
}: {
  defaultCastingTime: Spell["casting_time"];
  defaultCastingTimeValue: string | null | undefined;
  disabled: boolean;
  errors: Record<string, string>;
  label: string;
}) {
  const timeUnitOptions = useListCollection(useTimeUnitOptions());

  const castingTimeOptions = useListCollection(useSpellCastingTimeOptions());

  const [castingTime, setCastingTime] = useState(defaultCastingTime);

  const [initialCastingTimeValue, initialCastingTimeUnit] = parseTime(
    defaultCastingTimeValue ?? "0 min"
  ) ?? [0, "min"];

  const [castingTimeValue, setCastingTimeValue] = useState(
    initialCastingTimeValue
  );

  const [castingTimeUnit, setCastingTimeUnit] = useState(
    initialCastingTimeUnit
  );

  const error = errors["casting_time"];
  const errorValue = errors["casting_time_value"];
  const errorUnit = errors["casting_time_unit"];

  return (
    <HStack align="flex-end" w="full">
      <Field disabled={disabled} flex={1} invalid={!!error} label={label}>
        <Select
          name="casting-time"
          onValueChange={setCastingTime}
          options={castingTimeOptions}
          value={castingTime}
          withinDialog
        />
      </Field>
      {castingTime === "value" && (
        <>
          <HStack h={10}>:</HStack>
          <Field disabled={disabled} invalid={!!errorValue} maxW="6em">
            <NumberInput
              min={0}
              name="casting-time-value"
              onValueChange={setCastingTimeValue}
              value={castingTimeValue}
            />
          </Field>
          <Field disabled={disabled} invalid={!!errorUnit} maxW="7em">
            <Select
              name="casting-time-unit"
              onValueChange={setCastingTimeUnit}
              options={timeUnitOptions}
              value={castingTimeUnit}
              withinDialog
            />
          </Field>
        </>
      )}
    </HStack>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Duration
//------------------------------------------------------------------------------

function SpellEditorDuration({
  defaultDuration,
  defaultDurationValue,
  disabled,
  errors,
  label,
}: {
  defaultDuration: Spell["duration"];
  defaultDurationValue: string | null | undefined;
  disabled: boolean;
  errors: Record<string, string>;
  label: string;
}) {
  const timeUnitOptions = useListCollection(useTimeUnitOptions());

  const durationOptions = useListCollection(useSpellDurationOptions());

  const [duration, setDuration] = useState(defaultDuration);

  const [initialDurationValue, initialDurationUnit] = parseTime(
    defaultDurationValue ?? "0 min"
  ) ?? [0, "min"];

  const [durationValue, setDurationValue] = useState(initialDurationValue);
  const [durationUnit, setDurationUnit] = useState(initialDurationUnit);

  const error = errors["duration"];
  const errorValue = errors["duration_value"];
  const errorUnit = errors["duration_unit"];

  return (
    <HStack align="flex-end" w="full">
      <Field disabled={disabled} flex={1} invalid={!!error} label={label}>
        <Select
          name="duration"
          onValueChange={setDuration}
          options={durationOptions}
          value={duration}
          withinDialog
        />
      </Field>
      {duration === "value" && (
        <>
          <HStack h={10}>:</HStack>
          <Field disabled={disabled} invalid={!!errorValue} maxW="6em">
            <NumberInput
              min={0}
              name="duration-value"
              onValueChange={setDurationValue}
              value={durationValue}
            />
          </Field>
          <Field disabled={disabled} invalid={!!errorUnit} maxW="7em">
            <Select
              name="duration-unit"
              onValueChange={setDurationUnit}
              options={timeUnitOptions}
              value={durationUnit}
              withinDialog
            />
          </Field>
        </>
      )}
    </HStack>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Range
//------------------------------------------------------------------------------

function SpellEditorRange({
  defaultRange,
  defaultRangeImpValue,
  defaultRangeMetValue,
  disabled,
  errors,
  label,
}: {
  defaultRange: Spell["range"];
  defaultRangeImpValue: string | null | undefined;
  defaultRangeMetValue: string | null | undefined;
  disabled: boolean;
  errors: Record<string, string>;
  label: string;
}) {
  const rangeOptions = useListCollection(useSpellRangeOptions());
  const distanceImpOptions = useListCollection(useDistanceImpUnitOptions());
  const distanceMetOptions = useListCollection(useDistanceMetUnitOptions());

  const [range, setRange] = useState(defaultRange);

  const [initialRangeImpValue, initialRangeImpUnit] = parseDistanceImp(
    defaultRangeImpValue ?? "0 ft"
  ) ?? [0, "ft"];

  const [rangeImpValue, setRangeImpValue] = useState(initialRangeImpValue);
  const [rangeImpUnit, setRangeImpUnit] = useState(initialRangeImpUnit);

  const [initialRangeMetValue, initialRangeMetUnit] = parseDistanceMet(
    defaultRangeMetValue ?? "0 m"
  ) ?? [0, "m"];

  const [rangeMetValue, setRangeMetValue] = useState(initialRangeMetValue);
  const [rangeMetUnit, setRangeMetUnit] = useState(initialRangeMetUnit);

  const setRangeImpValueAndUpdateMet = (value: number) => {
    setRangeImpValue(value);
    const [metValue, metUnit] = convertDistanceImpToMet(value, rangeImpUnit);
    setRangeMetValue(metValue);
    setRangeMetUnit(metUnit);
  };

  const setRangeImpUnitAndUpdateMet = (unit: string) => {
    setRangeImpUnit(unit);
    const [metValue, metUnit] = convertDistanceImpToMet(rangeImpValue, unit);
    setRangeMetValue(metValue);
    setRangeMetUnit(metUnit);
  };

  const setRangeMetValueAndUpdateImp = (value: number) => {
    setRangeMetValue(value);
    const [impValue, impUnit] = convertDistanceMetToImp(value, rangeMetUnit);
    setRangeImpValue(impValue);
    setRangeImpUnit(impUnit);
  };

  const setRangeMetUnitAndUpdateImp = (unit: string) => {
    setRangeMetUnit(unit);
    const [impValue, impUnit] = convertDistanceMetToImp(rangeMetValue, unit);
    setRangeImpValue(impValue);
    setRangeImpUnit(impUnit);
  };

  const error = errors["range"];
  const errorImpValue = errors["range_imp_value"];
  const errorImpUnit = errors["range_imp_unit"];
  const errorMetValue = errors["range_met_value"];
  const errorMetUnit = errors["range_met_unit"];

  return (
    <HStack align="flex-end" w="full">
      <Field disabled={disabled} flex={1} invalid={!!error} label={label}>
        <Select
          name="range"
          onValueChange={setRange}
          options={rangeOptions}
          value={range}
          withinDialog
        />
      </Field>
      {range === "value" && (
        <>
          <HStack h={10}>:</HStack>
          <Field disabled={disabled} invalid={!!errorImpValue} maxW="6em">
            <NumberInput
              min={0}
              name="range-imp-value"
              onValueChange={setRangeImpValueAndUpdateMet}
              value={rangeImpValue}
            />
          </Field>
          <Field disabled={disabled} invalid={!!errorImpUnit} maxW="7em">
            <Select
              name="range-imp-unit"
              onValueChange={setRangeImpUnitAndUpdateMet}
              options={distanceImpOptions}
              value={rangeImpUnit}
              withinDialog
            />
          </Field>
          <HStack h={10}>~</HStack>
          <Field disabled={disabled} invalid={!!errorMetValue} maxW="6em">
            <NumberInput
              min={0}
              name="range-met-value"
              onValueChange={setRangeMetValueAndUpdateImp}
              value={rangeMetValue}
            />
          </Field>
          <Field disabled={disabled} invalid={!!errorMetUnit} maxW="7em">
            <Select
              name="range-met-unit"
              onValueChange={setRangeMetUnitAndUpdateImp}
              options={distanceMetOptions}
              value={rangeMetUnit}
              withinDialog
            />
          </Field>
        </>
      )}
    </HStack>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Materials
//------------------------------------------------------------------------------

function SpellEditorMaterials({
  defaultMaterials,
  disabled,
  errors,
  label,
  placeholder,
}: {
  defaultMaterials: string;
  disabled: boolean;
  errors: Record<string, string>;
  label: string;
  placeholder: string;
}) {
  const [materials, setMaterials] = useState(defaultMaterials);
  const error = errors["materials"];

  return (
    <Field disabled={disabled} invalid={!!error} label={label}>
      <Input
        name="materials"
        onValueChange={setMaterials}
        placeholder={placeholder}
        value={materials}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Description
//------------------------------------------------------------------------------

function SpellEditorDescription({
  defaultDescription,
  disabled,
  errors,
  label,
  placeholder,
}: {
  defaultDescription: string;
  disabled: boolean;
  errors: Record<string, string>;
  label: string;
  placeholder: string;
}) {
  const [description, setDescription] = useState(defaultDescription);
  const error = errors["description"];

  return (
    <Field disabled={disabled} invalid={!!error} label={label}>
      <Textarea
        h="12em"
        name="description"
        onChange={(e) => setDescription(e.target.value)}
        placeholder={placeholder}
        value={description}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Upgrade
//------------------------------------------------------------------------------

function SpellEditorUpdate({
  defaultUpgrade,
  disabled,
  errors,
  label,
  placeholder,
}: {
  defaultUpgrade: string;
  disabled: boolean;
  errors: Record<string, string>;
  label: string;
  placeholder: string;
}) {
  const [upgrade, setUpgrade] = useState(defaultUpgrade);
  const error = errors["upgrade"];

  return (
    <Field disabled={disabled} invalid={!!error} label={label}>
      <Textarea
        name="upgrade"
        onChange={(e) => setUpgrade(e.target.value)}
        placeholder={placeholder}
        value={upgrade}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Save Spell
//------------------------------------------------------------------------------

async function saveSpell(
  id: string,
  lang: I18nLang,
  formData: FormData,
  { t }: I18nLangContextBag
): Promise<Record<string, string>> {
  const errors: Record<string, string> = {};

  const name = formData.get("name")?.toString()?.trim();
  if (!name) errors["name"] = t("name.error.empty");

  const level = parseInt(formData.get("level")?.toString() ?? "NaN");
  if (!level) errors["level"] = t("level.error.empty");

  const character_classes = formData
    .getAll("character-classes")
    .map((value) => value.toString());
  if (!character_classes.length)
    errors["character_classes"] = t("character_classes.error.empty");

  const school = formData.get("school")?.toString();
  if (!school) errors["school"] = t("school.error.empty");

  const casting_time = formData.get("casting-time")?.toString();
  if (!casting_time) errors["casting_time"] = t("casting_time.error.empty");

  const ctv = parseInt(formData.get("casting-time-value")?.toString() ?? "NaN");
  if (casting_time === "value" && ctv === undefined)
    errors["casting_time_value"] = t("casting_time.error.empty_value");

  const ctu = formData.get("casting-time-unit")?.toString();
  if (casting_time === "value" && ctu === undefined)
    errors["casting_time_unit"] = t("casting_time.error.empty_unit");

  const casting_time_value =
    casting_time === "value" && ctv !== undefined && ctu !== undefined
      ? `${ctv} ${ctu}`
      : undefined;

  const duration = formData.get("duration")?.toString();
  if (!duration) errors["duration"] = t("duration.error.empty");

  const dv = parseInt(formData.get("duration-value")?.toString() ?? "NaN");
  if (duration === "value" && dv === undefined)
    errors["duration_value"] = t("duration_value.error.empty_value");

  const du = formData.get("duration-unit")?.toString();
  if (duration === "value" && du === undefined)
    errors["duration_unit"] = t("duration_value.error.empty_unit");

  const duration_value =
    duration === "value" && dv === undefined && du === undefined
      ? `${dv} ${du}`
      : undefined;

  const range = formData.get("range")?.toString();
  if (!range) errors["range"] = t("range.error.empty");

  const riv = parseInt(formData.get("range-imp-value")?.toString() ?? "NaN");
  if (range === "value" && riv === undefined)
    errors["range_imp_value"] = t("range.error.empty_value");

  const riu = formData.get("range-imp-unit")?.toString();
  if (range === "value" && riu === undefined)
    errors["range_imp_unit"] = t("range.error.empty_unit");

  const range_value_imp =
    range === "value" && riv === undefined && riu === undefined
      ? `${riv} ${riu}`
      : undefined;

  const rmv = parseInt(formData.get("range-met-value")?.toString() ?? "NaN");
  if (range === "value" && rmv === undefined)
    errors["range_met_value"] = t("range.error.empty_value");

  const rmu = formData.get("range-met-value")?.toString();
  if (range === "value" && rmu === undefined)
    errors["range_met_unit"] = t("range.error.empty_unit");

  const range_value_met =
    range === "value" && rmv === undefined && rmu === undefined
      ? `${rmv} ${rmu}`
      : undefined;

  const ritual = formData.get("ritual")?.toString() === "on";
  const concentration = formData.get("concentration")?.toString() === "on";
  const verbal = formData.get("verbal")?.toString() === "on";
  const somatic = formData.get("somatic")?.toString() === "on";
  const material = formData.get("material")?.toString() === "on";

  const materials = material
    ? formData.get("materials")?.toString()?.trim() || undefined
    : undefined;

  if (material && !materials) errors["materials"] = t("materials.error.empty");

  const description = formData.get("description")?.toString()?.trim();
  if (!description) errors["description"] = t("description.error.empty");

  const upgrade = formData.get("upgrade")?.toString()?.trim() || undefined;

  if (Object.values(errors).length) {
    console.log(errors);
    return errors;
  }

  const spell = {
    casting_time,
    casting_time_value,
    character_classes,
    concentration,
    duration,
    duration_value,
    level,
    material,
    name: lang === "en" ? name : undefined,
    range,
    range_value_imp,
    range_value_met,
    ritual,
    school,
    somatic,
    verbal,
  } as unknown as Omit<Spell, "id">;

  const spellTranslation = {
    description,
    materials,
    name,
    upgrade,
  } as unknown as Omit<SpellTranslation, "spell_id" | "lang">;

  const res1 = await updateSpell(id, spell);
  const res2 = await updateSpellTranslation(id, lang, spellTranslation);
  console.log(res1);
  console.log(res2);
  return {};
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "name.label": {
    en: "Name",
    it: "Nome",
  },

  "name.placeholder": {
    en: "E.g.: Fireball",
    it: "Es: Palla di Fuoco",
  },

  "name.error.empty": {
    en: "The name cannot be empty",
    it: "Il nome non può essere vuoto",
  },

  "level.label": {
    en: "Level",
    it: "Livello",
  },

  "level.error.empty": {
    en: "The level cannot be empty",
    it: "Il livello non può essere vuoto",
  },

  "character_classes.label": {
    en: "Classes",
    it: "Classi",
  },

  "character_classes.error.empty": {
    en: "Classes cannot be empty",
    it: "Le classi non possono essere vuoto",
  },

  "school.label": {
    en: "School",
    it: "Scuola",
  },

  "school.error.empty": {
    en: "The school cannot be empty",
    it: "La scuola non può essere vuota",
  },

  "casting_time.label": {
    en: "Casting Time",
    it: "Tempo di Lancio",
  },

  "casting_time.error.empty": {
    en: "The casting time cannot be empty",
    it: "Il tempo di lancio non può essere vuoto",
  },

  "casting_time.error.empty_value": {
    en: "The value cannot be empty",
    it: "Il valore non può essere vuoto",
  },

  "casting_time.error.empty_unit": {
    en: "The unit cannot be empty",
    it: "L'unità non può essere vuota",
  },

  "duration.label": {
    en: "Duration",
    it: "Durata",
  },

  "duration.error.empty": {
    en: "The duration cannot be empty",
    it: "La durata non può essere vuota",
  },

  "duration.error.empty_value": {
    en: "The value cannot be empty",
    it: "Il valore non può essere vuoto",
  },

  "duration.error.empty_unit": {
    en: "The unit cannot be empty",
    it: "L'unità non può essere vuota",
  },

  "range.label": {
    en: "Range",
    it: "Gittata",
  },

  "range.error.empty": {
    en: "The range cannot be empty",
    it: "La gittata non può essere vuota",
  },

  "range.error.empty_imp_value": {
    en: "The value cannot be empty",
    it: "Il valore non può essere vuoto",
  },

  "range.error.empty_imp_unit": {
    en: "The unit cannot be empty",
    it: "L'unità non può essere vuota",
  },

  "range.error.empty_met_value": {
    en: "The value cannot be empty",
    it: "Il valore non può essere vuoto",
  },

  "range.error.empty_met_unit": {
    en: "The unit cannot be empty",
    it: "L'unità non può essere vuota",
  },

  "ritual.label": {
    en: "Ritual",
    it: "Rituale",
  },

  "concentration.label": {
    en: "Concentration",
    it: "Concentrazione",
  },

  "verbal.label": {
    en: "Verbal",
    it: "Verbale",
  },

  "somatic.label": {
    en: "Somatic",
    it: "Somatico",
  },

  "material.label": {
    en: "Material",
    it: "Materiale",
  },

  "materials.label": {
    en: "Materials",
    it: "Materiali",
  },

  "materials.placeholder": {
    en: "E.g.: A ball of bat guano and sulfur.",
    it: "Es: Una pallina di guano di pipistrello e zolfo.",
  },

  "materials.error.empty": {
    en: "The materials cannot be empty",
    it: "I materiali non possono essere vuoti",
  },

  "description.label": {
    en: "Effect",
    it: "Effetto",
  },

  "description.placeholder": {
    en: "E.g.: A bright streak flashes from you to a point you choose within range and then blossoms with a low roar into a fiery explosion. Each creature in a 20-foot-radius Sphere centered on that point makes a Dexterity saving throw, taking 8d6 Fire damage on a failed save or half as much damage on a successful one.\nFlammable objects in the area that aren't being worn or carried start burning.",
    it: "Es: Una scia di luce brillante parte dall'incantatore e sfreccia fino a un punto a sua scelta entro gittat, provocando un'esplosione infuocata con un profondo boato. Ogni creatura presente in una sfera del raggio di 6 metri e centrata su quel punto deve effettuare un tiro salvezza su Destrezza, subendo 8d6 danni da fuoco in caso di fallimento, o la metà di quei danni in caso di successo.\nGli oggetti infiammabili nell'area che non sono indossati o trasportati iniziano a bruciare.",
  },

  "description.error.empty": {
    en: "The effect cannot be empty",
    it: "L'effetto' non può essere vuoto",
  },

  "upgrade.label/*": {
    en: "At Higher Levels",
    it: "A Livelli Superiori",
  },

  "upgrade.label/0": {
    en: "Cantrip Upgrade",
    it: "Potenziamento del Trucchetto",
  },

  "upgrade.placeholder/*": {
    en: "No additional effect.",
    it: "Nessun effetto addizionale.",
  },

  "upgrade.placeholder/0": {
    en: "No upgrade.",
    it: "Nessun potenziamento.",
  },
};
