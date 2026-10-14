import { Box, Heading, Text } from "@chakra-ui/react";
import { useParams } from "react-router";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import catalogue from "~/models/catalogue/catalogue";
import { type ResourceKind, resourceKindSchema, resourceKinds } from "~/models/types/resource-kind";
import PageTitle from "~/navigation/page-title";
import type { ComponentType } from "react";

//------------------------------------------------------------------------------
// Resource Detail Route
//------------------------------------------------------------------------------

export default function ResourceDetailRoute() {
  const { kind, resourceId } = useParams();
  const { t } = useI18nLangContext(i18nContext);
  const parsedKind = resourceKindSchema.safeParse(kind);

  if (!parsedKind.success || !resourceId) {
    return <ResourceDetailNotFound message={t("not_found")} />;
  }

  const ResourceDetail = resourceDetailByKind[parsedKind.data];
  return <ResourceDetail resourceId={resourceId} />;
}

//------------------------------------------------------------------------------
// Create Resource Detail Route
//------------------------------------------------------------------------------

function createResourceDetailRoute(kind: ResourceKind) {
  const { useResource } = catalogue.createResourceStore(kind);

  return function ResourceDetailByKind({ resourceId }: { resourceId: string }) {
    const resource = useResource(resourceId);
    const { lang, t } = useI18nLangContext(i18nContext);

    if (!resource)
      return (
        <>
          <PageTitle title={t("not_found")} />
          <ResourceDetailNotFound message={t("not_found")} />
        </>
      );

    return (
      <>
        <PageTitle title={translate(resource.name, lang) || t("unnamed")} />
        <Box h="full" overflowY="auto" p={{ base: 5, md: 8 }}>
          <Heading>{translate(resource.name, lang) || t("unnamed")}</Heading>
        </Box>
      </>
    );
  };
}

//------------------------------------------------------------------------------
// Resource Detail Not Found
//------------------------------------------------------------------------------

function ResourceDetailNotFound({ message }: { message: string }) {
  return (
    <Box h="full" p={{ base: 5, md: 8 }}>
      <Text role="alert">{message}</Text>
    </Box>
  );
}

//------------------------------------------------------------------------------
// Resource Detail Routes By Kind
//------------------------------------------------------------------------------

const resourceDetailByKind = Object.fromEntries(
  resourceKinds.map((kind) => [kind, createResourceDetailRoute(kind)]),
) as Record<ResourceKind, ComponentType<{ resourceId: string }>>;

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  not_found: {
    en: "This resource could not be found.",
    it: "Impossibile trovare questa risorsa.",
  },
  unnamed: {
    en: "Unnamed resource",
    it: "Risorsa senza nome",
  },
};
