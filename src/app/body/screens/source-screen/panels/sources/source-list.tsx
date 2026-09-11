import { Badge, HStack, Text, VStack } from "@chakra-ui/react";
import {
  DownloadIcon,
  FileDownIcon,
  LinkIcon,
  Trash2Icon,
  UnlinkIcon,
} from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { Source } from "~/models/catalogue/source";
import IconButton from "~/ui/icon-button";
import {
  type SourceGroup,
  type SourceListEntry,
  getSourceStatusColor,
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
  onRemove,
  translateSourceVersion,
}: SourceRowProps) {
  const { t } = useI18nLangContext(i18nContext);
  const { source, status } = entry;
  const name = source.name[lang] || source.code;

  return (
    <HStack
      bgColor="bg"
      borderRadius="sm"
      borderWidth={1}
      gap={3}
      minH={14}
      px={3}
      py={2}
      w="full"
    >
      <VStack align="flex-start" flex={1} gap={0}>
        <HStack gap={2} minW={0} w="full">
          <Text fontWeight="semibold" truncate>
            {name}
          </Text>
          {status && (
            <Badge
              colorPalette={getSourceStatusColor(status)}
              size="xs"
              variant="subtle"
            >
              {t(status)}
            </Badge>
          )}
          {status === "installed" && source.registry?.access === "read" && (
            <Badge colorPalette="gray" size="xs" variant="outline">
              {t("readonly")}
            </Badge>
          )}
        </HStack>
        <Text color="fg.muted" fontSize="sm" truncate>
          {source.code} · {translateSourceVersion(source.version).label}
        </Text>
      </VStack>

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

      {status === "installed" && onMakeLocal && (
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
  );
}
