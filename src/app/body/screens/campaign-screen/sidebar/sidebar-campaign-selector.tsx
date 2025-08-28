import { Text, VStack, createListCollection } from "@chakra-ui/react";
import { useLayoutEffect, useMemo } from "react";
import { useI18nLangContext } from "../../../../../i18n/i18n-lang-context";
import {
  useSelectedUserCampaignId,
  useUserCampaigns,
} from "../../../../../resources/campaign";
import Select from "../../../../../ui/select";

//------------------------------------------------------------------------------
// Sidebar Campaign Selector
//------------------------------------------------------------------------------

export default function SidebarCampaignSelector() {
  const [selectedCampaignId, setSelectedCampaignId] =
    useSelectedUserCampaignId();
  const { isPending, data: campaigns } = useUserCampaigns();

  const { t } = useI18nLangContext(i18nContext);

  const campaignOptions = useMemo(() => {
    if (isPending)
      return createListCollection({
        items: [{ label: "", value: "" }],
      });
    if (!campaigns || !campaigns.length)
      return createListCollection({
        items: [{ label: t("select.empty"), value: "" }],
      });
    return createListCollection({
      items: campaigns.map((campaign) => ({
        label: campaign.name,
        value: campaign.id,
      })),
    });
  }, [campaigns, isPending, t]);

  useLayoutEffect(() => {
    setSelectedCampaignId(
      campaigns && campaigns.length ? campaigns[0].id : undefined
    );
  }, [campaigns, setSelectedCampaignId]);

  return (
    <VStack align="flex-start" px={4} w="full">
      <Text fontSize="sm" fontWeight="semibold">
        {t("title")}
      </Text>

      <Select
        disabled={isPending || !campaigns || !campaigns.length}
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
