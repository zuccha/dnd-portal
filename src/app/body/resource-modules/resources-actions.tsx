import { useCallback, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useSourceEditable } from "~/models/catalogue/catalogue";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import Button from "~/ui/button";
import ConfirmationDialog from "~/ui/confirmation-dialog";
import Section from "~/ui/section";
import { toaster } from "~/ui/toaster";
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
>(store: ResourceStore<R, L, F>, context: ResourcesContext<R>) {
  const { useFilteredResourceIds } = store;

  const { deselectResources, selectResources, useSelectedResourceIds } = store;

  return function ResourcesActions({ sourceId }: ResourcesActionsProps) {
    const { t, tp, tpi } = useI18nLangContext(i18nContext);
    const filteredResourceIds = useFilteredResourceIds(sourceId);
    const selectedFilteredResourceIds = useSelectedResourceIds(filteredResourceIds);
    const sourceEditable = useSourceEditable(sourceId);
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

    const addNew = useCallback(() => {
      context.setCreatedResource(store.defaultResource);
    }, []);

    const removeSelected = useCallback(async () => {
      const selectedResources = selectedFilteredResourceIds
        .map(store.getResource)
        .filter((resource) => resource !== undefined);
      const count = selectedResources.length;
      try {
        const selectedResourceIds = selectedResources.map(({ id }) => id);
        const error = await store.deleteResources(selectedResourceIds);
        if (error) throw new Error(error);
        deselectResources(selectedResourceIds);
        setRemoveDialogOpen(false);
      } catch (e) {
        console.error(e);
        toaster.error({
          description: tp("remove.error.description", count),
          title: t("remove.error.title"),
        });
      }
    }, [selectedFilteredResourceIds, t, tp]);

    const hasSelection = selectedFilteredResourceIds.length > 0;
    const allFilteredSelected = selectedFilteredResourceIds.length === filteredResourceIds.length;

    return (
      <>
        <Section title={t("actions")}>
          {sourceEditable && (
            <Button onClick={addNew} size="sm" variant="outline" w="full">
              {t("add")}
            </Button>
          )}
          <Button
            disabled={allFilteredSelected}
            onClick={() => selectResources(filteredResourceIds)}
            size="sm"
            variant="outline"
            w="full"
          >
            {t("select_all")}
          </Button>
          <Button
            disabled={!hasSelection}
            onClick={() => deselectResources(filteredResourceIds)}
            size="sm"
            variant="outline"
            w="full"
          >
            {t("deselect_all")}
          </Button>
          {sourceEditable && (
            <Button
              colorPalette="red"
              disabled={!hasSelection}
              onClick={() => setRemoveDialogOpen(true)}
              size="sm"
              variant="outline"
              w="full"
            >
              {t("remove")}
            </Button>
          )}
        </Section>

        <ConfirmationDialog
          cancelText={t("cancel")}
          confirmText={t("remove.confirm_action")}
          description={tpi(
            "remove.confirm",
            selectedFilteredResourceIds.length,
            `${selectedFilteredResourceIds.length}`,
          )}
          onCancel={() => setRemoveDialogOpen(false)}
          onConfirm={removeSelected}
          open={removeDialogOpen}
          title={t("remove.confirm_title")}
        />
      </>
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
  "cancel": {
    en: "Cancel",
    it: "Annulla",
  },
  "add": {
    en: "Add new",
    it: "Crea nuovo",
  },
  "deselect_all": {
    en: "Deselect all",
    it: "Deseleziona tutti",
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
  "remove.confirm_action": {
    en: "Delete",
    it: "Elimina",
  },
  "remove.confirm_title": {
    en: "Delete selected resources?",
    it: "Eliminare le risorse selezionate?",
  },
  "remove.error.description/*": {
    en: "An error occurred while deleting the resources.",
    it: "Si è verificato un errore durante la rimozione delle risorse.",
  },
  "remove.error.description/1": {
    en: "An error occurred while deleting the resource.",
    it: "Si è verificato un errore durante la rimozione della risorsa.",
  },
  "remove.error.title": {
    en: "Remove failed!",
    it: "Rimozione fallita!",
  },
  "select_all": {
    en: "Select all",
    it: "Seleziona tutti",
  },
};
