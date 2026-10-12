import { Menu, Portal } from "@chakra-ui/react";
import { EllipsisVerticalIcon, PrinterIcon } from "lucide-react";
import { useCallback } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useSourceEditable } from "~/models/catalogue/catalogue";
import { printDeck } from "~/models/print-deck/print-deck-store";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import { resourceUnionSchema } from "~/models/resources/resource-union";
import Button from "~/ui/button";
import Icon from "~/ui/icon";
import IconButton from "~/ui/icon-button";
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
  const usePaletteName = context.usePaletteName;

  const { deselectResources, selectResources, useSelectedResourceIds } = store;
  return function ResourcesActions({ sourceId }: ResourcesActionsProps) {
    const { lang, t, tp, tpi } = useI18nLangContext(i18nContext);
    const filteredResourceIds = useFilteredResourceIds(sourceId);
    const selectedFilteredResourceIds = useSelectedResourceIds(filteredResourceIds);
    const sourceEditable = useSourceEditable(sourceId);
    const paletteName = usePaletteName();

    const addNew = useCallback(() => {
      context.setCreatedResource(store.defaultResource);
    }, []);

    const removeSelected = useCallback(async () => {
      const selectedResources = selectedFilteredResourceIds
        .map(store.getResource)
        .filter((resource) => resource !== undefined);
      const count = selectedResources.length;
      try {
        const ok = confirm(tpi("remove.confirm", count, `${count}`));
        if (ok) {
          const selectedResourceIds = selectedResources.map(({ id }) => id);
          const error = await store.deleteResources(selectedResourceIds);
          if (error) throw new Error(error);
          deselectResources(selectedResourceIds);
        }
      } catch (e) {
        console.error(e);
        toaster.error({
          description: tp("remove.error.description", count),
          title: t("remove.error.title"),
        });
      }
    }, [selectedFilteredResourceIds, t, tp, tpi]);

    const addSelectedToPrintDeck = useCallback(() => {
      const entries = selectedFilteredResourceIds.flatMap((resourceId) => {
        const resource = store.getResource(resourceId);
        return resource
          ? [
              {
                lang,
                palette_name: paletteName,
                resource: resourceUnionSchema.parse(resource),
              },
            ]
          : [];
      });

      if (!entries.length) return;

      printDeck.addEntries(entries);
      toaster.info({
        description: tpi("print_deck.added.description", entries.length, `${entries.length}`),
        title: t("print_deck.added.title"),
      });
    }, [lang, paletteName, selectedFilteredResourceIds, t, tpi]);

    const hasSelection = selectedFilteredResourceIds.length > 0;
    const canAddSelectedToPrintDeck = hasSelection;
    const allFilteredSelected = selectedFilteredResourceIds.length === filteredResourceIds.length;

    return (
      <Section
        action={
          <Menu.Root>
            <Menu.Trigger asChild focusRing="outside" mr={-2} rounded="full">
              <IconButton
                Icon={EllipsisVerticalIcon}
                label={t("actions")}
                size="xs"
                variant="ghost"
              />
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content>
                  {sourceEditable && (
                    <Menu.Item
                      _hover={{ bg: "bg.error", color: "fg.error" }}
                      color="fg.error"
                      disabled={!hasSelection}
                      onSelect={removeSelected}
                      value="remove"
                    >
                      {t("remove")}
                    </Menu.Item>
                  )}

                  {sourceEditable && <Menu.Separator />}

                  <Menu.ItemGroup>
                    <Menu.Item
                      disabled={allFilteredSelected}
                      onSelect={() => selectResources(filteredResourceIds)}
                      value="select-all"
                    >
                      {t("select_all")}
                    </Menu.Item>

                    <Menu.Item
                      disabled={!hasSelection}
                      onSelect={() => deselectResources(filteredResourceIds)}
                      value="deselect-all"
                    >
                      {t("deselect_all")}
                    </Menu.Item>
                  </Menu.ItemGroup>
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        }
        title={t("actions")}
      >
        {sourceEditable && (
          <Button onClick={addNew} size="sm" variant="outline" w="full">
            {t("add")}
          </Button>
        )}
        <Button
          disabled={!canAddSelectedToPrintDeck}
          onClick={addSelectedToPrintDeck}
          size="sm"
          variant="outline"
          w="full"
        >
          <Icon Icon={PrinterIcon} size="sm" />
          {t("print_deck.add_selected")}
        </Button>
      </Section>
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
  "deselect_all": {
    en: "Deselect all",
    it: "Deseleziona tutti",
  },
  "print_deck.add_selected": {
    en: "Add to print deck",
    it: "Prepara per la stampa",
  },
  "print_deck.added.description/*": {
    en: "<1> resources added to the print deck.",
    it: "<1> risorse aggiunte al mazzo di stampa.",
  },
  "print_deck.added.description/1": {
    en: "1 resource added to the print deck.",
    it: "1 risorsa aggiunta al mazzo di stampa.",
  },
  "print_deck.added.title": {
    en: "Added to print deck",
    it: "Aggiunto al mazzo di stampa",
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
