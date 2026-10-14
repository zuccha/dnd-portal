import { SimpleGrid } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { eldritchInvocationStore } from "~/models/resources/eldritch-invocations/eldritch-invocation-store";
import ResourceDetail, { type ResourceDetailAction } from "../../resource-detail";
import ResourceDetailField from "../../resource-detail-field";

type EldritchInvocationDetailResource = ReturnType<
  typeof eldritchInvocationStore.useLocalizedResource
>;

//------------------------------------------------------------------------------
// Eldritch Invocation Detail
//------------------------------------------------------------------------------

export default function EldritchInvocationDetail({
  actions,
  resource,
}: {
  actions?: ResourceDetailAction[];
  resource: EldritchInvocationDetailResource;
}) {
  const { t } = useI18nLangContext(i18nContext);
  const invocation = resource;

  return (
    <ResourceDetail actions={actions} resource={invocation}>
      {invocation && (invocation._raw.min_warlock_level > 0 || invocation.other_prerequisite) && (
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
      )}
    </ResourceDetail>
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
