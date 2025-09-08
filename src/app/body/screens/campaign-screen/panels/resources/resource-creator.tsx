import { CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { useCallback } from "react";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import type { Resource } from "../../../../../../resources/resource";
import Button from "../../../../../../ui/button";
import type { Form } from "../../../../../../utils/form";

//------------------------------------------------------------------------------
// Resource Creator
//------------------------------------------------------------------------------

export type ResourceCreatorRefObject = {
  save: (formData: FormData) => Promise<Record<string, string>>;
};

export type ResourceCreatorContentProps<R extends Resource> = {
  resource: R;
};

export function createResourceCreator<
  R extends Resource,
  FF extends Record<string, unknown>
>(
  useNewResource: () => R | undefined,
  useSetNewResource: (
    campaignId: string
  ) => [(resource: R | undefined) => void, boolean],
  form: Form<FF>,
  onSubmitForm: (
    data: Partial<FF>,
    context: { campaignId: string; lang: string }
  ) => Promise<string | undefined>,
  Content: React.FC<ResourceCreatorContentProps<R>>
) {
  const { useSubmit, useValid } = form;

  return function ResourceCreator({ campaignId }: { campaignId: string }) {
    const resource = useNewResource();
    const [setEditedResource] = useSetNewResource(campaignId);
    const { lang, t } = useI18nLangContext(i18nContext);

    const [submit, saving] = useSubmit(
      useCallback(
        (data) => onSubmitForm(data, { campaignId, lang }),
        [campaignId, lang]
      )
    );

    const createAndAddMore = useCallback(async () => {
      await submit();
      // TODO: Reset form.
    }, [submit]);

    const createAndClose = useCallback(async () => {
      await submit();
      setEditedResource(undefined);
    }, [setEditedResource, submit]);

    const valid = useValid();
    const disabled = !valid || saving;

    return (
      <Dialog.Root
        closeOnEscape={!saving}
        closeOnInteractOutside={!saving}
        lazyMount
        onOpenChange={(e) => {
          if (!e.open) setEditedResource(undefined);
        }}
        open={!!resource}
        size="lg"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>{t("title")}</Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>
                {resource && <Content resource={resource} />}
              </Dialog.Body>

              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>

                <Button
                  disabled={disabled}
                  loading={saving}
                  onClick={createAndClose}
                  variant="outline"
                >
                  {t("save_and_close")}
                </Button>

                <Button
                  disabled={disabled}
                  loading={saving}
                  onClick={createAndAddMore}
                >
                  {t("save_and_add_more")}
                </Button>
              </Dialog.Footer>

              <Dialog.CloseTrigger asChild>
                <CloseButton disabled={saving} size="sm" />
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
  title: {
    en: "Create new",
    it: "Crea nuovo",
  },

  cancel: {
    en: "Cancel",
    it: "Cancella",
  },

  save_and_add_more: {
    en: "Save and add more",
    it: "Salva e aggiungi altri",
  },

  save_and_close: {
    en: "Save and close",
    it: "Salva e chiudi",
  },
};
