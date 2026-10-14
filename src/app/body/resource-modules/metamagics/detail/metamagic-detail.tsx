import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { metamagicStore } from "~/models/resources/metamagics/metamagic-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type MetamagicDetailResource = ReturnType<typeof metamagicStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Metamagic Detail
//------------------------------------------------------------------------------

export default function MetamagicDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: MetamagicDetailResource;
}) {
  const { t } = useI18nLangContext(i18nContext);
  const metamagic = resource;

  return (
    <ResourceDetail actions={actions} resource={metamagic}>
      {metamagic && (
        <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
          <ResourceDetailField label={t("sorcery_points")}>
            {metamagic.sorcery_points}
          </ResourceDetailField>
          {metamagic.prerequisite && (
            <ResourceDetailField label={t("prerequisite")}>
              {metamagic.prerequisite}
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
  prerequisite: {
    en: "Prerequisite",
    it: "Prerequisito",
  },
  sorcery_points: {
    en: "Sorcery Points",
    it: "Punti Stregoneria",
  },
};
