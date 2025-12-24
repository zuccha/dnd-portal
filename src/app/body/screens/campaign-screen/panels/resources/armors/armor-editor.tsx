import { HStack, VStack } from "@chakra-ui/react";
import useListCollection from "~/hooks/use-list-collection";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Armor } from "~/models/resources/armors/armor";
import { useArmorTypeOptions } from "~/models/types/armor-type";
import { useCampaignRoleOptions } from "~/models/types/campaign-role";
import Checkbox from "~/ui/checkbox";
import CostInput from "~/ui/cost-input";
import Field from "~/ui/field";
import Input from "~/ui/input";
import NumberInput from "~/ui/number-input";
import Select from "~/ui/select";
import Switch from "~/ui/switch";
import Textarea from "~/ui/textarea";
import WeightInput from "~/ui/weight-input";
import {
  useArmorEditorFormArmorClassIncludesChaModifier,
  useArmorEditorFormArmorClassIncludesConModifier,
  useArmorEditorFormArmorClassIncludesDexModifier,
  useArmorEditorFormArmorClassIncludesIntModifier,
  useArmorEditorFormArmorClassIncludesStrModifier,
  useArmorEditorFormArmorClassIncludesWisModifier,
  useArmorEditorFormArmorClassMaxChaModifier,
  useArmorEditorFormArmorClassMaxConModifier,
  useArmorEditorFormArmorClassMaxDexModifier,
  useArmorEditorFormArmorClassMaxIntModifier,
  useArmorEditorFormArmorClassMaxStrModifier,
  useArmorEditorFormArmorClassMaxWisModifier,
  useArmorEditorFormArmorClassModifier,
  useArmorEditorFormBaseArmorClass,
  useArmorEditorFormCost,
  useArmorEditorFormDisadvantageOnStealth,
  useArmorEditorFormName,
  useArmorEditorFormNotes,
  useArmorEditorFormPage,
  useArmorEditorFormRequiredCha,
  useArmorEditorFormRequiredCon,
  useArmorEditorFormRequiredDex,
  useArmorEditorFormRequiredInt,
  useArmorEditorFormRequiredStr,
  useArmorEditorFormRequiredWis,
  useArmorEditorFormType,
  useArmorEditorFormVisibility,
  useArmorEditorFormWeight,
} from "./armor-editor-form";

//------------------------------------------------------------------------------
// Armor Editor
//------------------------------------------------------------------------------

export type ArmorEditorProps = {
  resource: Armor;
};

export default function ArmorEditor({ resource }: ArmorEditorProps) {
  const { lang } = useI18nLangContext(i18nContext);

  return (
    <VStack align="stretch" gap={4}>
      <HStack align="flex-start" gap={4}>
        <ArmorEditorName defaultName={resource.name[lang] ?? ""} />
        <ArmorEditorPage defaultPage={resource.page?.[lang] ?? 0} />
        <ArmorEditorVisibility defaultVisibility={resource.visibility} />
      </HStack>

      <HStack align="flex-start" gap={4}>
        <ArmorEditorType defaultType={resource.type} />
        <ArmorEditorBaseArmorClass
          defaultBaseArmorClass={resource.base_armor_class}
        />
        <ArmorEditorArmorClassModifier
          defaultArmorClassModifier={resource.armor_class_modifier}
        />
      </HStack>

      <HStack align="flex-start" gap={4}>
        <ArmorEditorArmorClassStrModifier
          defaultArmorClassIncludesStrModifier={
            typeof resource.armor_class_max_str_modifier === "number"
          }
          defaultArmorClassMaxStrModifier={
            resource.armor_class_max_str_modifier ?? 0
          }
        />
        <ArmorEditorArmorClassDexModifier
          defaultArmorClassIncludesDexModifier={
            typeof resource.armor_class_max_dex_modifier === "number"
          }
          defaultArmorClassMaxDexModifier={
            resource.armor_class_max_dex_modifier ?? 0
          }
        />
        <ArmorEditorArmorClassConModifier
          defaultArmorClassIncludesConModifier={
            typeof resource.armor_class_max_con_modifier === "number"
          }
          defaultArmorClassMaxConModifier={
            resource.armor_class_max_con_modifier ?? 0
          }
        />
      </HStack>

      <HStack align="flex-start" gap={4}>
        <ArmorEditorArmorClassIntModifier
          defaultArmorClassIncludesIntModifier={
            typeof resource.armor_class_max_int_modifier === "number"
          }
          defaultArmorClassMaxIntModifier={
            resource.armor_class_max_int_modifier ?? 0
          }
        />
        <ArmorEditorArmorClassWisModifier
          defaultArmorClassIncludesWisModifier={
            typeof resource.armor_class_max_wis_modifier === "number"
          }
          defaultArmorClassMaxWisModifier={
            resource.armor_class_max_wis_modifier ?? 0
          }
        />
        <ArmorEditorArmorClassChaModifier
          defaultArmorClassIncludesChaModifier={
            typeof resource.armor_class_max_cha_modifier === "number"
          }
          defaultArmorClassMaxChaModifier={
            resource.armor_class_max_cha_modifier ?? 0
          }
        />
      </HStack>

      <HStack align="flex-start" gap={4}>
        <ArmorEditorRequiredStr defaultRequiredStr={resource.required_str} />
        <ArmorEditorRequiredDex defaultRequiredDex={resource.required_dex} />
        <ArmorEditorRequiredCon defaultRequiredCon={resource.required_con} />
      </HStack>

      <HStack align="flex-start" gap={4}>
        <ArmorEditorRequiredInt defaultRequiredInt={resource.required_int} />
        <ArmorEditorRequiredWis defaultRequiredWis={resource.required_wis} />
        <ArmorEditorRequiredCha defaultRequiredCha={resource.required_cha} />
      </HStack>

      <ArmorEditorDisadvantageOnStealth
        defaultDisadvantageOnStealth={resource.disadvantage_on_stealth}
      />

      <HStack align="flex-start" gap={4}>
        <ArmorEditorWeight defaultWeight={resource.weight} />
        <ArmorEditorCost defaultCost={resource.cost} />
      </HStack>

      <ArmorEditorNotes defaultNotes={resource.notes[lang] ?? ""} />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Armor Class Includes <Ability> Modifier
//------------------------------------------------------------------------------

function ArmorEditorArmorClassChaModifier({
  defaultArmorClassIncludesChaModifier,
  defaultArmorClassMaxChaModifier,
}: {
  defaultArmorClassIncludesChaModifier: boolean;
  defaultArmorClassMaxChaModifier: number;
}) {
  const { t } = useI18nLangContext(i18nContext);

  const { error: includesModifierError, ...includesModifier } =
    useArmorEditorFormArmorClassIncludesChaModifier(
      defaultArmorClassIncludesChaModifier,
    );
  const { error: maxModifierError, ...maxModifier } =
    useArmorEditorFormArmorClassMaxChaModifier(defaultArmorClassMaxChaModifier);
  const message =
    includesModifierError ? t(includesModifierError)
    : maxModifierError ? t(maxModifierError)
    : undefined;

  return (
    <Field error={message} label={t("armor_class_modifier[cha].label")}>
      <HStack>
        <Checkbox {...includesModifier} />
        <NumberInput {...maxModifier} disabled={!includesModifier.value} />
      </HStack>
    </Field>
  );
}

function ArmorEditorArmorClassConModifier({
  defaultArmorClassIncludesConModifier,
  defaultArmorClassMaxConModifier,
}: {
  defaultArmorClassIncludesConModifier: boolean;
  defaultArmorClassMaxConModifier: number;
}) {
  const { t } = useI18nLangContext(i18nContext);

  const { error: includesModifierError, ...includesModifier } =
    useArmorEditorFormArmorClassIncludesConModifier(
      defaultArmorClassIncludesConModifier,
    );
  const { error: maxModifierError, ...maxModifier } =
    useArmorEditorFormArmorClassMaxConModifier(defaultArmorClassMaxConModifier);
  const message =
    includesModifierError ? t(includesModifierError)
    : maxModifierError ? t(maxModifierError)
    : undefined;

  return (
    <Field error={message} label={t("armor_class_modifier[con].label")}>
      <HStack>
        <Checkbox {...includesModifier} />
        <NumberInput {...maxModifier} disabled={!includesModifier.value} />
      </HStack>
    </Field>
  );
}

function ArmorEditorArmorClassDexModifier({
  defaultArmorClassIncludesDexModifier,
  defaultArmorClassMaxDexModifier,
}: {
  defaultArmorClassIncludesDexModifier: boolean;
  defaultArmorClassMaxDexModifier: number;
}) {
  const { t } = useI18nLangContext(i18nContext);

  const { error: includesModifierError, ...includesModifier } =
    useArmorEditorFormArmorClassIncludesDexModifier(
      defaultArmorClassIncludesDexModifier,
    );
  const { error: maxModifierError, ...maxModifier } =
    useArmorEditorFormArmorClassMaxDexModifier(defaultArmorClassMaxDexModifier);
  const message =
    includesModifierError ? t(includesModifierError)
    : maxModifierError ? t(maxModifierError)
    : undefined;

  return (
    <Field error={message} label={t("armor_class_modifier[dex].label")}>
      <HStack>
        <Checkbox {...includesModifier} />
        <NumberInput {...maxModifier} disabled={!includesModifier.value} />
      </HStack>
    </Field>
  );
}

function ArmorEditorArmorClassIntModifier({
  defaultArmorClassIncludesIntModifier,
  defaultArmorClassMaxIntModifier,
}: {
  defaultArmorClassIncludesIntModifier: boolean;
  defaultArmorClassMaxIntModifier: number;
}) {
  const { t } = useI18nLangContext(i18nContext);

  const { error: includesModifierError, ...includesModifier } =
    useArmorEditorFormArmorClassIncludesIntModifier(
      defaultArmorClassIncludesIntModifier,
    );
  const { error: maxModifierError, ...maxModifier } =
    useArmorEditorFormArmorClassMaxIntModifier(defaultArmorClassMaxIntModifier);
  const message =
    includesModifierError ? t(includesModifierError)
    : maxModifierError ? t(maxModifierError)
    : undefined;

  return (
    <Field error={message} label={t("armor_class_modifier[int].label")}>
      <HStack>
        <Checkbox {...includesModifier} />
        <NumberInput {...maxModifier} disabled={!includesModifier.value} />
      </HStack>
    </Field>
  );
}

function ArmorEditorArmorClassStrModifier({
  defaultArmorClassIncludesStrModifier,
  defaultArmorClassMaxStrModifier,
}: {
  defaultArmorClassIncludesStrModifier: boolean;
  defaultArmorClassMaxStrModifier: number;
}) {
  const { t } = useI18nLangContext(i18nContext);

  const { error: includesModifierError, ...includesModifier } =
    useArmorEditorFormArmorClassIncludesStrModifier(
      defaultArmorClassIncludesStrModifier,
    );
  const { error: maxModifierError, ...maxModifier } =
    useArmorEditorFormArmorClassMaxStrModifier(defaultArmorClassMaxStrModifier);
  const message =
    includesModifierError ? t(includesModifierError)
    : maxModifierError ? t(maxModifierError)
    : undefined;

  return (
    <Field error={message} label={t("armor_class_modifier[str].label")}>
      <HStack>
        <Checkbox {...includesModifier} />
        <NumberInput {...maxModifier} disabled={!includesModifier.value} />
      </HStack>
    </Field>
  );
}

function ArmorEditorArmorClassWisModifier({
  defaultArmorClassIncludesWisModifier,
  defaultArmorClassMaxWisModifier,
}: {
  defaultArmorClassIncludesWisModifier: boolean;
  defaultArmorClassMaxWisModifier: number;
}) {
  const { t } = useI18nLangContext(i18nContext);

  const { error: includesModifierError, ...includesModifier } =
    useArmorEditorFormArmorClassIncludesWisModifier(
      defaultArmorClassIncludesWisModifier,
    );
  const { error: maxModifierError, ...maxModifier } =
    useArmorEditorFormArmorClassMaxWisModifier(defaultArmorClassMaxWisModifier);
  const message =
    includesModifierError ? t(includesModifierError)
    : maxModifierError ? t(maxModifierError)
    : undefined;

  return (
    <Field error={message} label={t("armor_class_modifier[wis].label")}>
      <HStack>
        <Checkbox {...includesModifier} />
        <NumberInput {...maxModifier} />
      </HStack>
    </Field>
  );
}

//------------------------------------------------------------------------------
// Armor Class Modifier
//------------------------------------------------------------------------------

function ArmorEditorArmorClassModifier({
  defaultArmorClassModifier,
}: {
  defaultArmorClassModifier: number;
}) {
  const { t } = useI18nLangContext(i18nContext);

  const { error, ...rest } = useArmorEditorFormArmorClassModifier(
    defaultArmorClassModifier,
  );
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("armor_class_modifier.label")}>
      <NumberInput {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Base Armor Class
//------------------------------------------------------------------------------

function ArmorEditorBaseArmorClass({
  defaultBaseArmorClass,
}: {
  defaultBaseArmorClass: number;
}) {
  const { t } = useI18nLangContext(i18nContext);

  const { error, ...rest } = useArmorEditorFormBaseArmorClass(
    defaultBaseArmorClass,
  );
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("base_armor_class.label")}>
      <NumberInput {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Cost
//------------------------------------------------------------------------------

function ArmorEditorCost({ defaultCost }: { defaultCost: number }) {
  const { error, ...rest } = useArmorEditorFormCost(defaultCost);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("cost.label")}>
      <CostInput min={0} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Disadvantage on Stealth
//------------------------------------------------------------------------------

function ArmorEditorDisadvantageOnStealth({
  defaultDisadvantageOnStealth,
}: {
  defaultDisadvantageOnStealth: boolean;
}) {
  const { error: _, ...rest } = useArmorEditorFormDisadvantageOnStealth(
    defaultDisadvantageOnStealth,
  );
  const { t } = useI18nLangContext(i18nContext);

  return (
    <Switch label={t("disadvantage_on_stealth.label")} size="lg" {...rest} />
  );
}

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function ArmorEditorName({ defaultName }: { defaultName: string }) {
  const { error, ...rest } = useArmorEditorFormName(defaultName);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("name.label")}>
      <Input autoComplete="off" placeholder={t("name.placeholder")} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Notes
//------------------------------------------------------------------------------

function ArmorEditorNotes({ defaultNotes }: { defaultNotes: string }) {
  const { error, ...rest } = useArmorEditorFormNotes(defaultNotes);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("notes.label")}>
      <Textarea placeholder={t("notes.placeholder")} rows={5} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Page
//------------------------------------------------------------------------------

function ArmorEditorPage({ defaultPage }: { defaultPage: number }) {
  const { error, ...rest } = useArmorEditorFormPage(defaultPage);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("page.label")} maxW="6em">
      <NumberInput {...rest} w="6em" />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Required <Ability>
//------------------------------------------------------------------------------

function ArmorEditorRequiredCha({
  defaultRequiredCha,
}: {
  defaultRequiredCha: number;
}) {
  const { error, ...rest } = useArmorEditorFormRequiredCha(defaultRequiredCha);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("required[cha].label")}>
      <NumberInput {...rest} />
    </Field>
  );
}

function ArmorEditorRequiredCon({
  defaultRequiredCon,
}: {
  defaultRequiredCon: number;
}) {
  const { error, ...rest } = useArmorEditorFormRequiredCon(defaultRequiredCon);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("required[con].label")}>
      <NumberInput {...rest} />
    </Field>
  );
}

function ArmorEditorRequiredDex({
  defaultRequiredDex,
}: {
  defaultRequiredDex: number;
}) {
  const { error, ...rest } = useArmorEditorFormRequiredDex(defaultRequiredDex);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("required[dex].label")}>
      <NumberInput {...rest} />
    </Field>
  );
}

function ArmorEditorRequiredInt({
  defaultRequiredInt,
}: {
  defaultRequiredInt: number;
}) {
  const { error, ...rest } = useArmorEditorFormRequiredInt(defaultRequiredInt);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("required[int].label")}>
      <NumberInput {...rest} />
    </Field>
  );
}

function ArmorEditorRequiredStr({
  defaultRequiredStr,
}: {
  defaultRequiredStr: number;
}) {
  const { error, ...rest } = useArmorEditorFormRequiredStr(defaultRequiredStr);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("required[str].label")}>
      <NumberInput {...rest} />
    </Field>
  );
}

function ArmorEditorRequiredWis({
  defaultRequiredWis,
}: {
  defaultRequiredWis: number;
}) {
  const { error, ...rest } = useArmorEditorFormRequiredWis(defaultRequiredWis);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("required[wis].label")}>
      <NumberInput {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Type
//------------------------------------------------------------------------------

function ArmorEditorType({ defaultType }: { defaultType: Armor["type"] }) {
  const typeOptions = useListCollection(useArmorTypeOptions());
  const { error, ...rest } = useArmorEditorFormType(defaultType);
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

function ArmorEditorVisibility({
  defaultVisibility,
}: {
  defaultVisibility: Armor["visibility"];
}) {
  const visibilityOptions = useListCollection(useCampaignRoleOptions());
  const { error, ...rest } = useArmorEditorFormVisibility(defaultVisibility);
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

function ArmorEditorWeight({ defaultWeight }: { defaultWeight: number }) {
  const { error, ...rest } = useArmorEditorFormWeight(defaultWeight);
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
  "armor_class_modifier.label": {
    en: "Armor Class Modifier",
    it: "Modificatore Classe Armatura",
  },
  "armor_class_modifier[cha].label": {
    en: "Max Charisma Modifier",
    it: "Mod. Carisma Massimo",
  },
  "armor_class_modifier[con].label": {
    en: "Max Constitution Modifier",
    it: "Mod. Costituzione Massimo",
  },
  "armor_class_modifier[dex].label": {
    en: "Max Dexterity Modifier",
    it: "Mod. Destrezza Massimo",
  },
  "armor_class_modifier[int].label": {
    en: "Intelligence Modifier",
    it: "Mod. Intelligenza Massimo",
  },
  "armor_class_modifier[str].label": {
    en: "Max Strength Modifier",
    it: "Mod. Forza Massimo",
  },
  "armor_class_modifier[wis].label": {
    en: "Max Wisdom Modifier",
    it: "Mod. Saggezza Massimo",
  },
  "base_armor_class.label": {
    en: "Base Armor Class",
    it: "Classe Armatura Base",
  },
  "cost.label": {
    en: "Cost",
    it: "Costo",
  },
  "disadvantage_on_stealth.label": {
    en: "Disadvantage on stealth",
    it: "Svantaggio su furtività",
  },
  "form.error.creation_failure": {
    en: "Failed to create the armor.",
    it: "Errore durante la creazione.",
  },
  "form.error.invalid": {
    en: "The inserted data is not valid.",
    it: "I dati inseriti non sono validi.",
  },
  "form.error.invalid_translation": {
    en: "The inserted data is not valid.",
    it: "I dati inseriti non sono validi.",
  },
  "form.error.update_failure": {
    en: "Failed to update the armor.",
    it: "Errore durante il salvataggio.",
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
    en: "E.g.: Padded Armor",
    it: "Es: Armatura Imbottita",
  },
  "notes.label": {
    en: "Notes",
    it: "Note",
  },
  "notes.placeholder": {
    en: "E.g.: Grants resistance to fire damage.",
    it: "Es: Fornisce resistenza ai danni da fuoco.",
  },
  "page.label": {
    en: "Page",
    it: "Pagina",
  },
  "required[cha].label": {
    en: "Min Charisma",
    it: "Carisma Mininmo",
  },
  "required[con].label": {
    en: "Min Constitution",
    it: "Costituzione Mininma",
  },
  "required[dex].label": {
    en: "Min Dexterity",
    it: "Destrezza Mininma",
  },
  "required[int].label": {
    en: "Min Intelligence",
    it: "Intelligenza Mininma",
  },
  "required[str].label": {
    en: "Min Strength",
    it: "Forza Mininma",
  },
  "required[wis].label": {
    en: "Min Wisdom",
    it: "Saggezza Mininma",
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
