import { useCampaignRole } from "../../../../../../resources/campaign-role";
import type { Resource } from "../../../../../../resources/resource";
import { createMemoryStore } from "../../../../../../store/memory-store";

//------------------------------------------------------------------------------
// Create Use Edited Resource
//------------------------------------------------------------------------------

export type EditedResource<R extends Resource> = [
  R | undefined,
  (editedResource: R | undefined) => void,
  boolean
];

export function createUseEditedResource<R extends Resource>() {
  const editedResourceStore = createMemoryStore<R | undefined>(undefined);

  return function useEditedResource(campaignId: string): EditedResource<R> {
    const [editedResource, setEditedResource] = editedResourceStore.use();
    const { data: campaignRole } = useCampaignRole(campaignId);
    return campaignRole === "game_master"
      ? [editedResource, setEditedResource, true]
      : [undefined, setEditedResource, false];
  };
}
