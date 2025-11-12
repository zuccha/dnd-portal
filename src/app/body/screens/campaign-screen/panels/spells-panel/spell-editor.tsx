import { Box, HStack, VStack } from "@chakra-ui/react";
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
import { useI18nSystem } from "../../../../../../i18n/i18n-system";
import {
  parseTime,
  useTimeUnitOptions,
} from "../../../../../../i18n/i18n-time";
import { type Spell } from "../../../../../../resources/spells/spell";
import { useCampaignRoleOptions } from "../../../../../../resources/types/campaign-role";
import { useCharacterClassOptions } from "../../../../../../resources/types/character-class";
import { useSpellCastingTimeOptions } from "../../../../../../resources/types/spell-casting-time";
import { useSpellDurationOptions } from "../../../../../../resources/types/spell-duration";
import { useSpellLevelOptions } from "../../../../../../resources/types/spell-level";
import { useSpellRangeOptions } from "../../../../../../resources/types/spell-range";
import { useSpellSchoolOptions } from "../../../../../../resources/types/spell-school";
import Field from "../../../../../../ui/field";
import Input from "../../../../../../ui/input";
import MeasureInput from "../../../../../../ui/measure-input";
import Select from "../../../../../../ui/select";
import Switch from "../../../../../../ui/switch";
import Textarea from "../../../../../../ui/textarea";
import {
  useSpellEditorFormCastingTime,
  useSpellEditorFormCastingTimeValue,
  useSpellEditorFormCharacterClasses,
  useSpellEditorFormDescription,
  useSpellEditorFormDuration,
  useSpellEditorFormDurationValue,
  useSpellEditorFormField,
  useSpellEditorFormLevel,
  useSpellEditorFormMaterials,
  useSpellEditorFormName,
  useSpellEditorFormRange,
  useSpellEditorFormRangeValueImp,
  useSpellEditorFormRangeValueMet,
  useSpellEditorFormSchool,
  useSpellEditorFormUpgrade,
  useSpellEditorFormVisibility,
} from "./spell-editor-form";

//------------------------------------------------------------------------------
// Spell Editor
//------------------------------------------------------------------------------

export type SpellEditorProps = {
  resource: Spell;
};

export default function SpellEditor({ resource }: SpellEditorProps) {
  const { lang, t } = useI18nLangContext(i18nContext);

  const ritual = useSpellEditorFormField("ritual", resource.ritual);
  const concentration = useSpellEditorFormField(
    "concentration",
    resource.concentration,
  );

  const verbal = useSpellEditorFormField("verbal", resource.verbal);
  const somatic = useSpellEditorFormField("somatic", resource.somatic);
  const material = useSpellEditorFormField("material", resource.material);

  return (
    <VStack align="stretch" gap={4}>
      <HStack align="flex-start" gap={4}>
        <SpellEditorName defaultName={resource.name[lang] ?? ""} />
        <SpellEditorLevel defaultLevel={resource.level} />
        <SpellEditorVisibility defaultVisibility={resource.visibility} />
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
          defaultCastingTimeValue={resource.casting_time_value ?? "0 min"}
        />
        <SpellEditorDuration
          defaultDuration={resource.duration}
          defaultDurationValue={resource.duration_value ?? "0 min"}
        />
      </HStack>

      <HStack gap={4}>
        <Box flex={1}>
          <Switch label={t("ritual.label")} size="lg" {...ritual} />
        </Box>
        <Box flex={1}>
          <Switch
            label={t("concentration.label")}
            size="lg"
            {...concentration}
          />
        </Box>
      </HStack>

      <SpellEditorRange
        defaultRange={resource.range}
        defaultRangeValueImp={resource.range_value_imp ?? "0 ft"}
        defaultRangeValueMet={resource.range_value_met ?? "0 m"}
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
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Name
//------------------------------------------------------------------------------

function SpellEditorName({ defaultName }: { defaultName: string }) {
  const { error, ...rest } = useSpellEditorFormName(defaultName);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("name.label")}>
      <Input autoComplete="off" placeholder={t("name.placeholder")} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Level
//------------------------------------------------------------------------------

function SpellEditorLevel({ defaultLevel }: { defaultLevel: Spell["level"] }) {
  const levelOptions = useListCollection(useSpellLevelOptions());
  const level = useSpellEditorFormLevel(defaultLevel);
  const { t } = useI18nLangContext(i18nContext);

  return (
    <Field label={t("level.label")} maxW="5em">
      <Select
        {...level}
        onValueChange={(value) => level.onValueChange(parseInt(value))}
        options={levelOptions}
        value={`${level.value}`}
        withinDialog
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Visibility
//------------------------------------------------------------------------------

function SpellEditorVisibility({
  defaultVisibility,
}: {
  defaultVisibility: Spell["visibility"];
}) {
  const visibilityOptions = useListCollection(useCampaignRoleOptions());
  const { error, ...rest } = useSpellEditorFormVisibility(defaultVisibility);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("visibility.label")} maxW="10em">
      <Select options={visibilityOptions} withinDialog {...rest} />
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
  const { error, ...rest } = useSpellEditorFormCharacterClasses(
    defaultCharacterClasses,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("character_classes.label")}>
      <Select
        multiple
        options={characterClassOptions}
        placeholder={t("character_classes.placeholder")}
        withinDialog
        {...rest}
      />
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
  const { error, ...rest } = useSpellEditorFormSchool(defaultSchool);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("school.label")}>
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
  defaultCastingTimeValue: string;
}) {
  const castingTimeOptions = useListCollection(useSpellCastingTimeOptions());
  const { error, ...rest } = useSpellEditorFormCastingTime(defaultCastingTime);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <HStack align="flex-end" w="full">
      <Field error={message} flex={1} label={t("casting_time.label")}>
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
  defaultCastingTimeValue: string;
}) {
  const timeUnitOptions = useTimeUnitOptions();
  const value = useSpellEditorFormCastingTimeValue(defaultCastingTimeValue);

  return (
    <Field maxW="9em">
      <MeasureInput
        min={0}
        onParse={parseTime}
        unitOptions={timeUnitOptions}
        {...value}
      />
    </Field>
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
  defaultDurationValue: string;
}) {
  const durationOptions = useListCollection(useSpellDurationOptions());
  const { error, ...rest } = useSpellEditorFormDuration(defaultDuration);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <HStack align="flex-end" w="full">
      <Field error={message} flex={1} label={t("duration.label")}>
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
  defaultDurationValue: string;
}) {
  const timeUnitOptions = useTimeUnitOptions();
  const durationValue = useSpellEditorFormDurationValue(defaultDurationValue);

  return (
    <Field maxW="9em">
      <MeasureInput
        min={0}
        onParse={parseTime}
        unitOptions={timeUnitOptions}
        {...durationValue}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Range
//------------------------------------------------------------------------------

function SpellEditorRange({
  defaultRange,
  defaultRangeValueImp,
  defaultRangeValueMet,
}: {
  defaultRange: Spell["range"];
  defaultRangeValueImp: string;
  defaultRangeValueMet: string;
}) {
  const rangeOptions = useListCollection(useSpellRangeOptions());
  const { error, ...rest } = useSpellEditorFormRange(defaultRange);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <HStack align="flex-end" w="full">
      <Field error={message} flex={1} label={t("range.label")}>
        <Select options={rangeOptions} withinDialog {...rest} />
      </Field>
      {rest.value === "value" && (
        <SpellEditorRangeValues
          defaultRangeValueImp={defaultRangeValueImp}
          defaultRangeValueMet={defaultRangeValueMet}
        />
      )}
    </HStack>
  );
}

//------------------------------------------------------------------------------
// Spell Editor Range Values
//------------------------------------------------------------------------------

function SpellEditorRangeValues({
  defaultRangeValueImp,
  defaultRangeValueMet,
}: {
  defaultRangeValueImp: string;
  defaultRangeValueMet: string;
}) {
  const [system] = useI18nSystem();

  const distanceImpOptions = useDistanceImpUnitOptions();
  const distanceMetOptions = useDistanceMetUnitOptions();

  const rangeValueImp = useSpellEditorFormRangeValueImp(defaultRangeValueImp);
  const rangeValueMet = useSpellEditorFormRangeValueMet(defaultRangeValueMet);

  const setRangeImpValue = (value: string) => {
    rangeValueImp.onValueChange(value);
    const [iv, iu] = parseDistanceImp(value);
    const [mv, mu] = convertDistanceImpToMet(iv, iu);
    rangeValueMet.onValueChange(`${mv} ${mu}`);
  };

  const setRangeMetValue = (value: string) => {
    rangeValueMet.onValueChange(value);
    const [mv, mu] = parseDistanceMet(value);
    const [iv, iu] = convertDistanceMetToImp(mv, mu);
    rangeValueImp.onValueChange(`${iv} ${iu}`);
  };

  const metric = system === "metric";
  const imperial = system === "imperial";

  return (
    <>
      <Field hidden={metric} maxW="9em">
        <MeasureInput
          min={0}
          onParse={parseDistanceImp}
          unitOptions={distanceImpOptions}
          {...rangeValueImp}
          onValueChange={setRangeImpValue}
        />
      </Field>
      <Field hidden={imperial} maxW="9em">
        <MeasureInput
          min={0}
          onParse={parseDistanceMet}
          unitOptions={distanceMetOptions}
          {...rangeValueMet}
          onValueChange={setRangeMetValue}
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
  const { error, ...rest } = useSpellEditorFormMaterials(defaultMaterials);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("materials.label")}>
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
  const { error, ...rest } = useSpellEditorFormDescription(defaultDescription);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("description.label")}>
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
  const { error, ...rest } = useSpellEditorFormUpgrade(defaultUpgrade);
  const { value: level } = useSpellEditorFormLevel(defaultLevel);
  const { t, tp } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={tp("upgrade.label", level)}>
      <Textarea placeholder={tp("upgrade.placeholder", level)} {...rest} />
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

  "visibility.label": {
    en: "Visibility",
    it: "Visibilità",
  },

  "character_classes.label": {
    en: "Classes",
    it: "Classi",
  },

  "character_classes.placeholder": {
    en: "None",
    it: "Nessuna",
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
