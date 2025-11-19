import { HStack, VStack } from "@chakra-ui/react";
import useListCollection from "~/hooks/use-list-collection";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { EldritchInvocation } from "~/resources/eldritch-invocations/eldritch-invocation";
import { useCampaignRoleOptions } from "~/resources/types/campaign-role";
import { useCharacterLevelOptions } from "~/resources/types/character-level";
import Field from "~/ui/field";
import Input from "~/ui/input";
import Select from "~/ui/select";
import Textarea from "~/ui/textarea";
import {
  useEldritchInvocationEditorFormDescription,
  useEldritchInvocationEditorFormMinWarlockLevel,
  useEldritchInvocationEditorFormName,
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
        <EldritchInvocationEditorMinWarlockLevel
          defaultMinWarlockLevel={resource.min_warlock_level}
        />
        <EldritchInvocationEditorVisibility
          defaultVisibility={resource.visibility}
        />
      </HStack>

      <EldritchInvocationEditorPrerequisite
        defaultPrerequisite={resource.prerequisite[lang] ?? ""}
      />

      <EldritchInvocationEditorDescription
        defaultDescription={resource.description[lang] ?? ""}
      />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Eldritch Invocation Editor Name
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
      <Input autoComplete="off" placeholder={t("name.placeholder")} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Eldritch Invocation Editor Level
//------------------------------------------------------------------------------

function EldritchInvocationEditorMinWarlockLevel({
  defaultMinWarlockLevel,
}: {
  defaultMinWarlockLevel: EldritchInvocation["min_warlock_level"];
}) {
  const levelOptions = useListCollection(useCharacterLevelOptions());
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
// Eldritch Invocation Editor Visibility
//------------------------------------------------------------------------------

function EldritchInvocationEditorVisibility({
  defaultVisibility,
}: {
  defaultVisibility: EldritchInvocation["visibility"];
}) {
  const visibilityOptions = useListCollection(useCampaignRoleOptions());
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

//------------------------------------------------------------------------------
// Eldritch Invocation Editor Prerequisite
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
        placeholder={t("prerequisite.placeholder")}
        {...rest}
      />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Eldritch Invocation Editor Description
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
      <Textarea placeholder={t("description.placeholder")} {...rest} />
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
    en: "Failed to create the eldritch invocation.",
    it: "Errore durante la creazione.",
  },

  "form.error.update_failure": {
    en: "Failed to update the eldritch invocation.",
    it: "Errore durante il salvataggio.",
  },

  "name.label": {
    en: "Name",
    it: "Nome",
  },

  "name.placeholder": {
    en: "E.g.: Witch Sight",
    it: "Es: Vista Stregata",
  },

  "name.error.empty": {
    en: "The name cannot be empty",
    it: "Il nome non può essere vuoto",
  },

  "min_warlock_level.label": {
    en: "Min. Lvl.",
    it: "Lvl. Min.",
  },

  "visibility.label": {
    en: "Visibility",
    it: "Visibilità",
  },

  "prerequisite.label": {
    en: "Prerequisite",
    it: "Prerequisito",
  },

  "prerequisite.placeholder": {
    en: "None",
    it: "Nessuno",
  },

  "description.label": {
    en: "Description",
    it: "Descrizione",
  },

  "description.placeholder": {
    en: "E.g.: You have Truesight with a range of 30 feet.",
    it: "Es: Il warlock ottiene vista pure con un raggio di 9 metri.",
  },

  "description.error.empty": {
    en: "The description cannot be empty",
    it: "La descrizione non può essere vuota",
  },
};
