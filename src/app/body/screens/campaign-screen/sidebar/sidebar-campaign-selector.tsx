import { Text, VStack, createListCollection } from "@chakra-ui/react";
import { useLayoutEffect, useMemo } from "react";
import { useI18nLangContext } from "../../../../../i18n/i18n-lang-context";
import {
  useSelectedCampaignId,
  useUserCampaigns,
} from "../../../../../resources/campaign";
import Select from "../../../../../ui/select";

//------------------------------------------------------------------------------
// Sidebar Campaign Selector
//------------------------------------------------------------------------------

export default function SidebarCampaignSelector() {
  const [selectedCampaignId, setSelectedCampaignId] = useSelectedCampaignId();

  const { data: userCampaigns } = useUserCampaigns();

  const { t } = useI18nLangContext(i18nContext);

  const campaignOptions = useMemo(() => {
    const useCampaignItems = userCampaigns?.length
      ? userCampaigns.map(({ id, name }) => ({ label: name, value: id }))
      : [];

    return createListCollection({ items: useCampaignItems });
  }, [userCampaigns]);

  useLayoutEffect(() => {
    setSelectedCampaignId(
      userCampaigns && userCampaigns.length ? userCampaigns[0].id : undefined
    );
  }, [userCampaigns, setSelectedCampaignId]);

  return (
    <VStack align="flex-start" px={4} w="full">
      <Text fontSize="sm" fontWeight="semibold">
        {t("title")}
      </Text>

      <Select
        disabled={!userCampaigns?.length}
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
  "select.empty": {
    en: "There are no campaigns",
    it: "Non ci sono campagne",
  },
  "title": {
    en: "Campaign",
    it: "Campagna",
  },
};
