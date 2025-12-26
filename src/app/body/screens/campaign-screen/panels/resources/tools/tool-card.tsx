import { HStack, Span, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedTool } from "~/models/resources/equipment/tools/localized-tool";
import type { Tool } from "~/models/resources/equipment/tools/tool";
import { useIsToolSelected } from "~/models/resources/equipment/tools/tools-store";
import RichText from "~/ui/rich-text";
import ResourceCard from "../_base/resource-card";

//------------------------------------------------------------------------------
// Tool Card
//------------------------------------------------------------------------------

export type ToolCardProps = {
  canEdit: boolean;
  localizedResource: LocalizedTool;
  onOpen: (resource: Tool) => void;
};

export default function ToolCard({
  canEdit,
  localizedResource,
  onOpen,
}: ToolCardProps) {
  const { t } = useI18nLangContext(i18nContext);

  const { ability, cost, craft, id, magic_type, notes, type, utilize, weight } =
    localizedResource;

  const [selected, { toggle }] = useIsToolSelected(id);

  return (
    <ResourceCard
      canEdit={canEdit}
      localizedResource={localizedResource}
      onOpen={onOpen}
      onToggleSelected={toggle}
      selected={selected}
    >
      <ResourceCard.Caption>
        <VStack gap={0} w="full">
          <HStack justify="space-between" w="full">
            <Span>{type}</Span>
            <Span>{cost}</Span>
          </HStack>
          <HStack justify="space-between" w="full">
            <Span>{magic_type}</Span>
            <Span>{weight}</Span>
          </HStack>
        </VStack>
      </ResourceCard.Caption>

      <ResourceCard.Info>
        <ResourceCard.InfoCell label={t("ability")}>
          {ability}
        </ResourceCard.InfoCell>

        {utilize && (
          <ResourceCard.InfoCell label={t("utilize")}>
            {utilize}
          </ResourceCard.InfoCell>
        )}

        {craft && (
          <ResourceCard.InfoCell label={t("craft")}>
            <RichText text={craft} />
          </ResourceCard.InfoCell>
        )}
      </ResourceCard.Info>

      <ResourceCard.Description description={notes} />
    </ResourceCard>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  ability: {
    en: "Ability",
    it: "Abilità",
  },
  craft: {
    en: "Craft",
    it: "Creazione",
  },
  utilize: {
    en: "Utilize",
    it: "Utilizzo",
  },
};
