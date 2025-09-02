import { useCampaignRole } from "../../../../../../resources/campaign-role";
import type { Resource } from "../../../../../../resources/resource";
import { createMemoryStore } from "../../../../../../store/memory-store";

//------------------------------------------------------------------------------
// Create Use Edited Resource
//------------------------------------------------------------------------------

export function createUseEditedResource<R extends Resource>() {
  const editedResourceStore = createMemoryStore<R | undefined>(undefined);

  function useEditedResource(): R | undefined {
    return editedResourceStore.useValue();
  }

  function useSetEditedResource(
    campaignId: string
  ): [(resource: R | undefined) => void, boolean] {
    const setEditedResource = editedResourceStore.useSetValue();
    const { data: campaignRole } = useCampaignRole(campaignId);
    return [setEditedResource, campaignRole === "game_master"];
  }

  return { useEditedResource, useSetEditedResource };
}
