import { HStack, Textarea, VStack } from "@chakra-ui/react";
import { useState } from "react";
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
import {
  type SpellLevel,
  useSpellLevelOptions,
} from "../../../../../../resources/spell-level";
import { useSpellRangeOptions } from "../../../../../../resources/spell-range";
import { useSpellSchoolOptions } from "../../../../../../resources/spell-school";
import Field from "../../../../../../ui/field";
import Input from "../../../../../../ui/input";
import NumberInput from "../../../../../../ui/number-input";
import Select from "../../../../../../ui/select";
import Switch from "../../../../../../ui/switch";

//------------------------------------------------------------------------------
// Spell Editor
//------------------------------------------------------------------------------

export type SpellEditorProps = {
  resource: Spell;
};

export default function SpellEditor({ resource }: SpellEditorProps) {
  const { lang, t, tp } = useI18nLangContext(i18nContext);

  const timeUnitOptions = useListCollection(useTimeUnitOptions());
  const distanceImpOptions = useListCollection(useDistanceImpUnitOptions());
  const distanceMetOptions = useListCollection(useDistanceMetUnitOptions());

  //----------------------------------------------------------------------------
  // Name
  //----------------------------------------------------------------------------

  const [name, setName] = useState(resource.name[lang] ?? "");

  //----------------------------------------------------------------------------
  // Level
  //----------------------------------------------------------------------------

  const levelOptions = useListCollection(useSpellLevelOptions());

  const [level, setLevel] = useState(resource.level);

  //----------------------------------------------------------------------------
  // Character Classes
  //----------------------------------------------------------------------------

  const characterClassOptions = useListCollection(useCharacterClassOptions());

  const [characterClasses, setCharacterClasses] = useState(
    resource.character_classes
  );

  //----------------------------------------------------------------------------
  // School
  //----------------------------------------------------------------------------

  const schoolOptions = useListCollection(useSpellSchoolOptions());

  const [school, setSchool] = useState(resource.school);

  //----------------------------------------------------------------------------
  // Casing Time
  //----------------------------------------------------------------------------

  const castingTimeOptions = useListCollection(useSpellCastingTimeOptions());

  const [castingTime, setCastingTime] = useState(resource.casting_time);

  const [initialCastingTimeValue, initialCastingTimeUnit] = parseTime(
    resource.casting_time_value ?? "0 min"
  ) ?? [0, "min"];

  const [castingTimeValue, setCastingTimeValue] = useState(
    initialCastingTimeValue
  );

  const [castingTimeUnit, setCastingTimeUnit] = useState(
    initialCastingTimeUnit
  );

  //----------------------------------------------------------------------------
  // Duration
  //----------------------------------------------------------------------------

  const durationOptions = useListCollection(useSpellDurationOptions());

  const [duration, setDuration] = useState(resource.duration);

  const [initialDurationValue, initialDurationUnit] = parseTime(
    resource.duration_value ?? "0 min"
  ) ?? [0, "min"];

  const [durationValue, setDurationValue] = useState(initialDurationValue);
  const [durationUnit, setDurationUnit] = useState(initialDurationUnit);

  //----------------------------------------------------------------------------
  // Range
  //----------------------------------------------------------------------------

  const rangeOptions = useListCollection(useSpellRangeOptions());

  const [range, setRange] = useState(resource.range);

  const [initialRangeImpValue, initialRangeImpUnit] = parseDistanceImp(
    resource.range_value_imp ?? "0 ft"
  ) ?? [0, "ft"];

  const [rangeImpValue, setRangeImpValue] = useState(initialRangeImpValue);
  const [rangeImpUnit, setRangeImpUnit] = useState(initialRangeImpUnit);

  const [initialRangeMetValue, initialRangeMetUnit] = parseDistanceMet(
    resource.range_value_met ?? "0 m"
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

  //----------------------------------------------------------------------------
  // Ritual
  //----------------------------------------------------------------------------

  const [ritual, setRitual] = useState(resource.ritual);

  //----------------------------------------------------------------------------
  // Concentration
  //----------------------------------------------------------------------------

  const [concentration, setConcentration] = useState(resource.concentration);

  //----------------------------------------------------------------------------
  // Components
  //----------------------------------------------------------------------------

  const [verbal, setVerbal] = useState(resource.verbal);
  const [somatic, setSomatic] = useState(resource.somatic);
  const [material, setMaterial] = useState(resource.material);

  //----------------------------------------------------------------------------
  // Materials
  //----------------------------------------------------------------------------

  const [materials, setMaterials] = useState(resource.materials?.[lang] ?? "");

  //----------------------------------------------------------------------------
  // Render
  //----------------------------------------------------------------------------

  return (
    <VStack align="stretch" gap={4}>
      <HStack gap={4}>
        <Field label={t("name.label")}>
          <Input
            name="edit-spell-name"
            onValueChange={setName}
            placeholder={t("name.placeholder")}
            value={name}
          />
        </Field>
        <Field label={t("level.label")} maxW="5em">
          <Select
            onValueChange={(level) => setLevel(parseInt(level) as SpellLevel)}
            options={levelOptions}
            value={`${level}`}
            withinDialog
          />
        </Field>
      </HStack>

      <HStack gap={4}>
        <Field label={t("character_classes.label")}>
          <Select
            multiple
            name="edit-spell-character-classes"
            onValueChange={setCharacterClasses}
            options={characterClassOptions}
            value={characterClasses}
            withinDialog
          />
        </Field>
        <Field label={t("school.label")} maxW="11em">
          <Select
            name="edit-spell-school"
            onValueChange={setSchool}
            options={schoolOptions}
            value={school}
            withinDialog
          />
        </Field>
      </HStack>

      <HStack gap={4}>
        <HStack align="flex-end" w="full">
          <Field flex={1} label={t("casting_time.label")}>
            <Select
              name="edit-spell-casting-time"
              onValueChange={setCastingTime}
              options={castingTimeOptions}
              value={castingTime}
              withinDialog
            />
          </Field>
          {castingTime === "value" && (
            <>
              <HStack h={10}>:</HStack>
              <Field maxW="6em">
                <NumberInput
                  min={0}
                  name="edit-spell-casting-time-value"
                  onValueChange={setCastingTimeValue}
                  value={castingTimeValue}
                />
              </Field>
              <Field maxW="7em">
                <Select
                  name="edit-spell-casting-time-unit"
                  onValueChange={setCastingTimeUnit}
                  options={timeUnitOptions}
                  value={castingTimeUnit}
                  withinDialog
                />
              </Field>
            </>
          )}
        </HStack>

        <HStack align="flex-end" w="full">
          <Field flex={1} label={t("duration.label")}>
            <Select
              name="edit-spell-duration"
              onValueChange={setDuration}
              options={durationOptions}
              value={duration}
              withinDialog
            />
          </Field>
          {duration === "value" && (
            <>
              <HStack h={10}>:</HStack>
              <Field maxW="6em">
                <NumberInput
                  min={0}
                  name="edit-spell-duration-value"
                  onValueChange={setDurationValue}
                  value={durationValue}
                />
              </Field>
              <Field maxW="7em">
                <Select
                  name="edit-spell-duration-unit"
                  onValueChange={setDurationUnit}
                  options={timeUnitOptions}
                  value={durationUnit}
                  withinDialog
                />
              </Field>
            </>
          )}
        </HStack>
      </HStack>

      <HStack gap={4}>
        <Switch
          checked={ritual}
          flex={1}
          label={t("ritual.label")}
          onCheckedChange={setRitual}
          size="lg"
        />

        <Switch
          checked={concentration}
          flex={1}
          label={t("concentration.label")}
          onCheckedChange={setConcentration}
          size="lg"
        />
      </HStack>

      <HStack gap={4}>
        <HStack align="flex-end" w="full">
          <Field flex={1} label={t("range.label")}>
            <Select
              name="edit-spell-range"
              onValueChange={setRange}
              options={rangeOptions}
              value={range}
              withinDialog
            />
          </Field>
          {range === "value" && (
            <>
              <HStack h={10}>:</HStack>
              <Field maxW="6em">
                <NumberInput
                  min={0}
                  name="edit-spell-range-imp-value"
                  onValueChange={setRangeImpValueAndUpdateMet}
                  value={rangeImpValue}
                />
              </Field>
              <Field maxW="7em">
                <Select
                  name="edit-spell-range-imp-unit"
                  onValueChange={setRangeImpUnitAndUpdateMet}
                  options={distanceImpOptions}
                  value={rangeImpUnit}
                  withinDialog
                />
              </Field>
              <HStack h={10}>~</HStack>
              <Field maxW="6em">
                <NumberInput
                  min={0}
                  name="edit-spell-range-met-value"
                  onValueChange={setRangeMetValueAndUpdateImp}
                  value={rangeMetValue}
                />
              </Field>
              <Field maxW="7em">
                <Select
                  name="edit-spell-range-met-unit"
                  onValueChange={setRangeMetUnitAndUpdateImp}
                  options={distanceMetOptions}
                  value={rangeMetUnit}
                  withinDialog
                />
              </Field>
            </>
          )}
        </HStack>
      </HStack>

      <HStack gap={8}>
        <Switch
          checked={verbal}
          label={t("verbal.label")}
          onCheckedChange={setVerbal}
          size="lg"
        />

        <Switch
          checked={somatic}
          label={t("somatic.label")}
          onCheckedChange={setSomatic}
          size="lg"
        />

        <Switch
          checked={material}
          label={t("material.label")}
          onCheckedChange={setMaterial}
          size="lg"
        />
      </HStack>

      {material && (
        <Field label={t("materials.label")}>
          <Input
            name="edit-spell-materials"
            onValueChange={setMaterials}
            placeholder={t("materials.placeholder")}
            value={materials}
          />
        </Field>
      )}

      <Field label={t("description.label")}>
        <Textarea
          defaultValue={resource.description[lang] ?? ""}
          h="12em"
          placeholder={t("description.placeholder")}
        />
      </Field>

      <Field label={tp("upgrade.label", level)}>
        <Textarea
          defaultValue={resource.upgrade?.[lang] ?? ""}
          placeholder={tp("upgrade.placeholder", level)}
        />
      </Field>
    </VStack>
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
