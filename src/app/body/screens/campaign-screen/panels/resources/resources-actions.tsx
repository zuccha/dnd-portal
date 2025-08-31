import { Menu, Portal } from "@chakra-ui/react";
import { EllipsisVerticalIcon } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import type {
  Resource,
  ResourceFilters,
  ResourceStore,
  ResourceTranslation,
} from "../../../../../../resources/resource";
import IconButton from "../../../../../../ui/icon-button";
import { downloadJson } from "../../../../../../utils/download";

//------------------------------------------------------------------------------
// Create Resources Actions
//------------------------------------------------------------------------------

export function createResourcesActions<
  R extends Resource,
  T extends ResourceTranslation<R>,
  F extends ResourceFilters
>(
  store: ResourceStore<R, F>,
  useTranslations: (campaignId: string) => T[] | undefined
) {
  const { useSelectionCount } = store;

  return function ResourcesActions({ campaignId }: { campaignId: string }) {
    const { t } = useI18nLangContext(i18nContext);

    const totalSelectionCount = useSelectionCount();
    const translations = useTranslations(campaignId);

    const selectionCount = useMemo(() => {
      if (!translations) return 0;
      return translations.filter(({ id }) => store.isSelected(id)).length;
    }, [translations, totalSelectionCount]); // eslint-disable-line react-hooks/exhaustive-deps

    const computeSelectedAsJson = useCallback(() => {
      const selected = translations!
        .filter(({ id }) => store.isSelected(id))
        .map(({ _raw, ...rest }) => rest);
      return JSON.stringify(selected, null, 2);
    }, [translations]);

    const copySelected = useCallback(async () => {
      if (!selectionCount) return;
      const json = computeSelectedAsJson();
      await navigator.clipboard.writeText(json);
      // TODO: Show toast.
    }, [computeSelectedAsJson, selectionCount]);

    const downloadSelected = useCallback(async () => {
      if (!selectionCount) return;
      const json = computeSelectedAsJson();
      downloadJson(json, `${store.id}.json`);
    }, [computeSelectedAsJson, selectionCount]);

    return (
      <Menu.Root>
        <Menu.Trigger asChild focusRing="outside" mr={2} rounded="full">
          <IconButton Icon={EllipsisVerticalIcon} size="sm" variant="ghost" />
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item
                disabled={!selectionCount}
                onClick={copySelected}
                value="copy"
              >
                {t("copy")}
              </Menu.Item>
              <Menu.Item
                disabled={!selectionCount}
                onClick={downloadSelected}
                value="download"
              >
                {t("download")}
              </Menu.Item>
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
  copy: {
    en: "Copy selected",
    it: "Copia selezionati",
  },
  download: {
    en: "Download selected",
    it: "Scarica selezionati",
  },
};
