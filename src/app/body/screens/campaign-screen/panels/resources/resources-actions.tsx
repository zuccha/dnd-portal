import { Menu, Portal } from "@chakra-ui/react";
import { EllipsisVerticalIcon } from "lucide-react";
import { useCallback } from "react";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import type {
  LocalizedResource,
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
  T extends ResourceTranslation,
  F extends ResourceFilters,
  L extends LocalizedResource<R>
>(
  store: ResourceStore<R, T, F>,
  useLocalizedResources: (campaignId: string) => L[] | undefined,
  useSelectedTranslationsCount: (campaignId: string) => number
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

    const copySelected = useCallback(async () => {
      if (!count) return;
      const json = computeSelectedAsJson();
      await navigator.clipboard.writeText(json);
      // TODO: Show toast.
    }, [computeSelectedAsJson, count]);

    const downloadSelected = useCallback(async () => {
      if (!count) return;
      const json = computeSelectedAsJson();
      downloadJson(json, `${store.id}.json`);
    }, [computeSelectedAsJson, count]);

    return (
      <Menu.Root>
        <Menu.Trigger asChild focusRing="outside" mr={2} rounded="full">
          <IconButton Icon={EllipsisVerticalIcon} size="sm" variant="ghost" />
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content>
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
