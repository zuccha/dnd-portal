import { VStack } from "@chakra-ui/react";
import { useLayoutEffect, useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import {
  useCampaignsAndCreatedModules,
  useSelectedCampaignId,
} from "~/models/campaign";
import Select from "~/ui/select";

//------------------------------------------------------------------------------
// Sidebar Campaign Selector
//------------------------------------------------------------------------------

export default function SidebarCampaignSelector() {
  const [selectedCampaignId, setSelectedCampaignId] = useSelectedCampaignId();

  const { all, campaigns, fetched, modules } = useCampaignsAndCreatedModules();

  const { t } = useI18nLangContext(i18nContext);

  const [campaignOptions, campaignCategories] = useMemo(() => {
    const moduleItems = modules.map(({ id, name }) => ({
      label: name,
      value: id,
    }));

    const campaignItems = campaigns.map(({ id, name }) => ({
      label: name,
      value: id,
    }));

    const items = [...moduleItems, ...campaignItems];

    const categories: {
      id: string;
      items: { label: string; value: string }[];
      title: string;
    }[] = [];

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
  }, [modules, t, campaigns]);

  useLayoutEffect(() => {
    if (fetched && all.length)
      setSelectedCampaignId((prev) =>
        all.every(({ id }) => id !== prev) ? all[0]?.id : prev,
      );
  }, [all, fetched, setSelectedCampaignId]);

  return (
    <VStack align="flex-start" gap={2} w="full">
      <Select
        categories={campaignCategories}
        disabled={!campaignOptions.length}
        onValueChange={setSelectedCampaignId}
        options={campaignOptions}
        size="sm"
        value={selectedCampaignId ?? ""}
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
  "select.modules": {
    en: "Modules",
    it: "Moduli",
  },
};
