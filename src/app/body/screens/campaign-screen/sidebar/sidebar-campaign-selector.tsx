import { VStack } from "@chakra-ui/react";
import { useLayoutEffect, useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { type Source, useSelectedSourceId, useSources } from "~/models/sources";
import Select, { type SelectOption } from "~/ui/select";
import { compareObjects } from "~/utils/object";

//------------------------------------------------------------------------------
// Sidebar Campaign Selector
//------------------------------------------------------------------------------

export default function SidebarCampaignSelector() {
  const [selectedSourceId, setSelectedSourceId] = useSelectedSourceId();

  const campaigns = useSources(["campaign"]);
  const modules = useSources(["module"]);
  const cores = useSources(["core"]);

  const { lang, t } = useI18nLangContext(i18nContext);

  const [sourceOptions, sourceCategories] = useMemo(() => {
    const coreItems = sourcesToOptions(cores.data ?? [], lang);
    const moduleItems = sourcesToOptions(modules.data ?? [], lang);
    const campaignItems = sourcesToOptions(campaigns.data ?? [], lang);
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
  }, [cores.data, modules.data, campaigns.data, t, lang]);

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
    <VStack align="flex-start" gap={2} w="full">
      <Select.Enum
        categories={sourceCategories}
        disabled={!sourceOptions.length}
        onValueChange={setSelectedSourceId}
        options={sourceOptions}
        positioning={{ slide: true }}
        size="sm"
        value={selectedSourceId ?? ""}
      />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Sources To Options
//------------------------------------------------------------------------------

function sourcesToOptions(
  sources: Source[],
  lang: string,
): SelectOption<string>[] {
  return sources
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
