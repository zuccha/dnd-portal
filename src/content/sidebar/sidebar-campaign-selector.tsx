import { Text, VStack, createListCollection } from "@chakra-ui/react";
import { useLayoutEffect, useMemo } from "react";
import { useI18n } from "../../i18n/i18n";
import {
  useSelectedUserCampaignId,
  useUserCampaigns,
} from "../../resources/campaigns";
import Select from "../../ui/select";

//------------------------------------------------------------------------------
// Sidebar Campaign Selector
//------------------------------------------------------------------------------

export default function SidebarCampaignSelector() {
  const [selectedCampaignId, setSelectedCampaignId] =
    useSelectedUserCampaignId();
  const { isPending, data: campaigns } = useUserCampaigns();

  const i18n = useI18n(i18nContext);

  const campaignOptions = useMemo(() => {
    if (isPending)
      return createListCollection({
        items: [{ label: "", value: "" }],
      });
    if (!campaigns || !campaigns.length)
      return createListCollection({
        items: [{ label: i18n.t("select.empty"), value: "" }],
      });
    return createListCollection({
      items: campaigns.map((campaign) => ({
        label: campaign.name,
        value: campaign.id,
      })),
    });
  }, [campaigns, i18n, isPending]);

  useLayoutEffect(() => {
    setSelectedCampaignId(
      campaigns && campaigns.length ? campaigns[0].id : undefined
    );
  }, [campaigns, setSelectedCampaignId]);

  return (
    <VStack align="flex-start" px={4} w="full">
      <Text fontSize="sm" fontWeight="semibold">
        {i18n.t("title")}
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
