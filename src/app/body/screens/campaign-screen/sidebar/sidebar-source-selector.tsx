import { useLayoutEffect, useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { type Source, useSelectedSourceId, useSources } from "~/models/sources";
import type { SourceVersion } from "~/models/types/source-version";
import Select, { type SelectOption } from "~/ui/select";
import { compareObjects } from "~/utils/object";

//------------------------------------------------------------------------------
// Sidebar Source Selector
//------------------------------------------------------------------------------

export type SidebarSourceSelectorProps = {
  versions: SourceVersion[];
};

export default function SidebarSourceSelector({
  versions,
}: SidebarSourceSelectorProps) {
  const [selectedSourceId, setSelectedSourceId] = useSelectedSourceId();

  const campaigns = useSources(["campaign"]);
  const modules = useSources(["module"]);
  const cores = useSources(["core"]);

  const { lang, t } = useI18nLangContext(i18nContext);

  const [sourceOptions, sourceCategories] = useMemo(() => {
    const coreItems = itemizeSources(cores.data ?? [], versions, lang);
    const moduleItems = itemizeSources(modules.data ?? [], versions, lang);
    const campaignItems = itemizeSources(campaigns.data ?? [], versions, lang);
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
  }, [cores.data, versions, lang, modules.data, campaigns.data, t]);

  const fetched = campaigns.isFetched && modules.isFetched && cores.isFetched;

  useLayoutEffect(() => {
    if (fetched && sourceOptions.length)
      setSelectedSourceId((prev) =>
        sourceOptions.every(({ value }) => value !== prev) ?
          sourceOptions[0]?.value
        : prev,
      );
  }, [fetched, setSelectedSourceId, sourceOptions]);

  return (
    <Select.Enum
      categories={sourceCategories}
      disabled={!sourceOptions.length}
      flex={1}
      onValueChange={setSelectedSourceId}
      options={sourceOptions}
      positioning={{ slide: true }}
      size="sm"
      value={selectedSourceId ?? ""}
    />
  );
}

//------------------------------------------------------------------------------
// Sources To Options
//------------------------------------------------------------------------------

function itemizeSources(
  sources: Source[],
  versions: SourceVersion[],
  lang: string,
): SelectOption<string>[] {
  return sources
    .filter((source) => versions.includes(source.version))
    .map((source) => sourceToOption(source, lang))
    .sort(compareObjects("label"));
}

//------------------------------------------------------------------------------
// Source To Option
//------------------------------------------------------------------------------

function sourceToOption(source: Source, lang: string): SelectOption<string> {
  const name = source.name[lang];
  const version = { dnd5_0: "5.0", dnd5_5: "5.5" }[source.version];

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
};
