import { Badge, Box, Grid, HStack, Heading, Separator, Span, Text, VStack } from "@chakra-ui/react";
import { type ReactNode } from "react";
import { useI18nLangContext } from "../../../i18n/i18n-lang-context";
import { resolveSystemText, useI18nSystem } from "../../../i18n/i18n-system";
import PageTitle from "../../../navigation/page-title";
import IconButton, { type IconButtonProps } from "../../../ui/icon-button";
import RichText from "../../../ui/rich-text";
import ResourceImagePreview from "./resource-image-preview";

//------------------------------------------------------------------------------
// Resource Detail Action
//------------------------------------------------------------------------------

export type ResourceDetailAction = {
  colorPalette?: IconButtonProps["colorPalette"];
  disabled?: boolean;
  Icon: IconButtonProps["Icon"];
  label: string;
  onClick: () => void;
};

//------------------------------------------------------------------------------
// Resource Detail Header
//------------------------------------------------------------------------------

type ResourceDetailHeader = {
  _raw: { image_url?: string | null; virtual?: boolean };
  descriptor: string;
  details: string;
  name: string;
  page: string;
  source: string;
  sourceVersion: string;
};

//------------------------------------------------------------------------------
// Resource Detail
//------------------------------------------------------------------------------

export default function ResourceDetail({
  actions = [],
  children,
  resource,
}: {
  actions?: ResourceDetailAction[];
  children?: ReactNode;
  resource: ResourceDetailHeader | undefined;
}) {
  const { t, ti } = useI18nLangContext(i18nContext);
  const [system] = useI18nSystem();

  if (!resource) return null;

  const details = resolveSystemText(resource.details, system).replace(
    /[\r\n]*##(.+?)##[\r\n]*/g,
    "##$1##",
  );
  const imageUrl = resource._raw.image_url?.trim();

  return (
    <>
      <PageTitle title={resource.name || t("unnamed")} />
      <Box h="full" overflowY="auto" px={{ base: 5, md: 8 }} py={{ base: 6, md: 10 }}>
        <VStack align="stretch" gap={3} mx="auto" maxW="4xl">
          <Grid
            alignItems="start"
            columnGap={4}
            gridTemplateColumns="minmax(0, 1fr) auto"
            rowGap={1}
          >
            <HStack align="center" flexWrap="wrap" gap={3} gridColumn={1} gridRow={1} minW={0}>
              <Heading size="2xl">{resource.name || t("unnamed")}</Heading>
              {resource._raw.virtual && (
                <Badge colorPalette="orange" size="sm" variant="solid">
                  {t("temporary")}
                </Badge>
              )}
            </HStack>
            <HStack flexShrink={0} gap={0} gridColumn={2} gridRow={1}>
              {actions.map(({ colorPalette, disabled, Icon, label, onClick }, index) => (
                <IconButton
                  Icon={Icon}
                  colorPalette={colorPalette}
                  disabled={disabled}
                  key={index}
                  label={label}
                  onClick={onClick}
                  size="sm"
                  variant="ghost"
                />
              ))}
            </HStack>
            {resource.descriptor && (
              <Text color="fg.muted" fontSize="lg" gridColumn={1} gridRow={2}>
                {resource.descriptor}
              </Text>
            )}
            <HStack
              color="fg.muted"
              flexWrap="wrap"
              fontSize="sm"
              gap={2}
              gridColumn={1}
              gridRow={resource.descriptor ? 3 : 2}
            >
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
            {imageUrl && (
              <ResourceImagePreview
                alt={resource.name}
                gridRow={resource.descriptor ? "2 / span 2" : 2}
                imageUrl={imageUrl}
                label={t("preview_image")}
              />
            )}
          </Grid>

          <Separator />

          {children}

          {children && details && <Separator />}

          {details && (
            <RichText
              display="block"
              lineHeight="tall"
              patterns={detailRichTextPatterns}
              text={details}
              whiteSpace="pre-wrap"
            />
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
  "page": {
    en: "p. <1>",
    it: "p. <1>",
  },
  "preview_image": {
    en: "Open image preview",
    it: "Apri anteprima immagine",
  },
  "temporary": {
    en: "Temporary",
    it: "Temporanea",
  },
};
