import { Box, HStack, Heading, Separator, Span, Text, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { resolveSystemText, useI18nSystem } from "~/i18n/i18n-system";
import type { LocalizedResourceUnion } from "~/models/resources/resource-union";
import PageTitle from "~/navigation/page-title";
import RichText from "~/ui/rich-text";
import ResourceDetailNotFound from "./resource-detail-not-found";
import type { ReactNode } from "react";

//------------------------------------------------------------------------------
// Resource Detail Content
//------------------------------------------------------------------------------

export default function ResourceDetailContent({
  resource,
}: {
  resource: LocalizedResourceUnion | undefined;
}) {
  const { t, ti } = useI18nLangContext(i18nContext);
  const [system] = useI18nSystem();

  if (!resource) return <ResourceDetailNotFound message={t("not_found")} />;

  const details = resolveSystemText(resource.details, system).replace(
    /[\r\n]*##(.+?)##[\r\n]*/g,
    "##$1##",
  );

  return (
    <>
      <PageTitle title={resource.name || t("unnamed")} />
      <Box h="full" overflowY="auto" px={{ base: 5, md: 8 }} py={{ base: 6, md: 10 }}>
        <VStack align="stretch" gap={3} mx="auto" maxW="4xl">
          <VStack align="stretch" gap={1.5}>
            <Heading size="2xl">{resource.name || t("unnamed")}</Heading>
            {resource.descriptor && (
              <Text color="fg.muted" fontSize="lg">
                {resource.descriptor}
              </Text>
            )}
            <HStack color="fg.muted" flexWrap="wrap" fontSize="sm" gap={2}>
              <Text>{resource.sourceVersion}</Text>
              <Text aria-hidden="true">·</Text>
              <Text>{resource.source}</Text>
              {resource.page && (
                <>
                  <Text aria-hidden="true">·</Text>
                  <Text>{ti("page", resource.page)}</Text>
                </>
              )}
            </HStack>
          </VStack>

          <Separator />

          {details ? (
            <RichText
              display="block"
              lineHeight="tall"
              patterns={detailRichTextPatterns}
              text={details}
              whiteSpace="pre-wrap"
            />
          ) : (
            <Text color="fg.muted">{t("no_details")}</Text>
          )}
        </VStack>
      </Box>
    </>
  );
}

//------------------------------------------------------------------------------
// Detail Rich Text Patterns
//------------------------------------------------------------------------------

const detailRichTextPatterns = [
  {
    regex: /##(.+?)##/,
    render: (value: ReactNode) => (
      <Span display="block" fontSize="xl" fontWeight="semibold" lineHeight="short" mt={2}>
        {value}
      </Span>
    ),
  },
  ...RichText.defaultPatterns.slice(1),
];

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "name.missing": {
    en: "Unnamed resource",
    it: "Risorsa senza nome",
  },
  "no_details": {
    en: "No additional details are available for this resource.",
    it: "Non sono disponibili altri dettagli per questa risorsa.",
  },
  "not_found": {
    en: "This resource could not be found.",
    it: "Impossibile trovare questa risorsa.",
  },
  "page": {
    en: "p. <1>",
    it: "p. <1>",
  },
};
