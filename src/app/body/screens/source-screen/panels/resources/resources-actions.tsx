import { HStack, Menu, Portal, VStack } from "@chakra-ui/react";
import { EllipsisVerticalIcon } from "lucide-react";
import { useCallback } from "react";
import YAML from "yaml";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import { useCanEditSourceResources } from "~/models/sources";
import Button from "~/ui/button";
import IconButton from "~/ui/icon-button";
import SectionHeading from "~/ui/section-heading";
import { downloadFile } from "~/utils/download";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Create Resources Actions
//------------------------------------------------------------------------------

export type ResourcesActionsProps = {
  sourceId: string;
};

export function createResourcesActions<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
>(store: ResourceStore<R, L, F, DBR, DBT>, context: ResourcesContext<R>) {
  const {
    useFilteredResourceIds,
    useResourcesSelectionMethods,
    useSelectedFilteredResourceIds,
    useLocalizeResource,
  } = store;

  return function ResourcesActions({ sourceId }: ResourcesActionsProps) {
    const { t, tpi } = useI18nLangContext(i18nContext);
    const canEdit = useCanEditSourceResources(sourceId);
    const filteredResourceIds = useFilteredResourceIds(sourceId);
    const selectedFilteredResourceIds =
      useSelectedFilteredResourceIds(sourceId);
    const localizeResource = useLocalizeResource(sourceId);

    const { deselectAllResources, selectAllResources } =
      useResourcesSelectionMethods(sourceId);

    const addNew = useCallback(() => {
      context.setCreatedResource(store.defaultResource);
    }, []);

    const computeSelectedAsJson = useCallback(() => {
      const selectedResources = selectedFilteredResourceIds
        .map(store.getResource)
        .filter((resource) => resource !== undefined);
      const selectedLocalizedResources = selectedResources
        .map(localizeResource)
        .map(({ _raw, ...rest }) => rest);
      return JSON.stringify(selectedLocalizedResources, null, 2);
    }, [localizeResource, selectedFilteredResourceIds]);

    const computeSelectedAsYaml = useCallback(() => {
      const selectedResources = selectedFilteredResourceIds
        .map(store.getResource)
        .filter((resource) => resource !== undefined);
      const selectedLocalizedResources = selectedResources
        .map(localizeResource)
        .map(({ _raw, ...rest }) => rest);
      return YAML.stringify(selectedLocalizedResources);
    }, [localizeResource, selectedFilteredResourceIds]);

    const copySelectedAsJson = useCallback(async () => {
      const json = computeSelectedAsJson();
      await navigator.clipboard.writeText(json);
      // TODO: Show toast.
    }, [computeSelectedAsJson]);

    const copySelectedAsYaml = useCallback(async () => {
      const json = computeSelectedAsYaml();
      await navigator.clipboard.writeText(json);
      // TODO: Show toast.
    }, [computeSelectedAsYaml]);

    const downloadSelectedAsJson = useCallback(async () => {
      const json = computeSelectedAsJson();
      downloadFile(json, `${store.name.p}.json`, "json"); // TODO: Localize filename
    }, [computeSelectedAsJson]);

    const downloadSelectedAsYaml = useCallback(async () => {
      const json = computeSelectedAsYaml();
      downloadFile(json, `${store.name.p}.json`, "json"); // TODO: Localize filename
    }, [computeSelectedAsYaml]);

    const printSelected = useCallback(async () => {
      context.setPrintMode(true);
    }, []);

    const removeSelected = useCallback(async () => {
      try {
        const selectedResources = selectedFilteredResourceIds
          .map(store.getResource)
          .filter((resource) => resource !== undefined);
        const count = selectedResources.length;
        const ok = confirm(tpi("remove.confirm", count, `${count}`));
        if (ok) {
          const selectedResourceIds = selectedResources.map(({ id }) => id);
          store.deleteResources(selectedResourceIds);
        }
      } catch (e) {
        console.error(e);
        // TODO: Show toast.
      }
    }, [selectedFilteredResourceIds, tpi]);

    const hasSelection = selectedFilteredResourceIds.length > 0;
    const allFilteredSelected =
      selectedFilteredResourceIds.length === filteredResourceIds.length;

    return (
      <VStack px={6} w="full">
        <HStack h={8} justify="space-between" w="full">
          <SectionHeading>{t("actions")}</SectionHeading>

          <Menu.Root>
            <Menu.Trigger asChild focusRing="outside" mr={-2} rounded="full">
              <IconButton
                Icon={EllipsisVerticalIcon}
                size="xs"
                variant="ghost"
              />
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  {canEdit && (
                    <>
                      <Menu.ItemGroup>
                        <Menu.Item onSelect={addNew} value="add">
                          {t("add")}
                        </Menu.Item>

                        <Menu.Item
                          _hover={{ bg: "bg.error", color: "fg.error" }}
                          color="fg.error"
                          disabled={!hasSelection}
                          onSelect={removeSelected}
                          value="remove"
                        >
                          {t("remove")}
                        </Menu.Item>
                      </Menu.ItemGroup>

                      <Menu.Separator />
                    </>
                  )}

                  <Menu.ItemGroup>
                    <Menu.Item
                      disabled={allFilteredSelected}
                      onSelect={selectAllResources}
                      value="select-all"
                    >
                      {t("select_all")}
                    </Menu.Item>

                    <Menu.Item
                      disabled={!hasSelection}
                      onSelect={deselectAllResources}
                      value="deselect-all"
                    >
                      {t("deselect_all")}
                    </Menu.Item>
                  </Menu.ItemGroup>

                  <Menu.Separator />

                  <Menu.ItemGroup>
                    <Menu.Item
                      disabled={!hasSelection}
                      onSelect={copySelectedAsJson}
                      value="copy-as-json"
                    >
                      {t("copy_as_json")}
                    </Menu.Item>

                    <Menu.Item
                      disabled={!hasSelection}
                      onSelect={copySelectedAsYaml}
                      value="copy-as-yaml"
                    >
                      {t("copy_as_yaml")}
                    </Menu.Item>

                    <Menu.Item
                      disabled={!hasSelection}
                      onSelect={downloadSelectedAsJson}
                      value="download-as-json"
                    >
                      {t("download_as_json")}
                    </Menu.Item>

                    <Menu.Item
                      disabled={!hasSelection}
                      onSelect={downloadSelectedAsYaml}
                      value="download-as-yaml"
                    >
                      {t("download_as_yaml")}
                    </Menu.Item>
                  </Menu.ItemGroup>

                  <Menu.Separator />

                  <Menu.ItemGroup>
                    <Menu.Item
                      disabled={!hasSelection}
                      onSelect={printSelected}
                      value="print"
                    >
                      {t("print")}
                    </Menu.Item>
                  </Menu.ItemGroup>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </HStack>

        <Button
          disabled={!hasSelection}
          onClick={printSelected}
          size="sm"
          variant="outline"
          w="full"
        >
          {t("print")}
        </Button>
      </VStack>
    );
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "actions": {
    en: "Actions",
    it: "Azioni",
  },
  "add": {
    en: "Add new",
    it: "Crea nuovo",
  },
  "copy_as_json": {
    en: "Copy selected as JSON",
    it: "Copia selezionati come JSON",
  },
  "copy_as_yaml": {
    en: "Copy selected as YAML",
    it: "Copia selezionati come YAML",
  },
  "deselect_all": {
    en: "Deselect all",
    it: "Deseleziona tutti",
  },
  "download_as_json": {
    en: "Download selected as JSON",
    it: "Scarica selezionati come JSON",
  },
  "download_as_yaml": {
    en: "Download selected as YAML",
    it: "Scarica selezionati come YAML",
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
  "select_all": {
    en: "Select all",
    it: "Seleziona tutti",
  },
};
