import { Menu, Portal } from "@chakra-ui/react";
import { EllipsisVerticalIcon } from "lucide-react";
import { useCallback } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { type I18nString, translate } from "~/i18n/i18n-string";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import IconButton from "~/ui/icon-button";
import { downloadFile } from "~/utils/download";

//------------------------------------------------------------------------------
// Resources Actions
//------------------------------------------------------------------------------

type ResourcesActionsProps<
  R extends Resource,
  L extends LocalizedResource<R>,
> = {
  canEdit: boolean;
  name: I18nString;
  onAddNew: () => void;
  onRemove: (ids: string[]) => void;
  selectedLocalizedResources: L[];
};

export default function ResourcesActions<
  R extends Resource,
  L extends LocalizedResource<R>,
>({
  canEdit,
  onAddNew,
  onRemove,
  name,
  selectedLocalizedResources,
}: ResourcesActionsProps<R, L>) {
  const { lang, t, tpi } = useI18nLangContext(i18nContext);

  const computeSelectedAsJson = useCallback(() => {
    const data = selectedLocalizedResources.map(({ _raw, ...rest }) => rest);
    return JSON.stringify(data, null, 2);
  }, [selectedLocalizedResources]);

  const copySelected = useCallback(async () => {
    const json = computeSelectedAsJson();
    await navigator.clipboard.writeText(json);
    // TODO: Show toast.
  }, [computeSelectedAsJson]);

  const downloadSelected = useCallback(async () => {
    const json = computeSelectedAsJson();
    downloadFile(json, `${translate(name, lang, "resources")}.json`, "json");
  }, [computeSelectedAsJson, lang, name]);

  const removeSelected = useCallback(async () => {
    try {
      const count = selectedLocalizedResources.length;
      const ok = confirm(tpi("remove.confirm", count, `${count}`));
      if (ok) onRemove(selectedLocalizedResources.map(({ id }) => id));
    } catch (e) {
      console.error(e);
      // TODO: Show toast.
    }
  }, [tpi, onRemove, selectedLocalizedResources]);

  const disabled = !selectedLocalizedResources.length;

  return (
    <Menu.Root>
      <Menu.Trigger asChild focusRing="outside" mr={2} rounded="full">
        <IconButton Icon={EllipsisVerticalIcon} size="sm" variant="ghost" />
      </Menu.Trigger>
      <Portal>
        <Menu.Positioner>
          <Menu.Content>
            {canEdit && (
              <Menu.Item onClick={onAddNew} value="add">
                {t("add")}
              </Menu.Item>
            )}

            <Menu.Item disabled={disabled} onClick={copySelected} value="copy">
              {t("copy")}
            </Menu.Item>

            <Menu.Item
              disabled={disabled}
              onClick={downloadSelected}
              value="download"
            >
              {t("download")}
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
}

//------------------------------------------------------------------------------
// I18nContext
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
