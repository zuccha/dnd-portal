import { HStack, VStack } from "@chakra-ui/react";
import useListCollection from "../../../../../../../hooks/use-list-collection";
import {
  convertDistanceImpToMet,
  convertDistanceMetToImp,
} from "../../../../../../../i18n/i18n-distance";
import { useI18nLangContext } from "../../../../../../../i18n/i18n-lang-context";
import { useI18nSystem } from "../../../../../../../i18n/i18n-system";
import {
  convertWeightImpToMet,
  convertWeightMetToImp,
} from "../../../../../../../i18n/i18n-weight";
import { useCampaignRoleOptions } from "../../../../../../../resources/types/campaign-role";
import { useDamageTypeOptions } from "../../../../../../../resources/types/damage-type";
import { useWeaponMasteryOptions } from "../../../../../../../resources/types/weapon-mastery";
import { useWeaponPropertyOptions } from "../../../../../../../resources/types/weapon-property";
import { useWeaponTypeOptions } from "../../../../../../../resources/types/weapon-type";
import type { Weapon } from "../../../../../../../resources/weapons/weapon";
import Field from "../../../../../../../ui/field";
import Input from "../../../../../../../ui/input";
import NumberInput from "../../../../../../../ui/number-input";
import Select from "../../../../../../../ui/select";
import Switch from "../../../../../../../ui/switch";
import Textarea from "../../../../../../../ui/textarea";
import {
  useWeaponEditorFormAmmunition,
  useWeaponEditorFormCost,
  useWeaponEditorFormDamage,
  useWeaponEditorFormDamageType,
  useWeaponEditorFormDamageVersatile,
  useWeaponEditorFormField,
  useWeaponEditorFormMastery,
  useWeaponEditorFormName,
  useWeaponEditorFormNotes,
  useWeaponEditorFormProperties,
  useWeaponEditorFormRangeFtLong,
  useWeaponEditorFormRangeFtShort,
  useWeaponEditorFormRangeMLong,
  useWeaponEditorFormRangeMShort,
  useWeaponEditorFormType,
  useWeaponEditorFormVisibility,
  useWeaponEditorFormWeightKg,
  useWeaponEditorFormWeightLb,
} from "./weapon-editor-form";

//------------------------------------------------------------------------------
// Weapon Editor
//------------------------------------------------------------------------------

export type WeaponEditorProps = {
  resource: Weapon;
};

export default function WeaponEditor({ resource }: WeaponEditorProps) {
  const { lang, t } = useI18nLangContext(i18nContext);

  const magic = useWeaponEditorFormField("magic", resource.magic);
  const melee = useWeaponEditorFormField("melee", resource.melee);
  const ranged = useWeaponEditorFormField("ranged", resource.ranged);

  const properties = useWeaponEditorFormProperties(resource.properties);

  return (
    <VStack align="stretch" gap={4}>
      <HStack align="flex-start" gap={4}>
        <WeaponEditorName defaultName={resource.name[lang] ?? ""} />
        <WeaponEditorType defaultType={resource.type} />
        <WeaponEditorVisibility defaultVisibility={resource.visibility} />
      </HStack>

      <HStack align="flex-start" gap={4}>
        <WeaponEditorProperties defaultProperties={resource.properties} />
        <WeaponEditorMastery defaultMastery={resource.mastery} />
      </HStack>

      <HStack align="flex-start" gap={4}>
        <WeaponEditorDamage defaultDamage={resource.damage} />
        {properties.value.includes("versatile") && (
          <WeaponEditorDamageVersatile
            defaultDamageVersatile={resource.damage_versatile ?? ""}
          />
        )}
        <WeaponEditorDamageType defaultDamageType={resource.damage_type} />
        {properties.value.includes("ammunition") && (
          <WeaponEditorAmmunition
            defaultAmmunition={resource.ammunition[lang] ?? ""}
          />
        )}
      </HStack>

      <HStack gap={8}>
        <Switch label={t("magic.label")} size="lg" {...magic} />
        <Switch label={t("melee.label")} size="lg" {...melee} />
        <Switch label={t("ranged.label")} size="lg" {...ranged} />
      </HStack>

      <HStack align="flex-start" gap={4}>
        <WeaponEditorWeight
          defaultWeightKg={resource.weight_kg}
          defaultWeightLb={resource.weight_lb}
        />

        <WeaponEditorCost defaultCost={resource.cost} />

        {ranged.value && (
          <WeaponEditorRange
            defaultRangeFtLong={resource.range_ft_long ?? 0}
            defaultRangeFtShort={resource.range_ft_short ?? 0}
            defaultRangeMLong={resource.range_m_long ?? 0}
            defaultRangeMShort={resource.range_m_short ?? 0}
          />
        )}
      </HStack>

      <WeaponEditorNotes defaultNotes={resource.notes[lang] ?? ""} />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Weapon Editor Name
//------------------------------------------------------------------------------

function WeaponEditorName({ defaultName }: { defaultName: string }) {
  const { error, ...rest } = useWeaponEditorFormName(defaultName);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("name.label")}>
      <Input autoComplete="off" placeholder={t("name.placeholder")} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Weapon Editor Visibility
//------------------------------------------------------------------------------

function WeaponEditorVisibility({
  defaultVisibility,
}: {
  defaultVisibility: Weapon["visibility"];
}) {
  const visibilityOptions = useListCollection(useCampaignRoleOptions());
  const { error, ...rest } = useWeaponEditorFormVisibility(defaultVisibility);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("visibility.label")} maxW="10em">
      <Select options={visibilityOptions} withinDialog {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Weapon Editor Type
//------------------------------------------------------------------------------

function WeaponEditorType({ defaultType }: { defaultType: Weapon["type"] }) {
  const typeOptions = useListCollection(useWeaponTypeOptions());
  const { error, ...rest } = useWeaponEditorFormType(defaultType);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("type.label")} w="20em">
      <Select options={typeOptions} withinDialog {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Weapon Editor Properties
//------------------------------------------------------------------------------

function WeaponEditorProperties({
  defaultProperties,
}: {
  defaultProperties: Weapon["properties"];
}) {
  const propertyOptions = useListCollection(useWeaponPropertyOptions());
  const { error, ...rest } = useWeaponEditorFormProperties(defaultProperties);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("properties.label")}>
      <Select
        multiple
        options={propertyOptions}
        placeholder={t("properties.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Weapon Editor Mastery
//------------------------------------------------------------------------------

function WeaponEditorMastery({
  defaultMastery,
}: {
  defaultMastery: Weapon["mastery"];
}) {
  const masteryOptions = useListCollection(useWeaponMasteryOptions());
  const { error, ...rest } = useWeaponEditorFormMastery(defaultMastery);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("mastery.label")} w="20em">
      <Select options={masteryOptions} withinDialog {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Weapon Editor Damage
//------------------------------------------------------------------------------

function WeaponEditorDamage({ defaultDamage }: { defaultDamage: string }) {
  const { error, ...rest } = useWeaponEditorFormDamage(defaultDamage);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("damage.label")}>
      <Input placeholder={t("damage.placeholder")} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Weapon Editor Damage Versatile
//------------------------------------------------------------------------------

function WeaponEditorDamageVersatile({
  defaultDamageVersatile,
}: {
  defaultDamageVersatile: string;
}) {
  const { error, ...rest } = useWeaponEditorFormDamageVersatile(
    defaultDamageVersatile,
  );
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("damage_versatile.label")}>
      <Input placeholder={t("damage_versatile.placeholder")} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Weapon Editor Damage Type
//------------------------------------------------------------------------------

function WeaponEditorDamageType({
  defaultDamageType,
}: {
  defaultDamageType: Weapon["damage_type"];
}) {
  const damageTypeOptions = useListCollection(useDamageTypeOptions());
  const { error, ...rest } = useWeaponEditorFormDamageType(defaultDamageType);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("damage_type.label")}>
      <Select options={damageTypeOptions} withinDialog {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Weapon Editor Ammunition
//------------------------------------------------------------------------------

function WeaponEditorAmmunition({
  defaultAmmunition,
}: {
  defaultAmmunition: string;
}) {
  const { error, ...rest } = useWeaponEditorFormAmmunition(defaultAmmunition);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("ammunition.label")}>
      <Input placeholder={t("ammunition.placeholder")} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Weapon Editor Range
//------------------------------------------------------------------------------

function WeaponEditorRange({
  defaultRangeFtLong,
  defaultRangeFtShort,
  defaultRangeMLong,
  defaultRangeMShort,
}: {
  defaultRangeFtLong: number;
  defaultRangeFtShort: number;
  defaultRangeMLong: number;
  defaultRangeMShort: number;
}) {
  const { t } = useI18nLangContext(i18nContext);
  const [system] = useI18nSystem();

  const ftShort = useWeaponEditorFormRangeFtShort(defaultRangeFtShort);
  const ftLong = useWeaponEditorFormRangeFtLong(defaultRangeFtLong);
  const mShort = useWeaponEditorFormRangeMShort(defaultRangeMShort);
  const mLong = useWeaponEditorFormRangeMLong(defaultRangeMLong);

  const setRangeFtShort = (value: number) => {
    ftShort.onValueChange(value);
    mShort.onValueChange(convertDistanceImpToMet(value, "ft", "m")[0]);
  };

  const setRangeFtLong = (value: number) => {
    ftLong.onValueChange(value);
    mLong.onValueChange(convertDistanceImpToMet(value, "ft", "m")[0]);
  };

  const setRangeMShort = (value: number) => {
    mShort.onValueChange(value);
    ftShort.onValueChange(convertDistanceMetToImp(value, "m", "ft")[0]);
  };

  const setRangeMLong = (value: number) => {
    mLong.onValueChange(value);
    ftLong.onValueChange(convertDistanceMetToImp(value, "m", "ft")[0]);
  };

  const metric = system === "metric";
  const imperial = system === "imperial";

  return (
    <>
      <Field hidden={metric} label={t("range.ft.short.label")} maxW="6em">
        <NumberInput min={0} {...ftShort} onValueChange={setRangeFtShort} />
      </Field>
      <Field hidden={metric} label={t("range.ft.long.label")} maxW="6em">
        <NumberInput min={0} {...ftLong} onValueChange={setRangeFtLong} />
      </Field>

      <Field hidden={imperial} label={t("range.m.short.label")} maxW="6em">
        <NumberInput min={0} {...mShort} onValueChange={setRangeMShort} />
      </Field>
      <Field hidden={imperial} label={t("range.m.long.label")} maxW="6em">
        <NumberInput min={0} {...mLong} onValueChange={setRangeMLong} />
      </Field>
    </>
  );
}

//------------------------------------------------------------------------------
// Weapon Editor Weight
//------------------------------------------------------------------------------

function WeaponEditorWeight({
  defaultWeightKg,
  defaultWeightLb,
}: {
  defaultWeightKg: number;
  defaultWeightLb: number;
}) {
  const { t } = useI18nLangContext(i18nContext);
  const [system] = useI18nSystem();

  const weightLb = useWeaponEditorFormWeightLb(defaultWeightLb);
  const weightKg = useWeaponEditorFormWeightKg(defaultWeightKg);

  const setWeightLb = (value: number) => {
    weightLb.onValueChange(value);
    weightKg.onValueChange(convertWeightImpToMet(value, "lb", "kg")[0]);
  };

  const setWeightKg = (value: number) => {
    weightKg.onValueChange(value);
    weightLb.onValueChange(convertWeightMetToImp(value, "kg", "lb")[0]);
  };

  const metric = system === "metric";
  const imperial = system === "imperial";

  return (
    <HStack align="flex-end">
      <Field hidden={metric} label={t("weight.lb.label")} maxW="6em">
        <NumberInput min={0} {...weightLb} onValueChange={setWeightLb} />
      </Field>

      <Field hidden={imperial} label={t("weight.kg.label")} maxW="6em">
        <NumberInput min={0} {...weightKg} onValueChange={setWeightKg} />
      </Field>
    </HStack>
  );
}

//------------------------------------------------------------------------------
// Weapon Editor Cost
//------------------------------------------------------------------------------

function WeaponEditorCost({ defaultCost }: { defaultCost: number }) {
  const { error, ...rest } = useWeaponEditorFormCost(defaultCost);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("cost.label")} maxW="6em">
      <NumberInput min={0} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Weapon Editor Notes
//------------------------------------------------------------------------------

function WeaponEditorNotes({ defaultNotes }: { defaultNotes: string }) {
  const { error, ...rest } = useWeaponEditorFormNotes(defaultNotes);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("notes.label")}>
      <Textarea placeholder={t("notes.placeholder")} {...rest} />
    </Field>
  );
}

//----------------------------------------------------------------------------
// I18n Context
//----------------------------------------------------------------------------

const i18nContext = {
  "form.error.invalid": {
    en: "The inserted data is not valid.",
    it: "I dati inseriti non sono validi.",
  },

  "form.error.invalid_translation": {
    en: "The inserted data is not valid.",
    it: "I dati inseriti non sono validi.",
  },

  "form.error.creation_failure": {
    en: "Failed to create the weapon.",
    it: "Errore durante la creazione.",
  },

  "form.error.update_failure": {
    en: "Failed to update the weapon.",
    it: "Errore durante il salvataggio.",
  },

  "name.label": {
    en: "Name",
    it: "Nome",
  },

  "name.placeholder": {
    en: "E.g.: Flail",
    it: "Es: Mazzafrusto",
  },

  "visibility.label": {
    en: "Visibility",
    it: "Visibilità",
  },

  "name.error.empty": {
    en: "The name cannot be empty",
    it: "Il nome non può essere vuoto",
  },

  "type.label": {
    en: "Type",
    it: "Tipo",
  },

  "properties.label": {
    en: "Properties",
    it: "Proprietà",
  },

  "properties.placeholder": {
    en: "None",
    it: "Nessuna",
  },

  "mastery.label": {
    en: "Mastery",
    it: "Padronanza",
  },

  "damage.label": {
    en: "Damage",
    it: "Danni",
  },

  "damage.placeholder": {
    en: "E.g.: 1d8",
    it: "Es: 1d8",
  },

  "damage_versatile.label": {
    en: "Versatile",
    it: "Versatile",
  },

  "damage_versatile.placeholder": {
    en: "E.g.: 1d10",
    it: "Es: 1d10",
  },

  "damage_type.label": {
    en: "Type",
    it: "Tipo",
  },

  "ammunition.label": {
    en: "Ammunition",
    it: "Munizione",
  },

  "ammunition.placeholder": {
    en: "E.g.: arrow",
    it: "Es: freccia",
  },

  "ammunition.error.empty": {
    en: "The ammunition cannot be empty",
    it: "La munizione non può essere vuota",
  },

  "magic.label": {
    en: "Magic",
    it: "Magica",
  },

  "melee.label": {
    en: "Melee",
    it: "Mischia",
  },

  "ranged.label": {
    en: "Ranged",
    it: "A distanza",
  },

  "range.ft.short.label": {
    en: "Short (ft)",
    it: "Corto (ft)",
  },

  "range.ft.long.label": {
    en: "Long (ft)",
    it: "Lungo (ft)",
  },

  "range.m.short.label": {
    en: "Short (m)",
    it: "Corto (m)",
  },

  "range.m.long.label": {
    en: "Long (m)",
    it: "Lungo (m)",
  },

  "weight.lb.label": {
    en: "Weight (lb)",
    it: "Peso (lb)",
  },

  "weight.kg.label": {
    en: "Weight (kg)",
    it: "Peso (kg)",
  },

  "cost.label": {
    en: "Cost (gp)",
    it: "Costo (mo)",
  },

  "notes.label": {
    en: "Notes",
    it: "Note",
  },

  "notes.placeholder": {
    en: "E.g.: Inflicts double damage to dragons.",
    it: "Es: Infligge il doppio dei danni ai draghi.",
  },
};
