import { Box, HStack, VStack } from "@chakra-ui/react";
import useListCollection from "~/hooks/use-list-collection";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { type Spell } from "~/models/resources/spells/spell";
import { useCampaignRoleOptions } from "~/models/types/campaign-role";
import { useCharacterClassOptions } from "~/models/types/character-class";
import { useSpellCastingTimeOptions } from "~/models/types/spell-casting-time";
import { useSpellDurationOptions } from "~/models/types/spell-duration";
import { useSpellLevelOptions } from "~/models/types/spell-level";
import { useSpellRangeOptions } from "~/models/types/spell-range";
import { useSpellSchoolOptions } from "~/models/types/spell-school";
import DistanceInput from "~/ui/distance-input";
import Field from "~/ui/field";
import Input from "~/ui/input";
import NumberInput from "~/ui/number-input";
import Select from "~/ui/select";
import Switch from "~/ui/switch";
import Textarea from "~/ui/textarea";
import TimeInput from "~/ui/time-input";
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
  useSpellEditorFormPage,
  useSpellEditorFormRange,
  useSpellEditorFormRangeValue,
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
        <SpellEditorPage defaultPage={resource.page?.[lang] ?? 0} />
        <SpellEditorVisibility defaultVisibility={resource.visibility} />
      </HStack>

      <HStack align="flex-start" gap={4}>
        <SpellEditorCharacterClasses
          defaultCharacterClasses={resource.character_classes}
        />
        <SpellEditorSchool defaultSchool={resource.school} />
        <SpellEditorLevel defaultLevel={resource.level} />
      </HStack>

      <HStack align="flex-start" gap={4}>
        <SpellEditorCastingTime
          defaultCastingTime={resource.casting_time}
          defaultCastingTimeValue={resource.casting_time_value_temp ?? 0}
        />
        <SpellEditorDuration
          defaultDuration={resource.duration}
          defaultDurationValue={resource.duration_value_temp ?? 0}
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

      <HStack>
        <Box flex={1}>
          <SpellEditorRange
            defaultRange={resource.range}
            defaultRangeValue={resource.range_value ?? 0}
          />
        </Box>
        <Box flex={1} />
      </HStack>

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
// Casting Time
//------------------------------------------------------------------------------

function SpellEditorCastingTime({
  defaultCastingTime,
  defaultCastingTimeValue,
}: {
  defaultCastingTime: Spell["casting_time"];
  defaultCastingTimeValue: number;
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
// Casting Time Value
//------------------------------------------------------------------------------

function SpellEditorCastingTimeValue({
  defaultCastingTimeValue,
}: {
  defaultCastingTimeValue: number;
}) {
  const { error: _, ...rest } = useSpellEditorFormCastingTimeValue(
    defaultCastingTimeValue,
  );

  return (
    <Field maxW="9em">
      <TimeInput min={0} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Character Classes
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
// Description
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
// Duration
//------------------------------------------------------------------------------

function SpellEditorDuration({
  defaultDuration,
  defaultDurationValue,
}: {
  defaultDuration: Spell["duration"];
  defaultDurationValue: number;
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
// Duration Value
//------------------------------------------------------------------------------

function SpellEditorDurationValue({
  defaultDurationValue,
}: {
  defaultDurationValue: number;
}) {
  const { error: _, ...rest } =
    useSpellEditorFormDurationValue(defaultDurationValue);

  return (
    <Field maxW="9em">
      <TimeInput min={0} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Level
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
// Materials
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
// Name
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
// Page
//------------------------------------------------------------------------------

function SpellEditorPage({ defaultPage }: { defaultPage: number }) {
  const { error, ...rest } = useSpellEditorFormPage(defaultPage);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("page.label")} maxW="6em">
      <NumberInput {...rest} w="6em" />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Range
//------------------------------------------------------------------------------

function SpellEditorRange({
  defaultRange,
  defaultRangeValue,
}: {
  defaultRange: Spell["range"];
  defaultRangeValue: number;
}) {
  const rangeOptions = useListCollection(useSpellRangeOptions());
  const { error, ...rest } = useSpellEditorFormRange(defaultRange);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <HStack align="flex-end" w="full">
      <Field error={message} label={t("range.label")}>
        <Select options={rangeOptions} withinDialog {...rest} />
      </Field>
      {rest.value === "value" && (
        <SpellEditorRangeValue defaultRangeValue={defaultRangeValue} />
      )}
    </HStack>
  );
}

//------------------------------------------------------------------------------
// Range Value
//------------------------------------------------------------------------------

function SpellEditorRangeValue({
  defaultRangeValue,
}: {
  defaultRangeValue: number;
}) {
  const { error: _, ...rest } = useSpellEditorFormRangeValue(defaultRangeValue);

  return (
    <Field>
      <DistanceInput min={0} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// School
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
    <Field error={message} label={t("school.label")} w="20em">
      <Select options={schoolOptions} withinDialog {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Visibility
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
// Upgrade
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
  "casting_time.label": {
    en: "Casting Time",
    it: "Tempo di Lancio",
  },
  "character_classes.label": {
    en: "Classes",
    it: "Classi",
  },
  "character_classes.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "concentration.label": {
    en: "Concentration",
    it: "Concentrazione",
  },
  "description.error.empty": {
    en: "The effect cannot be empty",
    it: "L'effetto non può essere vuoto",
  },
  "description.label": {
    en: "Effect",
    it: "Effetto",
  },
  "description.placeholder": {
    en: "E.g.: A bright streak flashes from you to a point you choose within range and then blossoms with a low roar into a fiery explosion. Each creature in a 20-foot-radius Sphere centered on that point makes a Dexterity saving throw, taking 8d6 Fire damage on a failed save or half as much damage on a successful one.\nFlammable objects in the area that aren't being worn or carried start burning.",
    it: "Es: Una scia di luce brillante parte dall'incantatore e sfreccia fino a un punto a sua scelta entro gittata, provocando un'esplosione infuocata con un profondo boato. Ogni creatura presente in una sfera del raggio di 6 metri e centrata su quel punto deve effettuare un tiro salvezza su Destrezza, subendo 8d6 danni da fuoco in caso di fallimento, o la metà di quei danni in caso di successo.\nGli oggetti infiammabili nell'area che non sono indossati o trasportati iniziano a bruciare.",
  },
  "duration.label": {
    en: "Duration",
    it: "Durata",
  },
  "level.error.empty": {
    en: "The level cannot be empty",
    it: "Il livello non può essere vuoto",
  },
  "level.label": {
    en: "Level",
    it: "Livello",
  },
  "material.label": {
    en: "Material",
    it: "Materiale",
  },
  "materials.error.empty": {
    en: "The materials cannot be empty",
    it: "I materiali non possono essere vuoti",
  },
  "materials.label": {
    en: "Materials",
    it: "Materiali",
  },
  "materials.placeholder": {
    en: "E.g.: A ball of bat guano and sulfur.",
    it: "Es: Una pallina di guano di pipistrello e zolfo.",
  },
  "name.error.empty": {
    en: "The name cannot be empty",
    it: "Il nome non può essere vuoto",
  },
  "name.label": {
    en: "Name",
    it: "Nome",
  },
  "name.placeholder": {
    en: "E.g.: Fireball",
    it: "Es: Palla di Fuoco",
  },
  "page.label": {
    en: "Page",
    it: "Pagina",
  },
  "range.label": {
    en: "Range",
    it: "Gittata",
  },
  "ritual.label": {
    en: "Ritual",
    it: "Rituale",
  },
  "school.label": {
    en: "School",
    it: "Scuola",
  },
  "somatic.label": {
    en: "Somatic",
    it: "Somatico",
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
  "verbal.label": {
    en: "Verbal",
    it: "Verbale",
  },
  "visibility.label": {
    en: "Visibility",
    it: "Visibilità",
  },
};
