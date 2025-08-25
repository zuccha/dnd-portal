import { VStack, createListCollection } from "@chakra-ui/react";
import { useLayoutEffect, useMemo } from "react";
import { useI18n } from "../../i18n/i18n";
import {
  useSelectedUserCampaign,
  useUserCampaigns,
} from "../../supabase/resources/campaigns";
import Select from "../../ui/select";

//------------------------------------------------------------------------------
// Sidebar
//------------------------------------------------------------------------------

export default function Sidebar() {
  const [selectedCampaignId, setSelectedCampaignId] = useSelectedUserCampaign();
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
    <VStack borderRightWidth={1} flex={1} h="full" maxW="20em" p={4}>
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
};
