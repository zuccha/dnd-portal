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
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import {
  parseTime,
  useTimeUnitOptions,
} from "../../../../../../i18n/i18n-time";
import { useCharacterClassOptions } from "../../../../../../resources/character-class";
import type { Spell } from "../../../../../../resources/spell";
import { useSpellCastingTimeOptions } from "../../../../../../resources/spell-casting-time";
import { useSpellDurationOptions } from "../../../../../../resources/spell-duration";
import { useSpellLevelOptions } from "../../../../../../resources/spell-level";
import { useSpellRangeOptions } from "../../../../../../resources/spell-range";
import { useSpellSchoolOptions } from "../../../../../../resources/spell-school";
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
  ref,
  resource,
}: ResourceEditorContentProps<Spell>) {
  const { lang, t, tp } = useI18nLangContext(i18nContext);

  const [level, setLevel] = useState(resource.level);
  const [ritual, setRitual] = useState(resource.ritual);
  const [concentration, setConcentration] = useState(resource.concentration);
  const [verbal, setVerbal] = useState(resource.verbal);
  const [somatic, setSomatic] = useState(resource.somatic);
  const [material, setMaterial] = useState(resource.material);

  useImperativeHandle(ref, () => ({
    save: async (formData: FormData) => {
      for (const entry of formData.entries()) console.log(entry);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    },
  }));

  return (
    <VStack align="stretch" gap={4}>
      <HStack gap={4}>
        <SpellEditorName
          defaultName={resource.name[lang] ?? ""}
          disabled={disabled}
          label={t("name.label")}
          placeholder={t("name.placeholder")}
        />
        <SpellEditorLevel
          disabled={disabled}
          label={t("level.label")}
          level={level}
          onLevelChange={setLevel}
        />
      </HStack>

      <HStack gap={4}>
        <SpellEditorCharacterClasses
          defaultCharacterClasses={resource.character_classes}
          disabled={disabled}
          label={t("character_classes.label")}
        />
        <SpellEditorSchool
          defaultSchool={resource.school}
          disabled={disabled}
          label={t("school.label")}
        />
      </HStack>

      <HStack gap={4}>
        <SpellEditorCastingTime
          defaultCastingTime={resource.casting_time}
          defaultCastingTimeValue={resource.casting_time_value}
          disabled={disabled}
          label={t("casting_time.label")}
        />

        <SpellEditorDuration
          defaultDuration={resource.duration}
          defaultDurationValue={resource.duration_value}
          disabled={disabled}
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
          label={t("materials.label")}
          placeholder={t("materials.placeholder")}
        />
      )}

      <SpellEditorDescription
        defaultDescription={resource.description[lang] ?? ""}
        disabled={disabled}
        label={t("description.label")}
        placeholder={t("description.placeholder")}
      />

      <SpellEditorUpdate
        defaultUpdate={resource.upgrade?.[lang] ?? ""}
        disabled={disabled}
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
  label,
  placeholder,
}: {
  defaultName: string;
  disabled: boolean;
  label: string;
  placeholder: string;
}) {
  const [name, setName] = useState(defaultName);
  return (
    <Field disabled={disabled} label={label}>
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
  label,
  level,
  onLevelChange,
}: {
  disabled: boolean;
  label: string;
  level: Spell["level"];
  onLevelChange: (level: Spell["level"]) => void;
}) {
  const levelOptions = useListCollection(useSpellLevelOptions());

  return (
    <Field disabled={disabled} label={label} maxW="5em">
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
  label,
}: {
  defaultCharacterClasses: Spell["character_classes"];
  disabled: boolean;
  label: string;
}) {
  const characterClassOptions = useListCollection(useCharacterClassOptions());
  const [characterClasses, setCharacterClasses] = useState(
    defaultCharacterClasses
  );

  return (
    <Field disabled={disabled} label={label}>
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
  label,
}: {
  defaultSchool: Spell["school"];
  disabled: boolean;
  label: string;
}) {
  const schoolOptions = useListCollection(useSpellSchoolOptions());
  const [school, setSchool] = useState(defaultSchool);

  return (
    <Field disabled={disabled} label={label}>
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
  label,
}: {
  defaultCastingTime: Spell["casting_time"];
  defaultCastingTimeValue: string | null | undefined;
  disabled: boolean;
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

  return (
    <HStack align="flex-end" w="full">
      <Field disabled={disabled} flex={1} label={label}>
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
          <Field disabled={disabled} maxW="6em">
            <NumberInput
              min={0}
              name="casting-time-value"
              onValueChange={setCastingTimeValue}
              value={castingTimeValue}
            />
          </Field>
          <Field disabled={disabled} maxW="7em">
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
  label,
}: {
  defaultDuration: Spell["duration"];
  defaultDurationValue: string | null | undefined;
  disabled: boolean;
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

  return (
    <HStack align="flex-end" w="full">
      <Field disabled={disabled} flex={1} label={label}>
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
          <Field disabled={disabled} maxW="6em">
            <NumberInput
              min={0}
              name="duration-value"
              onValueChange={setDurationValue}
              value={durationValue}
            />
          </Field>
          <Field disabled={disabled} maxW="7em">
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
// Spell Editor Duration
//------------------------------------------------------------------------------

function SpellEditorRange({
  defaultRange,
  defaultRangeImpValue,
  defaultRangeMetValue,
  disabled,
  label,
}: {
  defaultRange: Spell["range"];
  defaultRangeImpValue: string | null | undefined;
  defaultRangeMetValue: string | null | undefined;
  disabled: boolean;
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

  return (
    <HStack align="flex-end" w="full">
      <Field disabled={disabled} flex={1} label={label}>
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
          <Field disabled={disabled} maxW="6em">
            <NumberInput
              min={0}
              name="range-imp-value"
              onValueChange={setRangeImpValueAndUpdateMet}
              value={rangeImpValue}
            />
          </Field>
          <Field disabled={disabled} maxW="7em">
            <Select
              name="range-imp-unit"
              onValueChange={setRangeImpUnitAndUpdateMet}
              options={distanceImpOptions}
              value={rangeImpUnit}
              withinDialog
            />
          </Field>
          <HStack h={10}>~</HStack>
          <Field disabled={disabled} maxW="6em">
            <NumberInput
              min={0}
              name="range-met-value"
              onValueChange={setRangeMetValueAndUpdateImp}
              value={rangeMetValue}
            />
          </Field>
          <Field disabled={disabled} maxW="7em">
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
  label,
  placeholder,
}: {
  defaultMaterials: string;
  disabled: boolean;
  label: string;
  placeholder: string;
}) {
  const [materials, setMaterials] = useState(defaultMaterials);

  return (
    <Field disabled={disabled} label={label}>
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
  label,
  placeholder,
}: {
  defaultDescription: string;
  disabled: boolean;
  label: string;
  placeholder: string;
}) {
  const [description, setDescription] = useState(defaultDescription);

  return (
    <Field disabled={disabled} label={label}>
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
// Spell Editor Update
//------------------------------------------------------------------------------

function SpellEditorUpdate({
  defaultUpdate,
  disabled,
  label,
  placeholder,
}: {
  defaultUpdate: string;
  disabled: boolean;
  label: string;
  placeholder: string;
}) {
  const [update, setUpdate] = useState(defaultUpdate);

  return (
    <Field disabled={disabled} label={label}>
      <Textarea
        name="update"
        onChange={(e) => setUpdate(e.target.value)}
        placeholder={placeholder}
        value={update}
      />
    </Field>
  );
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

  "level.label": {
    en: "Level",
    it: "Livello",
  },

  "character_classes.label": {
    en: "Classes",
    it: "Classi",
  },

  "school.label": {
    en: "School",
    it: "Scuola",
  },

  "casting_time.label": {
    en: "Casting Time",
    it: "Tempo di Lancio",
  },

  "duration.label": {
    en: "Duration",
    it: "Durata",
  },

  "range.label": {
    en: "Range",
    it: "Gittata",
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

  "description.label": {
    en: "Effect",
    it: "Effetto",
  },

  "description.placeholder": {
    en: "E.g.: A bright streak flashes from you to a point you choose within range and then blossoms with a low roar into a fiery explosion. Each creature in a 20-foot-radius Sphere centered on that point makes a Dexterity saving throw, taking 8d6 Fire damage on a failed save or half as much damage on a successful one.\nFlammable objects in the area that aren't being worn or carried start burning.",
    it: "Es: Una scia di luce brillante parte dall'incantatore e sfreccia fino a un punto a sua scelta entro gittat, provocando un'esplosione infuocata con un profondo boato. Ogni creatura presente in una sfera del raggio di 6 metri e centrata su quel punto deve effettuare un tiro salvezza su Destrezza, subendo 8d6 danni da fuoco in caso di fallimento, o la metà di quei danni in caso di successo.\nGli oggetti infiammabili nell'area che non sono indossati o trasportati iniziano a bruciare.",
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
