import { CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import { translate } from "../../../../../../i18n/i18n-string";
import type { Resource } from "../../../../../../resources/resource";
import Button from "../../../../../../ui/button";
import type { EditedResource } from "./use-edited-resource";

//------------------------------------------------------------------------------
// Resource Editor
//------------------------------------------------------------------------------

export function createResourceEditor<R extends Resource>(
  useEditedResource: (campaignId: string) => EditedResource<R>,
  Content: React.FC<{ resource: R }>
) {
  return function ResourceEditor({ campaignId }: { campaignId: string }) {
    const [resource, setResource] = useEditedResource(campaignId);
    const { lang, t, ti } = useI18nLangContext(i18nContext);

    return (
      <Dialog.Root
        lazyMount
        onOpenChange={(e) => {
          if (!e.open) setResource(undefined);
        }}
        open={!!resource}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>
                  {resource
                    ? ti("title", translate(resource.name, lang))
                    : t("title.empty")}
                </Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>
                {resource && <Content resource={resource} />}
              </Dialog.Body>

              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">{t("cancel")}</Button>
                </Dialog.ActionTrigger>
                <Button>{t("save")}</Button>
              </Dialog.Footer>

              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    );
  };
}

//----------------------------------------------------------------------------
// I18nContext
//----------------------------------------------------------------------------

const i18nContext = {
  "title": {
    en: "Edit <1>",
    it: "Modifica <1>",
  },

  "title.empty": {
    en: "Edit resource",
    it: "Modifica risorsa",
  },

  "cancel": {
    en: "Cancel",
    it: "Cancella",
  },

  "save": {
    en: "Save",
    it: "Salva",
  },
};
