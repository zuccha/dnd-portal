import { HStack, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Plane } from "~/models/resources/planes/plane";
import { useCampaignRoleOptions } from "~/models/types/campaign-role";
import { useCreatureAlignmentOptions } from "~/models/types/creature-alignment";
import { usePlaneCategoryOptions } from "~/models/types/plane-category";
import Field from "~/ui/field";
import Input from "~/ui/input";
import NumberInput from "~/ui/number-input";
import Select from "~/ui/select";
import {
  usePlaneEditorFormAlignments,
  usePlaneEditorFormCategory,
  usePlaneEditorFormName,
  usePlaneEditorFormPage,
  usePlaneEditorFormVisibility,
} from "./plane-editor-form";

//------------------------------------------------------------------------------
// Plane Editor
//------------------------------------------------------------------------------

export type PlaneEditorProps = {
  resource: Plane;
};

export default function PlaneEditor({ resource }: PlaneEditorProps) {
  const { lang } = useI18nLangContext(i18nContext);

  return (
    <VStack align="stretch" gap={4}>
      <HStack align="flex-start" gap={4}>
        <PlaneEditorName defaultName={resource.name[lang] ?? ""} />
        <PlaneEditorPage defaultPage={resource.page?.[lang] ?? 0} />
        <PlaneEditorVisibility defaultVisibility={resource.visibility} />
      </HStack>

      <HStack align="flex-start" gap={4}>
        <PlaneEditorAlignments defaultAlignments={resource.alignments} />
        <PlaneEditorCategory defaultCategory={resource.category} />
      </HStack>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Alignments
//------------------------------------------------------------------------------

function PlaneEditorAlignments({
  defaultAlignments,
}: {
  defaultAlignments: Plane["alignments"];
}) {
  const creatureAlignmentOptions = useCreatureAlignmentOptions();
  const { error, ...rest } = usePlaneEditorFormAlignments(defaultAlignments);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("alignments.label")}>
      <Select.Enum
        multiple
        options={creatureAlignmentOptions}
        placeholder={t("alignments.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Category
//------------------------------------------------------------------------------

function PlaneEditorCategory({
  defaultCategory,
}: {
  defaultCategory: Plane["category"];
}) {
  const planeCategoryOptions = usePlaneCategoryOptions();
  const { error, ...rest } = usePlaneEditorFormCategory(defaultCategory);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("category.label")}>
      <Select.Enum
        options={planeCategoryOptions}
        placeholder={t("category.placeholder")}
        withinDialog
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function PlaneEditorName({ defaultName }: { defaultName: string }) {
  const { error, ...rest } = usePlaneEditorFormName(defaultName);
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
// Page
//------------------------------------------------------------------------------

function PlaneEditorPage({ defaultPage }: { defaultPage: number }) {
  const { error, ...rest } = usePlaneEditorFormPage(defaultPage);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("page.label")} maxW="6em">
      <NumberInput bgColor="bg.info" {...rest} w="6em" />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

function PlaneEditorVisibility({
  defaultVisibility,
}: {
  defaultVisibility: Plane["visibility"];
}) {
  const visibilityOptions = useCampaignRoleOptions();
  const { error, ...rest } = usePlaneEditorFormVisibility(defaultVisibility);
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
  "alignments.label": {
    en: "Alignment",
    it: "Allineamento",
  },
  "alignments.placeholder": {
    en: "None",
    it: "Nessuno",
  },
  "category.label": {
    en: "Category",
    it: "Categoria",
  },
  "category.placeholder": {
    en: "None",
    it: "Nessuna",
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
    en: "E.g.: Common",
    it: "Es: Comune",
  },
  "page.label": {
    en: "Page",
    it: "Pagina",
  },
  "visibility.label": {
    en: "Visibility",
    it: "Visibilità",
  },
};
