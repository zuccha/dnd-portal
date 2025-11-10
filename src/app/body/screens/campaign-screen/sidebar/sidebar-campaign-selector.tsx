import { Text, VStack, createListCollection } from "@chakra-ui/react";
import { useLayoutEffect, useMemo } from "react";
import { useI18nLangContext } from "../../../../../i18n/i18n-lang-context";
import {
  useCoreCampaigns,
  useSelectedCampaignId,
  useUserCampaigns,
} from "../../../../../resources/campaign";
import Select from "../../../../../ui/select";

//------------------------------------------------------------------------------
// Sidebar Campaign Selector
//------------------------------------------------------------------------------

export default function SidebarCampaignSelector() {
  const [selectedCampaignId, setSelectedCampaignId] = useSelectedCampaignId();

  const { data: coreCampaigns } = useCoreCampaigns();
  const { data: userCampaigns } = useUserCampaigns();

  const { t } = useI18nLangContext(i18nContext);

  const [campaignOptions, campaignCategories] = useMemo(() => {
    const coreCampaignItems =
      coreCampaigns?.length ?
        coreCampaigns.map(({ id, name }) => ({ label: name, value: id }))
      : [];

    const userCampaignItems =
      userCampaigns?.length ?
        userCampaigns.map(({ id, name }) => ({ label: name, value: id }))
      : [];

    const items = [...coreCampaignItems, ...userCampaignItems];

    const categories = [
      { id: "core", items: coreCampaignItems, title: t("select.core") },
      { id: "user", items: userCampaignItems, title: t("select.user") },
    ];

    return [createListCollection({ items }), categories];
  }, [coreCampaigns, t, userCampaigns]);

  useLayoutEffect(() => {
    if (coreCampaigns && userCampaigns)
      setSelectedCampaignId((prev) =>
        (
          coreCampaigns.every(({ id }) => id !== prev) &&
          userCampaigns.every(({ id }) => id !== prev)
        ) ?
          coreCampaigns[0]?.id
        : prev,
      );
  }, [userCampaigns, setSelectedCampaignId, coreCampaigns]);

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
  "select.core": {
    en: "Core",
    it: "Core",
  },
  "select.user": {
    en: "Yours",
    it: "Personali",
  },
  "title": {
    en: "Campaign",
    it: "Campagna",
  },
};
