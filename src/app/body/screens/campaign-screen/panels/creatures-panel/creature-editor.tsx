import { Text, VStack } from "@chakra-ui/react";
import useListCollection from "../../../../../../hooks/use-list-collection";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import { type Creature } from "../../../../../../resources/creatures/creature";
import { useCampaignRoleOptions } from "../../../../../../resources/types/campaign-role";
import Field from "../../../../../../ui/field";
import Input from "../../../../../../ui/input";
import Select from "../../../../../../ui/select";
import {
  useCreatureEditorFormName,
  useCreatureEditorFormVisibility,
} from "./creature-editor-form";

//------------------------------------------------------------------------------
// Creature Editor
//------------------------------------------------------------------------------

export type CreatureEditorProps = {
  resource: Creature;
};

export default function CreatureEditor({ resource }: CreatureEditorProps) {
  const { lang, t } = useI18nLangContext(i18nContext);

  return (
    <VStack gap={4} w="full">
      <Text color="orange.500" fontSize="sm">
        {t("wip_message")}
      </Text>

      <CreatureEditorName defaultName={resource.name[lang] ?? ""} />
      <CreatureEditorVisibility defaultVisibility={resource.visibility} />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Eldritch Invocation Editor Name
//------------------------------------------------------------------------------

function CreatureEditorName({ defaultName }: { defaultName: string }) {
  const { error, ...rest } = useCreatureEditorFormName(defaultName);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("name.label")}>
      <Input autoComplete="off" placeholder={t("name.placeholder")} {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// Creature Editor Visibility
//------------------------------------------------------------------------------

function CreatureEditorVisibility({
  defaultVisibility,
}: {
  defaultVisibility: Creature["visibility"];
}) {
  const visibilityOptions = useListCollection(useCampaignRoleOptions());
  const { error, ...rest } = useCreatureEditorFormVisibility(defaultVisibility);
  const { t } = useI18nLangContext(i18nContext);
  const message = error ? t(error) : undefined;

  return (
    <Field error={message} label={t("visibility.label")} maxW="10em">
      <Select options={visibilityOptions} withinDialog {...rest} />
    </Field>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "wip_message": {
    en: "⚠️ Creature editor is work in progress. Only name and visibility can be edited for now.",
    it: "⚠️ L'editor delle creature è in corso d'opera. Solo nome e visibilità possono essere modificati per ora.",
  },

  "name.label": {
    en: "E.g.: Arch Hag",
    it: "Es: Signora delle Megere",
  },

  "name.placeholder": {
    en: "Name",
    it: "Nome",
  },

  "name.error.empty": {
    en: "Name is required",
    it: "Il nome è obbligatorio",
  },

  "visibility.label": {
    en: "Visibility",
    it: "Visibilità",
  },

  "form.error.invalid": {
    en: "Invalid form data",
    it: "Dati del modulo non validi",
  },

  "form.error.invalid_translation": {
    en: "Invalid translation data",
    it: "Dati di traduzione non validi",
  },
};
