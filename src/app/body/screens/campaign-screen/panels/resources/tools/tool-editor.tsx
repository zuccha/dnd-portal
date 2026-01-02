import { HStack, VStack } from "@chakra-ui/react";
import useListCollection from "~/hooks/use-list-collection";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Tool } from "~/models/resources/equipment/tools/tool";
import { useCampaignRoleOptions } from "~/models/types/campaign-role";
import { useCreatureAbilityOptions } from "~/models/types/creature-ability";
import { useToolTypeOptions } from "~/models/types/tool-type";
import CostInput from "~/ui/cost-input";
import Field from "~/ui/field";
import Input from "~/ui/input";
import NumberInput from "~/ui/number-input";
import Select from "~/ui/select";
import Switch from "~/ui/switch";
import Textarea from "~/ui/textarea";
import WeightInput from "~/ui/weight-input";
import {
  useToolEditorFormAbility,
  useToolEditorFormCost,
  useToolEditorFormCraft,
  useToolEditorFormMagic,
  useToolEditorFormName,
  useToolEditorFormNotes,
  useToolEditorFormPage,
  useToolEditorFormType,
  useToolEditorFormUtilize,
  useToolEditorFormVisibility,
  useToolEditorFormWeight,
} from "./tool-editor-form";

//------------------------------------------------------------------------------
// Tool Editor
//------------------------------------------------------------------------------

export type ToolEditorProps = {
  resource: Tool;
};

export default function ToolEditor({ resource }: ToolEditorProps) {
  const { lang } = useI18nLangContext(i18nContext);

  return (
    <VStack align="stretch" gap={4}>
      <HStack align="flex-start" gap={4}>
        <ToolEditorName defaultName={resource.name[lang] ?? ""} />
        <ToolEditorPage defaultPage={resource.page?.[lang] ?? 0} />
        <ToolEditorVisibility defaultVisibility={resource.visibility} />
      </HStack>

      <HStack align="flex-start" gap={4}>
        <ToolEditorType defaultType={resource.type} />
        <ToolEditorAbility defaultAbility={resource.ability} />
      </HStack>

      <HStack align="flex-start" gap={4}>
        <ToolEditorWeight defaultWeight={resource.weight} />
        <ToolEditorCost defaultCost={resource.cost} />
      </HStack>

      <ToolEditorMagic defaultMagic={resource.magic} />

      <ToolEditorUtilize defaultUtilize={resource.utilize[lang] ?? ""} />
      <ToolEditorCraft defaultCraft={resource.craft[lang] ?? ""} />

      <ToolEditorNotes defaultNotes={resource.notes[lang] ?? ""} />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Ability
//------------------------------------------------------------------------------

function ToolEditorAbility({
  defaultAbility,
}: {
  defaultAbility: Tool["ability"];
}) {
  const abilityOptions = useListCollection(useCreatureAbilityOptions());
  const { error, ...rest } = useToolEditorFormAbility(defaultAbility);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("ability.label")}>
      <Select options={abilityOptions} withinDialog {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Cost
//------------------------------------------------------------------------------

function ToolEditorCost({ defaultCost }: { defaultCost: number }) {
  const { error, ...rest } = useToolEditorFormCost(defaultCost);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("cost.label")}>
      <CostInput min={0} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Craft
//------------------------------------------------------------------------------

function ToolEditorCraft({ defaultCraft }: { defaultCraft: string }) {
  const { error, ...rest } = useToolEditorFormCraft(defaultCraft);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("craft.label")}>
      <Textarea
        bgColor="bg.info"
        placeholder={t("craft.placeholder")}
        rows={5}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Magic
//------------------------------------------------------------------------------

function ToolEditorMagic({ defaultMagic }: { defaultMagic: boolean }) {
  const { error: _, ...rest } = useToolEditorFormMagic(defaultMagic);
  const { t } = useI18nLangContext(i18nContext);

  return <Switch label={t("magic.label")} size="lg" {...rest} />;
}

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function ToolEditorName({ defaultName }: { defaultName: string }) {
  const { error, ...rest } = useToolEditorFormName(defaultName);
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

function ToolEditorNotes({ defaultNotes }: { defaultNotes: string }) {
  const { error, ...rest } = useToolEditorFormNotes(defaultNotes);
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

function ToolEditorPage({ defaultPage }: { defaultPage: number }) {
  const { error, ...rest } = useToolEditorFormPage(defaultPage);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("page.label")} maxW="6em">
      <NumberInput bgColor="bg.info" {...rest} w="6em" />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Type
//------------------------------------------------------------------------------

function ToolEditorType({ defaultType }: { defaultType: Tool["type"] }) {
  const typeOptions = useListCollection(useToolTypeOptions());
  const { error, ...rest } = useToolEditorFormType(defaultType);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("type.label")}>
      <Select options={typeOptions} withinDialog {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Utilize
//------------------------------------------------------------------------------

function ToolEditorUtilize({ defaultUtilize }: { defaultUtilize: string }) {
  const { error, ...rest } = useToolEditorFormUtilize(defaultUtilize);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("utilize.label")}>
      <Textarea
        bgColor="bg.info"
        placeholder={t("utilize.placeholder")}
        rows={5}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

function ToolEditorVisibility({
  defaultVisibility,
}: {
  defaultVisibility: Tool["visibility"];
}) {
  const visibilityOptions = useListCollection(useCampaignRoleOptions());
  const { error, ...rest } = useToolEditorFormVisibility(defaultVisibility);
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

function ToolEditorWeight({ defaultWeight }: { defaultWeight: number }) {
  const { error, ...rest } = useToolEditorFormWeight(defaultWeight);
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
  "ability.label": {
    en: "Ability",
    it: "Caratteristica",
  },
  "cost.label": {
    en: "Cost",
    it: "Costo",
  },
  "craft.label": {
    en: "Craft",
    it: "Creazione",
  },
  "craft.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "magic.label": {
    en: "Magic",
    it: "Magico",
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
    en: "E.g.: Forgery Kit",
    it: "Es: Arnesi da Falsario",
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
  "type.label": {
    en: "Type",
    it: "Tipo",
  },
  "utilize.label": {
    en: "Utilize",
    it: "Utilizzo",
  },
  "utilize.placeholder": {
    en: "None",
    it: "Nessuno",
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
