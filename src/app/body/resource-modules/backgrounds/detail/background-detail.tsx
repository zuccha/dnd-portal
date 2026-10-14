import { SimpleGrid, Span } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import { backgroundStore } from "~/models/resources/backgrounds/background-store";
import { toolStore } from "~/models/resources/equipment/tools/tool-store";
import { featStore } from "~/models/resources/feats/feat-store";
import { resourceDetailRoute } from "~/navigation/routes";
import RouterLink from "~/ui/router-link";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type BackgroundDetailResource = ReturnType<typeof backgroundStore.useLocalizedResource>;
const { useLocalizedResourceName: useLocalizedFeatName } = featStore;
const { useLocalizedResourceName: useLocalizedToolName } = toolStore;

//------------------------------------------------------------------------------
// Background Detail
//------------------------------------------------------------------------------

export default function BackgroundDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: BackgroundDetailResource;
}) {
  const { lang, t } = useI18nLangContext(i18nContext);
  const background = resource;
  const featId = background?._raw.feat_id ?? "";
  const toolId = background?._raw.tool_proficiency_id ?? "";
  const featName = useLocalizedFeatName(featId);
  const toolName = useLocalizedToolName(toolId);
  const featNotes = background ? translate(background._raw.feat_notes, lang) : "";
  const toolNotes = background ? translate(background._raw.tool_notes, lang) : "";
  const fields = background
    ? [
        { label: t("ability_scores"), value: background.ability_scores },
        { label: t("skills"), value: background.skill_proficiencies },
      ].filter(({ value }) => Boolean(value))
    : [];

  return (
    <ResourceDetail actions={actions} resource={background}>
      {background && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
          {fields.map(({ label, value }) => (
            <ResourceDetailField key={label} label={label}>
              {value}
            </ResourceDetailField>
          ))}
          {featId && (
            <ResourceDetailField label={t("feat")}>
              <RouterLink to={resourceDetailRoute("feat", featId)}>
                {featName || background.feat}
              </RouterLink>
              {featNotes && <Span> ({featNotes})</Span>}
            </ResourceDetailField>
          )}
          {toolId && (
            <ResourceDetailField label={t("tool")}>
              <RouterLink to={resourceDetailRoute("tool", toolId)}>
                {toolName || background.tool_proficiency}
              </RouterLink>
              {toolNotes && <Span> ({toolNotes})</Span>}
            </ResourceDetailField>
          )}
        </SimpleGrid>
      )}
    </ResourceDetail>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  ability_scores: {
    en: "Ability Scores",
    it: "Punteggi di Caratteristica",
  },
  feat: {
    en: "Feat",
    it: "Talento",
  },
  skills: {
    en: "Skills",
    it: "Abilità",
  },
  tool: {
    en: "Tool",
    it: "Strumento",
  },
};
