import { Menu, Portal } from "@chakra-ui/react";
import { EllipsisVerticalIcon } from "lucide-react";
import { useCallback } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useCanEditCampaign } from "~/models/campaign";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import IconButton from "~/ui/icon-button";
import { downloadFile } from "~/utils/download";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Create Resources Actions
//------------------------------------------------------------------------------

export type ResourcesActionsProps = {
  campaignId: string;
};

export function createResourcesActions<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(store: ResourceStore<R, L, F, DBR, DBT>, context: ResourcesContext<R>) {
  return function ResourcesActions({ campaignId }: ResourcesActionsProps) {
    const { t, tpi } = useI18nLangContext(i18nContext);
    const canEdit = useCanEditCampaign(campaignId);
    const selectedResourcesCount = store.useResourceSelectionCount(campaignId);
    const localizeResource = store.useLocalizeResource();

    const addNew = useCallback(() => {
      context.setCreatedResource(store.defaultResource);
    }, []);

    const computeSelectedAsJson = useCallback(() => {
      const selectedResources = store.getSelectedResources(campaignId);
      const selectedLocalizedResources = selectedResources
        .map(localizeResource)
        .map(({ _raw, ...rest }) => rest);
      return JSON.stringify(selectedLocalizedResources, null, 2);
    }, [campaignId, localizeResource]);

    const copySelected = useCallback(async () => {
      const json = computeSelectedAsJson();
      await navigator.clipboard.writeText(json);
      // TODO: Show toast.
    }, [computeSelectedAsJson]);

    const downloadSelected = useCallback(async () => {
      const json = computeSelectedAsJson();
      downloadFile(json, `${store.name.p}.json`, "json"); // TODO: Localize filename
    }, [computeSelectedAsJson]);

    const printSelected = useCallback(async () => {
      context.setPrintMode(true);
    }, []);

    const removeSelected = useCallback(async () => {
      try {
        const selectedResources = store.getSelectedResources(campaignId);
        const count = selectedResources.length;
        const ok = confirm(tpi("remove.confirm", count, `${count}`));
        if (ok) {
          const selectedResourceIds = selectedResources.map(({ id }) => id);
          store.deleteResources(campaignId, selectedResourceIds);
        }
      } catch (e) {
        console.error(e);
        // TODO: Show toast.
      }
    }, [campaignId, tpi]);

    const disabled = !selectedResourcesCount;

    return (
      <Menu.Root>
        <Menu.Trigger asChild focusRing="outside" mr={2} rounded="full">
          <IconButton Icon={EllipsisVerticalIcon} size="sm" variant="ghost" />
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              {canEdit && (
                <Menu.Item onClick={addNew} value="add">
                  {t("add")}
                </Menu.Item>
              )}

              <Menu.Item
                disabled={disabled}
                onClick={copySelected}
                value="copy"
              >
                {t("copy")}
              </Menu.Item>

              <Menu.Item
                disabled={disabled}
                onClick={downloadSelected}
                value="download"
              >
                {t("download")}
              </Menu.Item>

              <Menu.Item
                disabled={disabled}
                onClick={printSelected}
                value="print"
              >
                {t("print")}
              </Menu.Item>

              {canEdit && (
                <Menu.Item
                  _hover={{ bg: "bg.error", color: "fg.error" }}
                  color="fg.error"
                  disabled={disabled}
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
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "add": {
    en: "Add new",
    it: "Crea nuovo",
  },
  "copy": {
    en: "Copy selected",
    it: "Copia selezionati",
  },
  "download": {
    en: "Download selected",
    it: "Scarica selezionati",
  },
  "print": {
    en: "Print selected",
    it: "Stampa selezionati",
  },
  "remove": {
    en: "Delete selected",
    it: "Elimina selezionati",
  },
  "remove.confirm/*": {
    en: "Are you sure you want to delete <1> items?",
    it: "Sei sicuro di voler rimuovere <1> elementi?",
  },
  "remove.confirm/1": {
    en: "Are you sure you want to delete <1> item?",
    it: "Sei sicuro di voler rimuovere <1> elemento?",
  },
};
