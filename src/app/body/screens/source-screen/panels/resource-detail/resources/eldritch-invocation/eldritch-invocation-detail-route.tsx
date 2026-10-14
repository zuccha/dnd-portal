import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { eldritchInvocationStore } from "~/models/resources/eldritch-invocations/eldritch-invocation-store";
import ResourceDetailContent from "../../resource-detail-content";
import ResourceDetailField from "../../resource-detail-field";

const useLocalizedResource = eldritchInvocationStore.useLocalizedResource;

//------------------------------------------------------------------------------
// Eldritch Invocation Detail Route
//------------------------------------------------------------------------------

export default function EldritchInvocationDetailRoute({ resourceId }: { resourceId: string }) {
  const { t } = useI18nLangContext(i18nContext);
  const invocation = useLocalizedResource(resourceId);

  return (
    <ResourceDetailContent
      detailsContent={
        invocation &&
        (invocation._raw.min_warlock_level > 0 || invocation.other_prerequisite) && (
          <SimpleGrid columns={{ base: 1, sm: 2 }} columnGap={6} rowGap={2}>
            {invocation._raw.min_warlock_level > 0 && (
              <ResourceDetailField label={t("minimum_warlock_level")}>
                {invocation.min_warlock_level}
              </ResourceDetailField>
            )}
            {invocation.other_prerequisite && (
              <ResourceDetailField label={t("prerequisite")}>
                {invocation.other_prerequisite}
              </ResourceDetailField>
            )}
          </SimpleGrid>
        )
      }
      resource={invocation}
    />
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  minimum_warlock_level: {
    en: "Minimum Warlock Level",
    it: "Livello minimo da Warlock",
  },
  prerequisite: {
    en: "Prerequisite",
    it: "Prerequisito",
  },
};
