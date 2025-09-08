import { CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { useCallback } from "react";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import { translate } from "../../../../../../i18n/i18n-string";
import type { Resource } from "../../../../../../resources/resource";
import Button from "../../../../../../ui/button";
import type { Form } from "../../../../../../utils/form";

//------------------------------------------------------------------------------
// Resource Editor
//------------------------------------------------------------------------------

export type ResourceEditorRefObject = {
  save: (formData: FormData) => Promise<Record<string, string>>;
};

export type ResourceEditorContentProps<R extends Resource> = {
  resource: R;
};

export function createResourceEditor<
  R extends Resource,
  FF extends Record<string, unknown>
>(
  useEditedResource: () => R | undefined,
  useSetEditedResource: (
    campaignId: string
  ) => [(resource: R | undefined) => void, boolean],
  form: Form<FF>,
  onSubmitForm: (
    data: Partial<FF>,
    context: { id: string; lang: string }
  ) => Promise<string | undefined>,
  Content: React.FC<ResourceEditorContentProps<R>>
) {
  const { useSubmit, useValid } = form;

  return function ResourceEditor({ campaignId }: { campaignId: string }) {
    const resource = useEditedResource();
    const [setEditedResource] = useSetEditedResource(campaignId);
    const { lang, t, ti } = useI18nLangContext(i18nContext);

    const [submit, saving] = useSubmit(
      useCallback(
        (data) => onSubmitForm(data, { id: resource?.id ?? "", lang }),
        [lang, resource?.id]
      )
    );

    const save = useCallback(async () => {
      await submit();
    }, [submit]);

    const saveAndClose = useCallback(async () => {
      const error = await submit();
      if (!error) setEditedResource(undefined);
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

                <Button
                  disabled={disabled}
                  loading={saving}
                  onClick={saveAndClose}
                  variant="outline"
                >
                  {t("save_and_close")}
                </Button>

                <Button disabled={disabled} loading={saving} onClick={save}>
                  {t("save")}
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
  "title": {
    en: 'Edit "<1>"',
    it: 'Modifica "<1>"',
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

  "save_and_close": {
    en: "Save and close",
    it: "Salva e chiudi",
  },
};
