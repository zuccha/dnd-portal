import { HStack, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { EldritchInvocation } from "~/models/resources/eldritch-invocations/eldritch-invocation";
import { useCampaignRoleOptions } from "~/models/types/campaign-role";
import { useCharacterLevelOptions } from "~/models/types/character-level";
import Field from "~/ui/field";
import Input from "~/ui/input";
import NumberInput from "~/ui/number-input";
import Select from "~/ui/select";
import Textarea from "~/ui/textarea";
import {
  useEldritchInvocationEditorFormDescription,
  useEldritchInvocationEditorFormMinWarlockLevel,
  useEldritchInvocationEditorFormName,
  useEldritchInvocationEditorFormPage,
  useEldritchInvocationEditorFormPrerequisite,
  useEldritchInvocationEditorFormVisibility,
} from "./eldritch-invocation-editor-form";

//------------------------------------------------------------------------------
// Eldritch Invocation Editor
//------------------------------------------------------------------------------

export type EldritchInvocationEditorProps = {
  resource: EldritchInvocation;
};

export default function EldritchInvocationEditor({
  resource,
}: EldritchInvocationEditorProps) {
  const { lang } = useI18nLangContext(i18nContext);

  return (
    <VStack align="stretch" gap={4}>
      <HStack align="flex-start" gap={4}>
        <EldritchInvocationEditorName defaultName={resource.name[lang] ?? ""} />
        <EldritchInvocationEditorPage defaultPage={resource.page[lang] ?? 0} />
        <EldritchInvocationEditorVisibility
          defaultVisibility={resource.visibility}
        />
      </HStack>

      <HStack align="flex-start" gap={4}>
        <EldritchInvocationEditorMinWarlockLevel
          defaultMinWarlockLevel={resource.min_warlock_level}
        />
        <EldritchInvocationEditorPrerequisite
          defaultPrerequisite={resource.prerequisite[lang] ?? ""}
        />
      </HStack>

      <EldritchInvocationEditorDescription
        defaultDescription={resource.description[lang] ?? ""}
      />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Description
//------------------------------------------------------------------------------

function EldritchInvocationEditorDescription({
  defaultDescription,
}: {
  defaultDescription: string;
}) {
  const { error, ...rest } =
    useEldritchInvocationEditorFormDescription(defaultDescription);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("description.label")}>
      <Textarea
        bgColor="bg.info"
        placeholder={t("description.placeholder")}
        rows={5}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Level
//------------------------------------------------------------------------------

function EldritchInvocationEditorMinWarlockLevel({
  defaultMinWarlockLevel,
}: {
  defaultMinWarlockLevel: EldritchInvocation["min_warlock_level"];
}) {
  const levelOptions = useCharacterLevelOptions();
  const minWarlockLevel = useEldritchInvocationEditorFormMinWarlockLevel(
    defaultMinWarlockLevel,
  );
  const { t } = useI18nLangContext(i18nContext);

  return (
    <Field label={t("min_warlock_level.label")} maxW="5em">
      <Select
        {...minWarlockLevel}
        onValueChange={(value) =>
          minWarlockLevel.onValueChange(parseInt(value))
        }
        options={levelOptions}
        value={`${minWarlockLevel.value}`}
        withinDialog
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Name
//------------------------------------------------------------------------------

function EldritchInvocationEditorName({
  defaultName,
}: {
  defaultName: string;
}) {
  const { error, ...rest } = useEldritchInvocationEditorFormName(defaultName);
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

function EldritchInvocationEditorPage({
  defaultPage,
}: {
  defaultPage: number;
}) {
  const { error, ...rest } = useEldritchInvocationEditorFormPage(defaultPage);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("page.label")} maxW="6em">
      <NumberInput bgColor="bg.info" {...rest} w="6em" />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Prerequisite
//------------------------------------------------------------------------------

function EldritchInvocationEditorPrerequisite({
  defaultPrerequisite,
}: {
  defaultPrerequisite: string;
}) {
  const { error, ...rest } =
    useEldritchInvocationEditorFormPrerequisite(defaultPrerequisite);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("prerequisite.label")}>
      <Input
        autoComplete="off"
        bgColor="bg.info"
        placeholder={t("prerequisite.placeholder")}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Visibility
//------------------------------------------------------------------------------

function EldritchInvocationEditorVisibility({
  defaultVisibility,
}: {
  defaultVisibility: EldritchInvocation["visibility"];
}) {
  const visibilityOptions = useCampaignRoleOptions();
  const { error, ...rest } =
    useEldritchInvocationEditorFormVisibility(defaultVisibility);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("visibility.label")} maxW="10em">
      <Select options={visibilityOptions} withinDialog {...rest} />
    </Field>
  );
}

//----------------------------------------------------------------------------
// I18n Context
//----------------------------------------------------------------------------

const i18nContext = {
  "description.error.empty": {
    en: "The description cannot be empty",
    it: "La descrizione non può essere vuota",
  },
  "description.label": {
    en: "Description",
    it: "Descrizione",
  },
  "description.placeholder": {
    en: "E.g.: You have Truesight with a range of 30 feet.",
    it: "Es: Il warlock ottiene vista pure con un raggio di 9 metri.",
  },
  "min_warlock_level.label": {
    en: "Min. Lvl.",
    it: "Lvl. Min.",
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
    en: "E.g.: Witch Sight",
    it: "Es: Vista Stregata",
  },
  "page.label": {
    en: "Page",
    it: "Pagina",
  },
  "prerequisite.label": {
    en: "Prerequisite",
    it: "Prerequisito",
  },
  "prerequisite.placeholder": {
    en: "None",
    it: "Nessuno",
  },
  "visibility.label": {
    en: "Visibility",
    it: "Visibilità",
  },
};
