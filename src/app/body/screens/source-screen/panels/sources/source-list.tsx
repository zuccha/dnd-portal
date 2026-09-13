import { Badge, Box, HStack, Span, Text, VStack } from "@chakra-ui/react";
import {
  DownloadIcon,
  FileDownIcon,
  LinkIcon,
  RefreshCwIcon,
  Trash2Icon,
  UnlinkIcon,
  UploadIcon,
} from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Source } from "~/models/catalogue/source";
import IconButton from "~/ui/icon-button";
import {
  type SourceGroup,
  type SourceListEntry,
  colorBySourceStatus,
} from "./source-list-utils";
import i18nContext from "./sources-i18n";

//------------------------------------------------------------------------------
// Source Groups Props
//------------------------------------------------------------------------------

type SourceGroupsProps = {
  busySourceId: string | undefined;
  groups: SourceGroup[];
  lang: string;
  onDownload?: (source: Source) => void;
  onExport: (source: Source) => void;
  onMakeLocal?: (source: Source) => void;
  onPublish?: (source: Source) => void;
  onRemove: (sourceId: string) => void;
  translateSourceVersion: (version: Source["version"]) => { label: string };
};

//------------------------------------------------------------------------------
// Source Groups
//------------------------------------------------------------------------------

export default function SourceGroups({
  busySourceId,
  groups,
  lang,
  onDownload,
  onExport,
  onMakeLocal,
  onPublish,
  onRemove,
  translateSourceVersion,
}: SourceGroupsProps) {
  const { t } = useI18nLangContext(i18nContext);

  if (!groups.length)
    return (
      <Text color="fg.muted" fontSize="sm" pt={4}>
        {t("empty")}
      </Text>
    );

  return (
    <VStack gap={4} pt={4} w="full">
      {groups.map(({ sources, type }) => (
        <VStack align="flex-start" gap={2} key={type} w="full">
          <Text color="fg.muted" fontSize="xs" fontWeight="medium">
            {t(type)}
          </Text>

          <VStack gap={2} w="full">
            {sources.map((entry) => (
              <SourceRow
                busy={busySourceId === entry.source.id}
                entry={entry}
                key={entry.source.id}
                lang={lang}
                onDownload={onDownload}
                onExport={onExport}
                onMakeLocal={onMakeLocal}
                onPublish={onPublish}
                onRemove={onRemove}
                translateSourceVersion={translateSourceVersion}
              />
            ))}
          </VStack>
        </VStack>
      ))}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Source Row Props
//------------------------------------------------------------------------------

type SourceRowProps = {
  busy: boolean;
  entry: SourceListEntry;
  lang: string;
  onDownload?: (source: Source) => void;
  onExport: (source: Source) => void;
  onMakeLocal?: (source: Source) => void;
  onPublish?: (source: Source) => void;
  onRemove: (sourceId: string) => void;
  translateSourceVersion: (version: Source["version"]) => { label: string };
};

//------------------------------------------------------------------------------
// Source Row
//------------------------------------------------------------------------------

function SourceRow({
  busy,
  entry,
  lang,
  onDownload,
  onExport,
  onMakeLocal,
  onPublish,
  onRemove,
  translateSourceVersion,
}: SourceRowProps) {
  const { t } = useI18nLangContext(i18nContext);
  const { source, status } = entry;
  const name = source.name[lang] || source.code;

  return (
    <HStack
      align="flex-start"
      bgColor="bg"
      borderRadius="sm"
      borderWidth={1}
      flexWrap="wrap"
      gap={{ base: 0, sm: 3 }}
      minH={14}
      px={3}
      py={2}
      w="full"
    >
      <VStack
        align="flex-start"
        flex={{ base: "1 1 100%", sm: 1 }}
        gap={0}
        minW={0}
      >
        <HStack align="baseline" flexWrap="wrap" gap={2} w="full">
          <Text
            flex={{ base: 1, sm: "0 1 auto" }}
            fontWeight="semibold"
            lineHeight={1.1}
            minW={0}
            overflowWrap="anywhere"
          >
            {name}
          </Text>
          {status && (
            <Badge
              colorPalette={colorBySourceStatus[status]}
              size="xs"
              variant="subtle"
            >
              {t(`status.${status}`)}
            </Badge>
          )}
          {(status === "installed" || status === "update") &&
            source.registry?.access === "read" && (
              <Badge colorPalette="gray" size="xs" variant="outline">
                {t("readonly")}
              </Badge>
            )}
        </HStack>
        <Text color="fg.muted" fontSize="sm" overflowWrap="anywhere">
          {source.code} · {translateSourceVersion(source.version).label}
        </Text>
      </VStack>

      <HStack
        alignSelf={{ base: "flex-end", sm: "auto" }}
        flexShrink={0}
        flexWrap="wrap"
        gap={1}
        justify="flex-end"
        maxW={{ base: "full", sm: "auto" }}
        w={{ base: "full", sm: "auto" }}
      >
        {status === "available" && onDownload && (
          <IconButton
            Icon={DownloadIcon}
            label={t("download")}
            loading={busy}
            onClick={() => onDownload(source)}
            size="xs"
            variant="ghost"
          />
        )}

        {status === "update" && onDownload && (
          <Box position="relative">
            <IconButton
              Icon={RefreshCwIcon}
              label={t("update")}
              loading={busy}
              onClick={() => onDownload(source)}
              size="xs"
              variant="ghost"
            />
            <Span
              aria-hidden
              bg="yellow.500"
              borderRadius="full"
              boxSize={2.5}
              position="absolute"
              right={1}
              top={1}
            />
          </Box>
        )}

        {status === "installed" &&
          source.registry?.access === "write" &&
          onPublish && (
            <IconButton
              Icon={UploadIcon}
              label={t("publish")}
              loading={busy}
              onClick={() => onPublish(source)}
              size="xs"
              variant="ghost"
            />
          )}

        {(status === "installed" || status === "update") && onMakeLocal && (
          <IconButton
            Icon={UnlinkIcon}
            label={t("make_local")}
            loading={busy}
            onClick={() => onMakeLocal(source)}
            size="xs"
            variant="ghost"
          />
        )}

        {status === "detached" && onDownload && (
          <IconButton
            Icon={LinkIcon}
            label={t("make_official")}
            loading={busy}
            onClick={() => onDownload(source)}
            size="xs"
            variant="ghost"
          />
        )}

        {status !== "available" && (
          <IconButton
            Icon={FileDownIcon}
            label={t("export")}
            onClick={() => onExport(source)}
            size="xs"
            variant="ghost"
          />
        )}

        {status !== "available" && (
          <IconButton
            Icon={Trash2Icon}
            colorPalette="red"
            label={t("remove")}
            onClick={() => onRemove(source.id)}
            size="xs"
            variant="ghost"
          />
        )}
      </HStack>
    </HStack>
  );
}
