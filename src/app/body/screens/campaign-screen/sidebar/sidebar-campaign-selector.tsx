import { Text, VStack, createListCollection } from "@chakra-ui/react";
import { useLayoutEffect, useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import {
  useCampaigns,
  useCreatedModules,
  useSelectedCampaignId,
} from "~/models/campaign";
import Select from "~/ui/select";

//------------------------------------------------------------------------------
// Sidebar Campaign Selector
//------------------------------------------------------------------------------

export default function SidebarCampaignSelector() {
  const [selectedCampaignId, setSelectedCampaignId] = useSelectedCampaignId();

  const { data: modules } = useCreatedModules();
  const { data: campaigns } = useCampaigns();

  const { t } = useI18nLangContext(i18nContext);

  const [campaignOptions, campaignCategories] = useMemo(() => {
    const moduleItems =
      modules?.length ?
        modules.map(({ id, name }) => ({ label: name, value: id }))
      : [];

    const campaignItems =
      campaigns?.length ?
        campaigns.map(({ id, name }) => ({ label: name, value: id }))
      : [];

    const items = [...moduleItems, ...campaignItems];

    const categories = [
      { id: "modules", items: moduleItems, title: t("select.modules") },
      { id: "campaigns", items: campaignItems, title: t("select.campaigns") },
    ];

    return [createListCollection({ items }), categories];
  }, [modules, t, campaigns]);

  useLayoutEffect(() => {
    if (modules && campaigns)
      setSelectedCampaignId((prev) =>
        (
          modules.every(({ id }) => id !== prev) &&
          campaigns.every(({ id }) => id !== prev)
        ) ?
          modules[0]?.id
        : prev,
      );
  }, [campaigns, setSelectedCampaignId, modules]);

  return (
    <VStack align="flex-start" px={4} w="full">
      <Text fontSize="sm" fontWeight="semibold">
        {t("title")}
      </Text>

      <Select
        categories={campaignCategories}
        disabled={!campaignOptions.items.length}
        onValueChange={setSelectedCampaignId}
        options={campaignOptions}
        value={selectedCampaignId ?? ""}
      />
    </VStack>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "select.modules": {
    en: "Modules",
    it: "Moduli",
  },

  "select.campaigns": {
    en: "Campaigns",
    it: "Campagne",
  },

  "title": {
    en: "Campaign",
    it: "Campagna",
  },
};
