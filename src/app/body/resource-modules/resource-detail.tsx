import { Badge, Box, HStack, Heading, Separator, Span, Text, VStack } from "@chakra-ui/react";
import { ChevronLeftIcon } from "lucide-react";
import { Fragment, type ReactNode } from "react";
import { useLocation } from "react-router";
import { useActiveSourceReferenceResources } from "~/models/catalogue/catalogue";
import type { ResourceKind } from "~/models/types/resource-kind";
import { useI18nLangContext } from "../../../i18n/i18n-lang-context";
import { resolveSystemText, useI18nSystem } from "../../../i18n/i18n-system";
import PageTitle from "../../../navigation/page-title";
import Icon from "../../../ui/icon";
import IconButton, { type IconButtonProps } from "../../../ui/icon-button";
import RichText from "../../../ui/rich-text";
import { renderRichTextBlocks } from "../../../ui/rich-text-block-pattern";
import { richTextHeadingDelimiter } from "../../../ui/rich-text-page";
import { createRichTextTableBlockPattern } from "../../../ui/rich-text-table-block-pattern";
import RouterLink from "../../../ui/router-link";
import { resourcePanelTranslations } from "../screens/source-screen/panels/panel-translations";
import ResourceImagePreview from "./resource-image-preview";
import { useResourceLinkPatterns } from "./resource-link-pattern";

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
  descriptor: string;
  description: string;
  id: string;
  image_url?: string | null;
  kind: ResourceKind;
  name: string;
  page: string;
  source_code: string;
  source_version: string;
  is_virtual: boolean;
};

//------------------------------------------------------------------------------
// Resource Detail
//------------------------------------------------------------------------------

export default function ResourceDetail({
  afterDescription,
  actions = [],
  children,
  resource,
}: {
  afterDescription?: ReactNode;
  actions?: ResourceDetailAction[];
  children?: ReactNode;
  resource: ResourceDetailHeader | undefined;
}) {
  const { t, ti } = useI18nLangContext({ ...resourcePanelTranslations, ...i18nContext });
  const [system] = useI18nSystem();
  const resourceReferences = useActiveSourceReferenceResources();
  const resourceLinkPatterns = useResourceLinkPatterns(resourceReferences);
  const listPath = `/${useLocation().pathname.split("/").filter(Boolean).slice(0, 2).join("/")}`;

  if (!resource) return null;

  const details = resolveSystemText(resource.description, system).replace(
    new RegExp(
      `[\\r\\n]*${richTextHeadingDelimiter}(.+?)${richTextHeadingDelimiter}[\\r\\n]*`,
      "g",
    ),
    `${richTextHeadingDelimiter}$1${richTextHeadingDelimiter}`,
  );
  const patterns = [detailRichTextHeadingPattern, ...resourceLinkPatterns];
  const detailBlocks = renderRichTextBlocks(details, [
    createRichTextTableBlockPattern({
      mode: "grid",
      renderCell: (value) => <RichText display="inline" patterns={patterns} text={value} />,
    }),
  ]);
  const imageUrl = resource.image_url?.trim();

  return (
    <>
      <PageTitle title={resource.name || t("unnamed")} />
      <Box h="full" overflowY="auto" px={{ base: 5, md: 8 }} py={{ base: 6, md: 10 }}>
        <VStack align="stretch" gap={3} mx="auto" maxW="4xl">
          <HStack align="center" flexWrap="wrap" justify="space-between">
            {listPath && (
              <RouterLink to={listPath}>
                <HStack gap={1}>
                  <Icon Icon={ChevronLeftIcon} size="sm" />
                  <Span>{t(listPath)}</Span>
                </HStack>
              </RouterLink>
            )}
            <HStack flexShrink={0} gap={0}>
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
          </HStack>
          <HStack gap={4}>
            <VStack align="stretch" gap={1}>
              <HStack align="center" flexWrap="wrap" gap={3}>
                <Heading size="2xl">{resource.name || t("unnamed")}</Heading>
                {resource.is_virtual && (
                  <Badge colorPalette="orange" size="sm" variant="solid">
                    {t("temporary")}
                  </Badge>
                )}
              </HStack>
              {resource.descriptor && (
                <Text color="fg.muted" fontSize="lg">
                  {resource.descriptor}
                </Text>
              )}
              <HStack color="fg.muted" flexWrap="wrap" fontSize="sm" gap={2}>
                <Text>{resource.source_version}</Text>
                <Text aria-hidden="true">·</Text>
                <Text>{resource.source_code}</Text>
                {resource.page && (
                  <>
                    <Text aria-hidden="true">·</Text>
                    <Text>{ti("page", resource.page)}</Text>
                  </>
                )}
              </HStack>
            </VStack>
            {imageUrl && (
              <ResourceImagePreview
                alt={resource.name}
                imageUrl={imageUrl}
                label={t("preview_image")}
              />
            )}
          </HStack>

          <Separator />

          {children}

          {children && details && <Separator />}

          {details &&
            detailBlocks.map((block, index) =>
              block.type === "rendered" ? (
                <Fragment key={index}>{block.value}</Fragment>
              ) : (
                <RichText
                  display="block"
                  key={index}
                  lineHeight="tall"
                  patterns={patterns}
                  text={block.value}
                  whiteSpace="pre-wrap"
                />
              ),
            )}

          {afterDescription && (
            <>
              <Separator />
              {afterDescription}
            </>
          )}
        </VStack>
      </Box>
    </>
  );
}

//------------------------------------------------------------------------------
// Detail Rich Text Heading Pattern
//------------------------------------------------------------------------------

const detailRichTextHeadingPattern = {
  regex: new RegExp(`${richTextHeadingDelimiter}(.+?)${richTextHeadingDelimiter}`),
  render: (value: ReactNode) => (
    <>
      <Span display="block" fontSize="lg" fontWeight="medium" lineHeight="short" mt={2}>
        {value}
      </Span>
      <Separator mb={1} />
    </>
  ),
};

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
