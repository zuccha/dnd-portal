import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { metamagicStore } from "~/models/resources/metamagics/metamagic-store";
import ResourceDetailContent from "../../detail/resource-detail-content";
import ResourceDetailField from "../../detail/resource-detail-field";

type MetamagicDetailResource = ReturnType<typeof metamagicStore.useLocalizedResource>;

//------------------------------------------------------------------------------
// Metamagic Detail
//------------------------------------------------------------------------------

export default function MetamagicDetail({ resource }: { resource: MetamagicDetailResource }) {
  const { t } = useI18nLangContext(i18nContext);
  const metamagic = resource;

  return (
    <ResourceDetailContent
      detailsContent={
        metamagic && (
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
        )
      }
      resource={metamagic}
    />
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
