import { HStack, Text, VStack } from "@chakra-ui/react";
import useListCollection from "../../../../../../hooks/use-list-collection";
import {
  convertDistanceImpToMet,
  convertDistanceMetToImp,
  distanceImpUnits,
  distanceMetUnits,
  parseDistanceImp,
  parseDistanceMet,
  useDistanceImpUnitOptions,
  useDistanceMetUnitOptions,
} from "../../../../../../i18n/i18n-distance";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import {
  parseTime,
  timeUnits,
  useTimeUnitOptions,
} from "../../../../../../i18n/i18n-time";
import { useCharacterClassOptions } from "../../../../../../resources/character-class";
import { type Spell } from "../../../../../../resources/spell";
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
import Textarea from "../../../../../../ui/textarea";
import type { ResourceEditorContentProps } from "../resources/resource-editor";
import {
  useSpellEditorFormCastingTime,
  useSpellEditorFormCastingTimeUnit,
  useSpellEditorFormCastingTimeValue,
  useSpellEditorFormCharacterClasses,
  useSpellEditorFormDescription,
  useSpellEditorFormDuration,
  useSpellEditorFormDurationUnit,
  useSpellEditorFormDurationValue,
  useSpellEditorFormField,
  useSpellEditorFormLevel,
  useSpellEditorFormMaterials,
  useSpellEditorFormName,
  useSpellEditorFormRange,
  useSpellEditorFormRangeImpUnit,
  useSpellEditorFormRangeImpValue,
  useSpellEditorFormRangeMetUnit,
  useSpellEditorFormRangeMetValue,
  useSpellEditorFormSchool,
  useSpellEditorFormSubmitError,
  useSpellEditorFormUpgrade,
} from "./spell-editor-form";

//------------------------------------------------------------------------------
// Spell Editor
//------------------------------------------------------------------------------

export default function SpellEditor({
  resource,
}: ResourceEditorContentProps<Spell>) {
  const langContextBag = useI18nLangContext(i18nContext);
  const { lang, t } = langContextBag;

  const submitError = useSpellEditorFormSubmitError();

  const ritual = useSpellEditorFormField("ritual", resource.ritual);
  const concentration = useSpellEditorFormField(
    "concentration",
    resource.concentration
  );

  const verbal = useSpellEditorFormField("verbal", resource.verbal);
  const somatic = useSpellEditorFormField("somatic", resource.somatic);
  const material = useSpellEditorFormField("material", resource.material);

  return (
    <VStack align="stretch" gap={4}>
      <HStack align="flex-start" gap={4}>
        <SpellEditorName defaultName={resource.name[lang] ?? ""} />
        <SpellEditorLevel defaultLevel={resource.level} />
      </HStack>

      <HStack align="flex-start" gap={4}>
        <SpellEditorCharacterClasses
          defaultCharacterClasses={resource.character_classes}
        />
        <SpellEditorSchool defaultSchool={resource.school} />
      </HStack>

      <HStack align="flex-start" gap={4}>
        <SpellEditorCastingTime
          defaultCastingTime={resource.casting_time}
          defaultCastingTimeValue={resource.casting_time_value}
        />
        <SpellEditorDuration
          defaultDuration={resource.duration}
          defaultDurationValue={resource.duration_value}
        />
      </HStack>

      <HStack gap={4}>
        <Switch flex={1} label={t("ritual.label")} size="lg" {...ritual} />
        <Switch
          flex={1}
          label={t("concentration.label")}
          size="lg"
          {...concentration}
        />
      </HStack>

      <SpellEditorRange
        defaultRange={resource.range}
        defaultRangeImpValue={resource.range_value_imp}
        defaultRangeMetValue={resource.range_value_met}
      />

      <HStack gap={8}>
        <Switch label={t("verbal.label")} size="lg" {...verbal} />
        <Switch label={t("somatic.label")} size="lg" {...somatic} />
        <Switch label={t("material.label")} size="lg" {...material} />
      </HStack>

      {material.value && (
        <SpellEditorMaterials
          defaultMaterials={resource.materials?.[lang] ?? ""}
        />
      )}

      <SpellEditorDescription
        defaultDescription={resource.description[lang] ?? ""}
      />

      <SpellEditorUpgrade
        defaultLevel={resource.level}
        defaultUpgrade={resource.upgrade?.[lang] ?? ""}
      />

      {submitError && (
        <Text color="fg.error" fontSize="md">
          {t(submitError)}
        </Text>
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Name
//------------------------------------------------------------------------------

function SpellEditorName({ defaultName }: { defaultName: string }) {
  const { disabled, error, ...rest } = useSpellEditorFormName(defaultName);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field disabled={disabled} error={message} label={t("name.label")}>
      <Input autoComplete="off" placeholder={t("name.placeholder")} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Level
//------------------------------------------------------------------------------

function SpellEditorLevel({ defaultLevel }: { defaultLevel: Spell["level"] }) {
  const levelOptions = useListCollection(useSpellLevelOptions());
  const { disabled, error, onValueChange, value, ...rest } =
    useSpellEditorFormLevel(defaultLevel);
  const { t } = useI18nLangContext(i18nContext);
  const label = t("level.label");

  return (
    <Field disabled={disabled} invalid={!!error} label={label} maxW="5em">
      <Select
        {...rest}
        onValueChange={(level) => onValueChange(parseInt(level))}
        options={levelOptions}
        value={`${value}`}
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
}: {
  defaultCharacterClasses: Spell["character_classes"];
}) {
  const characterClassOptions = useListCollection(useCharacterClassOptions());
  const { disabled, error, ...rest } = useSpellEditorFormCharacterClasses(
    defaultCharacterClasses
  );
  const { t } = useI18nLangContext(i18nContext);
  const label = t("character_classes.label");
  const message = error ? t(error) : undefined;

  return (
    <Field disabled={disabled} error={message} label={label}>
      <Select multiple options={characterClassOptions} withinDialog {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Spell Editor School
//------------------------------------------------------------------------------

function SpellEditorSchool({
  defaultSchool,
}: {
  defaultSchool: Spell["school"];
}) {
  const schoolOptions = useListCollection(useSpellSchoolOptions());
  const { disabled, error, ...rest } = useSpellEditorFormSchool(defaultSchool);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field disabled={disabled} error={message} label={t("school.label")}>
      <Select options={schoolOptions} withinDialog {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Casting Time
//------------------------------------------------------------------------------

function SpellEditorCastingTime({
  defaultCastingTime,
  defaultCastingTimeValue,
}: {
  defaultCastingTime: Spell["casting_time"];
  defaultCastingTimeValue: string | null | undefined;
}) {
  const castingTimeOptions = useListCollection(useSpellCastingTimeOptions());
  const { disabled, error, ...rest } =
    useSpellEditorFormCastingTime(defaultCastingTime);
  const { t } = useI18nLangContext(i18nContext);
  const label = t("casting_time.label");
  const message = error ? t(error) : undefined;

  return (
    <HStack align="flex-end" w="full">
      <Field disabled={disabled} error={message} flex={1} label={label}>
        <Select options={castingTimeOptions} withinDialog {...rest} />
      </Field>
      {rest.value === "value" && (
        <SpellEditorCastingTimeValue
          defaultCastingTimeValue={defaultCastingTimeValue}
        />
      )}
    </HStack>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Casting Time Value
//------------------------------------------------------------------------------

function SpellEditorCastingTimeValue({
  defaultCastingTimeValue,
}: {
  defaultCastingTimeValue: string | null | undefined;
}) {
  const timeUnitOptions = useListCollection(useTimeUnitOptions());

  const [initialCastingTimeValue, initialCastingTimeUnit] = parseTime(
    defaultCastingTimeValue ?? "0 min"
  ) ?? [0, "min"];

  const castingTimeValue = useSpellEditorFormCastingTimeValue(
    initialCastingTimeValue
  );
  const castingTimeUnit = useSpellEditorFormCastingTimeUnit(
    initialCastingTimeUnit
  );

  return (
    <>
      <HStack h={10}>:</HStack>
      <Field
        disabled={castingTimeValue.disabled}
        invalid={!!castingTimeValue.error}
        maxW="6em"
      >
        <NumberInput min={0} {...castingTimeValue} />
      </Field>
      <Field
        disabled={castingTimeUnit.disabled}
        invalid={!!castingTimeUnit.error}
        maxW="7em"
      >
        <Select options={timeUnitOptions} withinDialog {...castingTimeUnit} />
      </Field>
    </>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Duration
//------------------------------------------------------------------------------

function SpellEditorDuration({
  defaultDuration,
  defaultDurationValue,
}: {
  defaultDuration: Spell["duration"];
  defaultDurationValue: string | null | undefined;
}) {
  const durationOptions = useListCollection(useSpellDurationOptions());
  const { disabled, error, ...rest } =
    useSpellEditorFormDuration(defaultDuration);
  const { t } = useI18nLangContext(i18nContext);
  const label = t("duration.label");
  const message = error ? t(error) : undefined;

  return (
    <HStack align="flex-end" w="full">
      <Field disabled={disabled} error={message} flex={1} label={label}>
        <Select options={durationOptions} withinDialog {...rest} />
      </Field>
      {rest.value === "value" && (
        <SpellEditorDurationValue defaultDurationValue={defaultDurationValue} />
      )}
    </HStack>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Duration Value
//------------------------------------------------------------------------------

function SpellEditorDurationValue({
  defaultDurationValue,
}: {
  defaultDurationValue: string | null | undefined;
}) {
  const timeUnitOptions = useListCollection(useTimeUnitOptions());

  const [initialDurationValue, initialDurationUnit] = parseTime(
    defaultDurationValue ?? "0 min"
  ) ?? [0, "min"];

  const durationValue = useSpellEditorFormDurationValue(initialDurationValue);
  const durationUnit = useSpellEditorFormDurationUnit(initialDurationUnit);

  return (
    <>
      <HStack h={10}>:</HStack>
      <Field
        disabled={durationValue.disabled}
        invalid={!!durationValue.error}
        maxW="6em"
      >
        <NumberInput min={0} {...durationValue} />
      </Field>
      <Field
        disabled={durationUnit.disabled}
        invalid={!!durationUnit.error}
        maxW="7em"
      >
        <Select options={timeUnitOptions} withinDialog {...durationUnit} />
      </Field>
    </>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Range
//------------------------------------------------------------------------------

function SpellEditorRange({
  defaultRange,
  defaultRangeImpValue,
  defaultRangeMetValue,
}: {
  defaultRange: Spell["range"];
  defaultRangeImpValue: string | null | undefined;
  defaultRangeMetValue: string | null | undefined;
}) {
  const rangeOptions = useListCollection(useSpellRangeOptions());
  const { disabled, error, ...rest } = useSpellEditorFormRange(defaultRange);
  const { t } = useI18nLangContext(i18nContext);
  const label = t("range.label");
  const message = error ? t(error) : undefined;

  return (
    <HStack align="flex-end" w="full">
      <Field disabled={disabled} error={message} flex={1} label={label}>
        <Select options={rangeOptions} withinDialog {...rest} />
      </Field>
      {rest.value === "value" && (
        <SpellEditorRangeValues
          defaultRangeImpValue={defaultRangeImpValue}
          defaultRangeMetValue={defaultRangeMetValue}
        />
      )}
    </HStack>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Range Values
//------------------------------------------------------------------------------

function SpellEditorRangeValues({
  defaultRangeImpValue,
  defaultRangeMetValue,
}: {
  defaultRangeImpValue: string | null | undefined;
  defaultRangeMetValue: string | null | undefined;
}) {
  const distanceImpOptions = useListCollection(useDistanceImpUnitOptions());
  const distanceMetOptions = useListCollection(useDistanceMetUnitOptions());

  const [defaultImpValue, defaultImpUnit] = parseDistanceImp(
    defaultRangeImpValue ?? "0 ft"
  ) ?? [0, "ft"];

  const [defaultMetValue, defaultMetUnit] = parseDistanceMet(
    defaultRangeMetValue ?? "0 m"
  ) ?? [0, "m"];

  const impValue = useSpellEditorFormRangeImpValue(defaultImpValue);
  const impUnit = useSpellEditorFormRangeImpUnit(defaultImpUnit);

  const metValue = useSpellEditorFormRangeMetValue(defaultMetValue);
  const metUnit = useSpellEditorFormRangeMetUnit(defaultMetUnit);

  const setRangeImpValueAndUpdateMet = (value: number) => {
    impValue.onValueChange(value);
    const [mv, mu] = convertDistanceImpToMet(value, impUnit.value);
    metValue.onValueChange(mv);
    metUnit.onValueChange(mu);
  };

  const setRangeImpUnitAndUpdateMet = (unit: string) => {
    impUnit.onValueChange(unit);
    const [mv, mu] = convertDistanceImpToMet(impValue.value, unit);
    metValue.onValueChange(mv);
    metUnit.onValueChange(mu);
  };

  const setRangeMetValueAndUpdateImp = (value: number) => {
    metValue.onValueChange(value);
    const [iv, iu] = convertDistanceMetToImp(value, metUnit.value);
    impValue.onValueChange(iv);
    impUnit.onValueChange(iu);
  };

  const setRangeMetUnitAndUpdateImp = (unit: string) => {
    metUnit.onValueChange(unit);
    const [iv, iu] = convertDistanceMetToImp(metValue.value, unit);
    impValue.onValueChange(iv);
    impUnit.onValueChange(iu);
  };

  return (
    <>
      <HStack h={10}>:</HStack>
      <Field disabled={impValue.disabled} invalid={!!impValue.error} maxW="6em">
        <NumberInput
          min={0}
          {...impValue}
          onValueChange={setRangeImpValueAndUpdateMet}
        />
      </Field>
      <Field disabled={impUnit.disabled} invalid={!!impUnit.error} maxW="7em">
        <Select
          options={distanceImpOptions}
          withinDialog
          {...impUnit}
          onValueChange={setRangeImpUnitAndUpdateMet}
        />
      </Field>
      <HStack h={10}>~</HStack>
      <Field disabled={metValue.disabled} invalid={!!metValue.error} maxW="6em">
        <NumberInput
          min={0}
          {...metValue}
          onValueChange={setRangeMetValueAndUpdateImp}
        />
      </Field>
      <Field disabled={metUnit.disabled} invalid={!!metUnit.error} maxW="7em">
        <Select
          options={distanceMetOptions}
          withinDialog
          {...metUnit}
          onValueChange={setRangeMetUnitAndUpdateImp}
        />
      </Field>
    </>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Materials
//------------------------------------------------------------------------------

function SpellEditorMaterials({
  defaultMaterials,
}: {
  defaultMaterials: string;
}) {
  const { disabled, error, ...rest } =
    useSpellEditorFormMaterials(defaultMaterials);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field disabled={disabled} error={message} label={t("materials.label")}>
      <Input placeholder={t("materials.placeholder")} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Description
//------------------------------------------------------------------------------

function SpellEditorDescription({
  defaultDescription,
}: {
  defaultDescription: string;
}) {
  const { disabled, error, ...rest } =
    useSpellEditorFormDescription(defaultDescription);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field disabled={disabled} error={message} label={t("description.label")}>
      <Textarea {...rest} h="12em" placeholder={t("description.placeholder")} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Upgrade
//------------------------------------------------------------------------------

function SpellEditorUpgrade({
  defaultLevel,
  defaultUpgrade,
}: {
  defaultLevel: number;
  defaultUpgrade: string;
}) {
  const { disabled, error, ...rest } =
    useSpellEditorFormUpgrade(defaultUpgrade);
  const { value: level } = useSpellEditorFormLevel(defaultLevel);
  const { t, tp } = useI18nLangContext(i18nContext);
  const label = tp("upgrade.label", level);
  const message = error ? t(error) : undefined;

  return (
    <Field disabled={disabled} error={message} label={label}>
      <Textarea placeholder={tp("upgrade.placeholder", level)} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "form.error.invalid_spell": {
    en: "The inserted data is not valid.",
    it: "I dati inseriti non sono validi.",
  },

  "form.error.invalid_translation": {
    en: "The inserted data is not valid.",
    it: "I dati inseriti non sono validi.",
  },

  "form.error.update_spell_failure": {
    en: "Failed to update the spell.",
    it: "Errore durante il salvataggio.",
  },

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

  "school.label": {
    en: "School",
    it: "Scuola",
  },

  "casting_time.label": {
    en: "Casting Time",
    it: "Tempo di Lancio",
  },

  "casting_time_value.error.invalid": {
    en: "The value cannot be less than zero",
    it: "Il valore non può essere minore di zero",
  },

  "casting_time_unit.error.empty": {
    en: "The unit cannot be empty",
    it: "L'unità non può essere vuota",
  },

  "casting_time_unit.error.invalid": {
    en: `The unit must be one of: ${timeUnits.join(", ")}`,
    it: `L'unità dev'essere una tra: ${timeUnits.join(", ")}`,
  },

  "duration.label": {
    en: "Duration",
    it: "Durata",
  },

  "duration_value.error.invalid": {
    en: "The value cannot be empty",
    it: "Il valore non può essere vuoto",
  },

  "duration_unit.error.empty": {
    en: "The unit cannot be empty",
    it: "L'unità non può essere vuota",
  },

  "duration_unit.error.invalid": {
    en: `The unit must be one of: ${timeUnits.join(", ")}`,
    it: `L'unità dev'essere una tra: ${timeUnits.join(", ")}`,
  },

  "range.label": {
    en: "Range",
    it: "Gittata",
  },

  "range_imp_value.error.invalid": {
    en: "The value cannot be empty",
    it: "Il valore non può essere vuoto",
  },

  "range_imp_unit.error.empty": {
    en: "The unit cannot be empty",
    it: "L'unità non può essere vuota",
  },

  "range_imp_unit.error.invalid": {
    en: `The unit must be one of: ${distanceImpUnits.join(", ")}`,
    it: `L'unità dev'essere una tra: ${distanceImpUnits.join(", ")}`,
  },

  "range_met_value.error.invalid": {
    en: "The value cannot be empty",
    it: "Il valore non può essere vuoto",
  },

  "range_met_unit.error.empty": {
    en: "The unit cannot be empty",
    it: "L'unità non può essere vuota",
  },

  "range_met_unit.error.invalid": {
    en: `The unit must be one of: ${distanceMetUnits.join(", ")}`,
    it: `L'unità dev'essere una tra: ${distanceMetUnits.join(", ")}`,
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
    it: "Es: Una scia di luce brillante parte dall'incantatore e sfreccia fino a un punto a sua scelta entro gittata, provocando un'esplosione infuocata con un profondo boato. Ogni creatura presente in una sfera del raggio di 6 metri e centrata su quel punto deve effettuare un tiro salvezza su Destrezza, subendo 8d6 danni da fuoco in caso di fallimento, o la metà di quei danni in caso di successo.\nGli oggetti infiammabili nell'area che non sono indossati o trasportati iniziano a bruciare.",
  },

  "description.error.empty": {
    en: "The effect cannot be empty",
    it: "L'effetto non può essere vuoto",
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
