import { HStack, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Weapon } from "~/models/resources/equipment/weapons/weapon";
import { useCampaignRoleOptions } from "~/models/types/campaign-role";
import { useDamageTypeOptions } from "~/models/types/damage-type";
import { useWeaponMasteryOptions } from "~/models/types/weapon-mastery";
import { useWeaponPropertyOptions } from "~/models/types/weapon-property";
import { useWeaponTypeOptions } from "~/models/types/weapon-type";
import CostInput from "~/ui/cost-input";
import DistanceInput from "~/ui/distance-input";
import Field from "~/ui/field";
import Input from "~/ui/input";
import NumberInput from "~/ui/number-input";
import Select from "~/ui/select";
import Switch from "~/ui/switch";
import Textarea from "~/ui/textarea";
import WeightInput from "~/ui/weight-input";
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
  useWeaponEditorFormPage,
  useWeaponEditorFormProperties,
  useWeaponEditorFormRangeLong,
  useWeaponEditorFormRangeShort,
  useWeaponEditorFormType,
  useWeaponEditorFormVisibility,
  useWeaponEditorFormWeight,
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
        <WeaponEditorPage defaultPage={resource.page?.[lang] ?? 0} />
        <WeaponEditorVisibility defaultVisibility={resource.visibility} />
      </HStack>

      <HStack align="flex-start" gap={4}>
        <WeaponEditorType defaultType={resource.type} />
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
        <WeaponEditorWeight defaultWeight={resource.weight} />

        <WeaponEditorCost defaultCost={resource.cost} />

        {ranged.value && (
          <>
            <WeaponEditorRangeShort
              defaultRangeShort={resource.range_short ?? 0}
            />
            <WeaponEditorRangeLong
              defaultRangeLong={resource.range_long ?? 0}
            />
          </>
        )}
      </HStack>

      <WeaponEditorNotes defaultNotes={resource.notes[lang] ?? ""} />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Ammunition
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
// Cost
//------------------------------------------------------------------------------

function WeaponEditorCost({ defaultCost }: { defaultCost: number }) {
  const { error, ...rest } = useWeaponEditorFormCost(defaultCost);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("cost.label")}>
      <CostInput min={0} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Damage
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
// Damage (Versatile)
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
// Damage Type
//------------------------------------------------------------------------------

function WeaponEditorDamageType({
  defaultDamageType,
}: {
  defaultDamageType: Weapon["damage_type"];
}) {
  const damageTypeOptions = useDamageTypeOptions();
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
// Mastery
//------------------------------------------------------------------------------

function WeaponEditorMastery({
  defaultMastery,
}: {
  defaultMastery: Weapon["mastery"];
}) {
  const masteryOptions = useWeaponMasteryOptions();
  const { error, ...rest } = useWeaponEditorFormMastery(defaultMastery);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("mastery.label")}>
      <Select options={masteryOptions} withinDialog {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function WeaponEditorName({ defaultName }: { defaultName: string }) {
  const { error, ...rest } = useWeaponEditorFormName(defaultName);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("name.label")}>
      <Input
        autoComplete="off"
        bgColor="bg.info"
        placeholder={t("name.placeholder")}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Notes
//------------------------------------------------------------------------------

function WeaponEditorNotes({ defaultNotes }: { defaultNotes: string }) {
  const { error, ...rest } = useWeaponEditorFormNotes(defaultNotes);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("notes.label")}>
      <Textarea
        bgColor="bg.info"
        placeholder={t("notes.placeholder")}
        rows={5}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Page
//------------------------------------------------------------------------------

function WeaponEditorPage({ defaultPage }: { defaultPage: number }) {
  const { error, ...rest } = useWeaponEditorFormPage(defaultPage);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("page.label")} maxW="6em">
      <NumberInput bgColor="bg.info" {...rest} w="6em" />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Properties
//------------------------------------------------------------------------------

function WeaponEditorProperties({
  defaultProperties,
}: {
  defaultProperties: Weapon["properties"];
}) {
  const propertyOptions = useWeaponPropertyOptions();
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
// Range Long
//------------------------------------------------------------------------------

function WeaponEditorRangeLong({
  defaultRangeLong,
}: {
  defaultRangeLong: number;
}) {
  const { error, ...rest } = useWeaponEditorFormRangeLong(defaultRangeLong);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("range.long.label")}>
      <DistanceInput min={0} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Range Short
//------------------------------------------------------------------------------

function WeaponEditorRangeShort({
  defaultRangeShort,
}: {
  defaultRangeShort: number;
}) {
  const { error, ...rest } = useWeaponEditorFormRangeShort(defaultRangeShort);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("range.short.label")}>
      <DistanceInput min={0} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Type
//------------------------------------------------------------------------------

function WeaponEditorType({ defaultType }: { defaultType: Weapon["type"] }) {
  const typeOptions = useWeaponTypeOptions();
  const { error, ...rest } = useWeaponEditorFormType(defaultType);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("type.label")}>
      <Select options={typeOptions} withinDialog {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

function WeaponEditorVisibility({
  defaultVisibility,
}: {
  defaultVisibility: Weapon["visibility"];
}) {
  const visibilityOptions = useCampaignRoleOptions();
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
// Weight
//------------------------------------------------------------------------------

function WeaponEditorWeight({ defaultWeight }: { defaultWeight: number }) {
  const { error, ...rest } = useWeaponEditorFormWeight(defaultWeight);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("weight.label")}>
      <WeightInput min={0} {...rest} />
    </Field>
  );
}

//----------------------------------------------------------------------------
// I18n Context
//----------------------------------------------------------------------------

const i18nContext = {
  "ammunition.error.empty": {
    en: "The ammunition cannot be empty",
    it: "La munizione non può essere vuota",
  },
  "ammunition.label": {
    en: "Ammunition",
    it: "Munizione",
  },
  "ammunition.placeholder": {
    en: "E.g.: arrow",
    it: "Es: freccia",
  },
  "cost.label": {
    en: "Cost",
    it: "Costo",
  },
  "damage.label": {
    en: "Damage",
    it: "Danni",
  },
  "damage.placeholder": {
    en: "E.g.: 1d8",
    it: "Es: 1d8",
  },
  "damage_type.label": {
    en: "Type",
    it: "Tipo",
  },
  "damage_versatile.label": {
    en: "Versatile",
    it: "Versatile",
  },
  "damage_versatile.placeholder": {
    en: "E.g.: 1d10",
    it: "Es: 1d10",
  },
  "magic.label": {
    en: "Magic",
    it: "Magica",
  },
  "mastery.label": {
    en: "Mastery",
    it: "Padronanza",
  },
  "melee.label": {
    en: "Melee",
    it: "Mischia",
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
    en: "E.g.: Flail",
    it: "Es: Mazzafrusto",
  },
  "notes.label": {
    en: "Notes",
    it: "Note",
  },
  "notes.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "page.label": {
    en: "Page",
    it: "Pagina",
  },
  "properties.label": {
    en: "Properties",
    it: "Proprietà",
  },
  "properties.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "range.long.label": {
    en: "Long",
    it: "Lungo",
  },
  "range.short.label": {
    en: "Short",
    it: "Corto",
  },
  "ranged.label": {
    en: "Ranged",
    it: "A distanza",
  },
  "type.label": {
    en: "Type",
    it: "Tipo",
  },
  "visibility.label": {
    en: "Visibility",
    it: "Visibilità",
  },
  "weight.label": {
    en: "Weight",
    it: "Peso",
  },
};
