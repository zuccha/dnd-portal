import { Badge, Box, HStack, Span, Text, VStack } from "@chakra-ui/react";
import {
  DownloadIcon,
  FileDownIcon,
  LinkIcon,
  RefreshCwIcon,
  SettingsIcon,
  Trash2Icon,
  UnlinkIcon,
  UploadIcon,
} from "lucide-react";
import { useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useSourceHasUnpublishedChanges } from "~/models/catalogue/catalogue";
import type { Source } from "~/models/catalogue/source";
import Button from "~/ui/button";
import IconButton from "~/ui/icon-button";
import { type SourceGroup, type SourceListEntry, colorBySourceStatus } from "./source-list-utils";
import i18nContext from "./sources-i18n";

//------------------------------------------------------------------------------
// Source Groups Props
//------------------------------------------------------------------------------

type SourceGroupsProps = {
  activeSourceId: string | undefined;
  busySourceId: string | undefined;
  groups: SourceGroup[];
  lang: string;
  onDownload?: (source: Source) => void;
  onExport: (source: Source) => void;
  onMakeLocal?: (source: Source) => void;
  onRegister?: (source: Source) => void;
  onPublish?: (source: Source) => void;
  onRemove: (sourceId: string) => void;
  onSelectSource: (sourceId: string) => void;
  onSettings?: (source: Source) => void;
  translateSourceVersion: (version: Source["version"]) => string;
};

//------------------------------------------------------------------------------
// Source Groups
//------------------------------------------------------------------------------

export default function SourceGroups({
  activeSourceId,
  busySourceId,
  groups,
  lang,
  onDownload,
  onExport,
  onMakeLocal,
  onRegister,
  onPublish,
  onRemove,
  onSelectSource,
  onSettings,
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
          <Text fontSize="sm" fontWeight="bold">
            {t(type)}
          </Text>

          <VStack gap={2} w="full">
            {sources.map((entry) => (
              <SourceRow
                active={activeSourceId === entry.source.id}
                busy={busySourceId === entry.source.id}
                entry={entry}
                key={entry.source.id}
                lang={lang}
                onDownload={onDownload}
                onExport={onExport}
                onMakeLocal={onMakeLocal}
                onPublish={onPublish}
                onRegister={onRegister}
                onRemove={onRemove}
                onSelectSource={onSelectSource}
                onSettings={onSettings}
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
  active: boolean;
  busy: boolean;
  entry: SourceListEntry;
  lang: string;
  onDownload?: (source: Source) => void;
  onExport: (source: Source) => void;
  onMakeLocal?: (source: Source) => void;
  onRegister?: (source: Source) => void;
  onPublish?: (source: Source) => void;
  onRemove: (sourceId: string) => void;
  onSelectSource: (sourceId: string) => void;
  onSettings?: (source: Source) => void;
  translateSourceVersion: (version: Source["version"]) => string;
};

//------------------------------------------------------------------------------
// Source Row
//------------------------------------------------------------------------------

function SourceRow({
  active,
  busy,
  entry,
  lang,
  onDownload,
  onExport,
  onMakeLocal,
  onRegister,
  onPublish,
  onRemove,
  onSelectSource,
  onSettings,
  translateSourceVersion,
}: SourceRowProps) {
  const { t } = useI18nLangContext(i18nContext);
  const [actionsHovered, setActionsHovered] = useState(false);
  const { source, status } = entry;
  const hasUnpublishedChanges = useSourceHasUnpublishedChanges(source.id);
  const selectable = status !== "available";
  const name = source.name[lang] || source.code;
  const sourceInfo = (
    <Span alignItems="flex-start" display="flex" flexDirection="column" gap={0} minW={0} w="full">
      <Span alignItems="baseline" display="flex" flexWrap="wrap" gap={2} w="full">
        <Span
          flex={{ base: 1, sm: "0 1 auto" }}
          fontWeight="semibold"
          lineHeight={1.1}
          minW={0}
          overflowWrap="anywhere"
        >
          {name}
        </Span>
        {status && (
          <Badge colorPalette={colorBySourceStatus[status]} size="xs" variant="subtle">
            {t(`status.${status}`)}
          </Badge>
        )}
        {(status === "installed" || status === "update") && source.registry?.access === "read" && (
          <Badge colorPalette="gray" size="xs" variant="outline">
            {t("readonly")}
          </Badge>
        )}
      </Span>
      <Span color="fg.muted" fontSize="sm" overflowWrap="anywhere">
        {source.code} · {translateSourceVersion(source.version)}
      </Span>
    </Span>
  );

  return (
    <HStack
      aria-label={name}
      bg={active ? "blue.subtle" : "bg"}
      borderRadius="sm"
      borderColor={active ? "border.info" : "border"}
      borderWidth={1}
      cursor={selectable ? "pointer" : undefined}
      flexWrap="wrap"
      gap={{ base: 0, sm: 3 }}
      minH={14}
      onClick={selectable ? () => onSelectSource(source.id) : undefined}
      px={3}
      py={2}
      role="group"
      w="full"
      _hover={
        selectable && !actionsHovered ? { bg: active ? "blue.subtle" : "bg.subtle" } : undefined
      }
    >
      {selectable ? (
        <Button
          alignItems="stretch"
          bg="transparent"
          flex={{ base: "1 1 100%", sm: 1 }}
          h="auto"
          justifyContent="flex-start"
          minH={0}
          minW={0}
          onClick={(event) => {
            event.stopPropagation();
            onSelectSource(source.id);
          }}
          p={0}
          textAlign="left"
          type="button"
          variant="ghost"
          whiteSpace="normal"
          _hover={{ bg: active ? "blue.subtle" : "bg.subtle" }}
        >
          {sourceInfo}
        </Button>
      ) : (
        <Box flex={{ base: "1 1 100%", sm: 1 }} minW={0}>
          {sourceInfo}
        </Box>
      )}

      <HStack
        alignSelf={{ base: "flex-end", sm: "auto" }}
        flexShrink={0}
        flexWrap="wrap"
        gap={1}
        justify="flex-end"
        maxW={{ base: "full", sm: "auto" }}
        onClick={(event) => event.stopPropagation()}
        onPointerEnter={() => setActionsHovered(true)}
        onPointerLeave={() => setActionsHovered(false)}
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

        {status === "local" && onRegister && (
          <IconButton
            Icon={UploadIcon}
            label={t("register")}
            loading={busy}
            onClick={() => onRegister(source)}
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
          (source.registry?.access === "creator" || source.registry?.access === "write") &&
          hasUnpublishedChanges &&
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
            Icon={SettingsIcon}
            label={t("settings")}
            onClick={() => onSettings?.(source)}
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
