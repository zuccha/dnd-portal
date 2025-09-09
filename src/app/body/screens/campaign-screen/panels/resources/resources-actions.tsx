import { Menu, Portal } from "@chakra-ui/react";
import { EllipsisVerticalIcon } from "lucide-react";
import { useCallback } from "react";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import { useIsGM } from "../../../../../../resources/campaign-role";
import type {
  DBResource,
  DBResourceTranslation,
  LocalizedResource,
  Resource,
  ResourceFilters,
  ResourceStore,
} from "../../../../../../resources/resource";
import type { StoreUpdater } from "../../../../../../store/store";
import IconButton from "../../../../../../ui/icon-button";
import { downloadFile } from "../../../../../../utils/download";

//------------------------------------------------------------------------------
// Create Resources Actions
//------------------------------------------------------------------------------

export function createResourcesActions<
  R extends Resource,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
  F extends ResourceFilters,
  L extends LocalizedResource<R>
>(
  store: ResourceStore<R, DBR, DBT, F>,
  useLocalizedResources: (campaignId: string) => L[] | undefined,
  useSelectedTranslationsCount: (campaignId: string) => number,
  useSetNewResource: (campaignId: string) => StoreUpdater<R | undefined>,
  defaultResource: R
) {
  return function ResourcesActions({ campaignId }: { campaignId: string }) {
    const { t } = useI18nLangContext(i18nContext);

    const localizedResources = useLocalizedResources(campaignId);
    const count = useSelectedTranslationsCount(campaignId);

    const computeSelectedAsJson = useCallback(() => {
      const selected = localizedResources!
        .filter(({ id }) => store.isSelected(id))
        .map(({ _raw, ...rest }) => rest);
      return JSON.stringify(selected, null, 2);
    }, [localizedResources]);

    const isGM = useIsGM(campaignId);
    const setNewResource = useSetNewResource(campaignId);

    const addNew = useCallback(async () => {
      setNewResource(defaultResource);
    }, [setNewResource]);

    const copySelected = useCallback(async () => {
      if (!count) return;
      const json = computeSelectedAsJson();
      await navigator.clipboard.writeText(json);
      // TODO: Show toast.
    }, [computeSelectedAsJson, count]);

    const downloadSelected = useCallback(async () => {
      if (!count) return;
      const json = computeSelectedAsJson();
      downloadFile(json, `${store.id}.json`, "json");
    }, [computeSelectedAsJson, count]);

    const removeSelected = useCallback(async () => {
      if (!count) return;
      try {
        const selectedIds = localizedResources!
          .map(({ id }) => id)
          .filter(store.isSelected);
        store.remove(selectedIds);
      } catch (e) {
        console.error(e);
        // TODO: Show toast.
      }
    }, [count, localizedResources]);

    return (
      <Menu.Root>
        <Menu.Trigger asChild focusRing="outside" mr={2} rounded="full">
          <IconButton Icon={EllipsisVerticalIcon} size="sm" variant="ghost" />
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              {isGM && (
                <Menu.Item onClick={addNew} value="add">
                  {t("add")}
                </Menu.Item>
              )}

              <Menu.Item disabled={!count} onClick={copySelected} value="copy">
                {t("copy")}
              </Menu.Item>

              <Menu.Item
                disabled={!count}
                onClick={downloadSelected}
                value="download"
              >
                {t("download")}
              </Menu.Item>
              {isGM && (
                <Menu.Item
                  _hover={{ bg: "bg.error", color: "fg.error" }}
                  color="fg.error"
                  disabled={!count}
                  onClick={removeSelected}
                  value="remove"
                >
                  {t("remove")}
                </Menu.Item>
              )}
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    );
  };
}

//------------------------------------------------------------------------------
// I18nContext
//------------------------------------------------------------------------------

const i18nContext = {
  add: {
    en: "Add new",
    it: "Crea nuovo",
  },

  copy: {
    en: "Copy selected",
    it: "Copia selezionati",
  },

  download: {
    en: "Download selected",
    it: "Scarica selezionati",
  },

  remove: {
    en: "Delete selected",
    it: "Elimina selezionati",
  },
};
