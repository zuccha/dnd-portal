import { useCampaignRole } from "../../../../../../resources/campaign-role";
import type { Resource } from "../../../../../../resources/resource";
import { createMemoryStore } from "../../../../../../store/memory-store";

//------------------------------------------------------------------------------
// Create Use Resource
//------------------------------------------------------------------------------

export function createUseResource<R extends Resource>(): [
  () => R | undefined,
  (campaignId: string) => [(resource: R | undefined) => void, boolean]
] {
  const resourceStore = createMemoryStore<R | undefined>(undefined);

  function useResource(): R | undefined {
    return resourceStore.useValue();
  }

  function useSetResource(
    campaignId: string
  ): [(resource: R | undefined) => void, boolean] {
    const setResource = resourceStore.useSetValue();
    const { data: campaignRole } = useCampaignRole(campaignId);
    return [setResource, campaignRole === "game_master"];
  }

  return [useResource, useSetResource];
}
