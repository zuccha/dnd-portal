import { VStack } from "@chakra-ui/react";
import { useLayoutEffect, useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useSelectedSourceId, useSources } from "~/models/sources";
import Select from "~/ui/select";
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
    const coreItems = (cores.data ?? [])
      .map(({ code, id, name }) => ({
        label: name[lang] ?? code,
        value: id,
      }))
      .sort(compareObjects("label"));

    const moduleItems = (modules.data ?? [])
      .map(({ code, id, name }) => ({
        label: name[lang] ?? code,
        value: id,
      }))
      .sort(compareObjects("label"));

    const campaignItems = (campaigns.data ?? [])
      .map(({ code, id, name }) => ({
        label: name[lang] ?? code,
        value: id,
      }))
      .sort(compareObjects("label"));

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
        size="sm"
        value={selectedSourceId ?? ""}
      />
    </VStack>
  );
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
