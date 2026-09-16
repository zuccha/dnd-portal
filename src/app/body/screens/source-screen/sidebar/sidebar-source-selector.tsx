import { HStack, VStack } from "@chakra-ui/react";
import { FolderIcon, UploadIcon } from "lucide-react";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import catalogue, {
  useActiveSourceId,
  useSource,
  useSourceHasUnpublishedChanges,
  useSources,
} from "~/models/catalogue/catalogue";
import { type Source, canPublishSource } from "~/models/catalogue/source";
import { publishSourceBundle } from "~/models/catalogue/source-bundle-sync";
import { type SourceVersion, useTranslateSourceVersion } from "~/models/types/source-version";
import { Route } from "~/navigation/routes";
import Button from "~/ui/button";
import CaptionInput from "~/ui/caption-input";
import Icon from "~/ui/icon";
import IconButton from "~/ui/icon-button";
import Select, { type SelectOption } from "~/ui/select";
import { compareObjects } from "~/utils/object";

//------------------------------------------------------------------------------
// Sidebar Source Selector
//------------------------------------------------------------------------------

export type SidebarSourceSelectorProps = {
  versions: SourceVersion[];
};

export default function SidebarSourceSelector({ versions }: SidebarSourceSelectorProps) {
  const selectedSourceId = useActiveSourceId();
  const selectedSource = useSource(selectedSourceId);
  const selectedSourceReadonly = selectedSource?.registry?.access === "read";
  const hasUnpublishedChanges = useSourceHasUnpublishedChanges(selectedSourceId ?? "");
  const [publishing, setPublishing] = useState(false);

  const setSourceId = useCallback((sourceId: string | undefined) => {
    catalogue.setActiveSourceId(sourceId);
  }, []);

  const sources = useSources();

  const { lang, t } = useI18nLangContext(i18nContext);
  const translateSourceVersion = useTranslateSourceVersion(lang);

  const publishSource = useCallback(async () => {
    if (!selectedSource || !canPublishSource(selectedSource)) return;

    setPublishing(true);
    try {
      await publishSourceBundle(selectedSource.id);
    } catch (error) {
      console.error("Unable to publish source", error);
    } finally {
      setPublishing(false);
    }
  }, [selectedSource]);

  const [sourceOptions, sourceCategories] = useMemo(() => {
    const cores = sources.filter(({ type }) => type === "core");
    const modules = sources.filter(({ type }) => type === "module");
    const campaigns = sources.filter(({ type }) => type === "campaign");
    const coreItems = itemizeSources(cores, versions, lang, translateSourceVersion);
    const moduleItems = itemizeSources(modules, versions, lang, translateSourceVersion);
    const campaignItems = itemizeSources(campaigns, versions, lang, translateSourceVersion);
    const items = [...coreItems, ...moduleItems, ...campaignItems];

    const categories: {
      id: string;
      items: { label: string; value: string }[];
      title: string;
    }[] = [];

    if (coreItems.length)
      categories.push({
        id: "cores",
        items: coreItems,
        title: t("select.cores"),
      });

    if (moduleItems.length)
      categories.push({
        id: "modules",
        items: moduleItems,
        title: t("select.modules"),
      });

    if (campaignItems.length)
      categories.push({
        id: "campaigns",
        items: campaignItems,
        title: t("select.campaigns"),
      });

    return [items, categories];
  }, [sources, versions, lang, translateSourceVersion, t]);

  const sourceOptionIdsKey = useMemo(
    () => sourceOptions.map(({ value }) => value).join(","),
    [sourceOptions],
  );

  useLayoutEffect(() => {
    const sourceOptionIds = sourceOptionIdsKey ? sourceOptionIdsKey.split(",") : [];
    if (!sourceOptionIds.length) {
      catalogue.setActiveSourceId(undefined);
      return;
    }

    const next =
      selectedSourceId && sourceOptionIds.includes(selectedSourceId)
        ? selectedSourceId
        : sourceOptionIds[0];

    if (next !== selectedSourceId) catalogue.setActiveSourceId(next);
  }, [selectedSourceId, sourceOptionIdsKey]);

  return (
    <VStack align="stretch" flex={1} gap={2}>
      <HStack gap={2} w="full">
        <CaptionInput
          caption={selectedSourceReadonly ? `${t("sources")} • ${t("readonly")}` : t("sources")}
          flex={1}
        >
          <Select.Enum
            categories={sourceCategories}
            disabled={!sourceOptions.length}
            onValueChange={setSourceId}
            options={sourceOptions}
            positioning={{ slide: true }}
            size="sm"
            value={selectedSourceId ?? ""}
          />
        </CaptionInput>

        <IconButton
          Icon={FolderIcon}
          alignSelf="flex-end"
          label={t(Route.Sources)}
          onClick={() => history.pushState({}, "", Route.Sources)}
          rounded="sm"
          size="sm"
          variant="outline"
        />
      </HStack>

      {canPublishSource(selectedSource) && (
        <Button
          disabled={!hasUnpublishedChanges}
          loading={publishing}
          onClick={publishSource}
          size="sm"
          variant="outline"
          w="full"
        >
          <Icon Icon={UploadIcon} size="sm" />
          {t("publish")}
        </Button>
      )}
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Sources To Options
//------------------------------------------------------------------------------

function itemizeSources(
  sources: Source[],
  versions: SourceVersion[],
  lang: string,
  translateSourceVersion: (version: SourceVersion) => string,
): SelectOption<string>[] {
  return sources
    .filter((source) => versions.includes(source.version))
    .map((source) => sourceToOption(source, lang, translateSourceVersion))
    .sort(compareObjects("label"));
}

//------------------------------------------------------------------------------
// Source To Option
//------------------------------------------------------------------------------

function sourceToOption(
  source: Source,
  lang: string,
  translateSourceVersion: (version: SourceVersion) => string,
): SelectOption<string> {
  const name = source.name[lang];
  const version = translateSourceVersion(source.version);

  return {
    dropdownLabel: name ? `${version} • ${name}` : source.code,
    label: source.code,
    value: source.id,
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "publish": {
    en: "Publish",
    it: "Pubblica",
  },
  "readonly": {
    en: "Read-only",
    it: "Sola lettura",
  },
  "select.campaigns": {
    en: "Campaigns",
    it: "Campagne",
  },
  "select.cores": {
    en: "Core",
    it: "Core",
  },
  "select.modules": {
    en: "Modules",
    it: "Moduli",
  },
  "sources": {
    en: "Source",
    it: "Fonte",
  },
  [Route.Sources]: {
    en: "Sources",
    it: "Fonti",
  },
};
