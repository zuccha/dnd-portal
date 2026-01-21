import { HStack, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Language } from "~/models/resources/languages/language";
import { useCampaignRoleOptions } from "~/models/types/campaign-role";
import { useLanguageRarityOptions } from "~/models/types/language-rarity";
import Field from "~/ui/field";
import Input from "~/ui/input";
import NumberInput from "~/ui/number-input";
import Select from "~/ui/select";
import {
  useLanguageEditorFormName,
  useLanguageEditorFormOrigin,
  useLanguageEditorFormPage,
  useLanguageEditorFormRarity,
  useLanguageEditorFormVisibility,
} from "./language-editor-form";

//------------------------------------------------------------------------------
// Language Editor
//------------------------------------------------------------------------------

export type LanguageEditorProps = {
  resource: Language;
};

export default function LanguageEditor({ resource }: LanguageEditorProps) {
  const { lang } = useI18nLangContext(i18nContext);

  return (
    <VStack align="stretch" gap={4}>
      <HStack align="flex-start" gap={4}>
        <LanguageEditorName defaultName={resource.name[lang] ?? ""} />
        <LanguageEditorPage defaultPage={resource.page?.[lang] ?? 0} />
        <LanguageEditorVisibility defaultVisibility={resource.visibility} />
      </HStack>

      <HStack align="flex-start" gap={4}>
        <LanguageEditorRarity defaultRarity={resource.rarity} />
        <LanguageEditorOrigin defaultOrigin={resource.origin[lang] ?? ""} />
      </HStack>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function LanguageEditorName({ defaultName }: { defaultName: string }) {
  const { error, ...rest } = useLanguageEditorFormName(defaultName);
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
// Origin
//------------------------------------------------------------------------------

function LanguageEditorOrigin({ defaultOrigin }: { defaultOrigin: string }) {
  const { error, ...rest } = useLanguageEditorFormOrigin(defaultOrigin);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("origin.label")}>
      <Input
        autoComplete="off"
        bgColor="bg.info"
        placeholder={t("origin.placeholder")}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Page
//------------------------------------------------------------------------------

function LanguageEditorPage({ defaultPage }: { defaultPage: number }) {
  const { error, ...rest } = useLanguageEditorFormPage(defaultPage);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("page.label")} maxW="6em">
      <NumberInput bgColor="bg.info" {...rest} w="6em" />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Rarity
//------------------------------------------------------------------------------

function LanguageEditorRarity({
  defaultRarity,
}: {
  defaultRarity: Language["rarity"];
}) {
  const languageRarityOptions = useLanguageRarityOptions();

  const { error, ...rest } = useLanguageEditorFormRarity(defaultRarity);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("rarity.label")}>
      <Select.Enum
        options={languageRarityOptions}
        placeholder={t("rarity.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

function LanguageEditorVisibility({
  defaultVisibility,
}: {
  defaultVisibility: Language["visibility"];
}) {
  const visibilityOptions = useCampaignRoleOptions();
  const { error, ...rest } = useLanguageEditorFormVisibility(defaultVisibility);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("visibility.label")} maxW="10em">
      <Select.Enum options={visibilityOptions} withinDialog {...rest} />
    </Field>
  );
}

//----------------------------------------------------------------------------
// I18n Context
//----------------------------------------------------------------------------

const i18nContext = {
  "name.error.empty": {
    en: "The name cannot be empty",
    it: "Il nome non può essere vuoto",
  },
  "name.label": {
    en: "Name",
    it: "Nome",
  },
  "name.placeholder": {
    en: "E.g.: Common",
    it: "Es: Comune",
  },
  "origin.label": {
    en: "Origin",
    it: "Origine",
  },
  "origin.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "page.label": {
    en: "Page",
    it: "Pagina",
  },
  "rarity.label": {
    en: "Rarity",
    it: "Rarità",
  },
  "rarity.placeholder": {
    en: "None",
    it: "Nessuna",
  },
  "visibility.label": {
    en: "Visibility",
    it: "Visibilità",
  },
};
