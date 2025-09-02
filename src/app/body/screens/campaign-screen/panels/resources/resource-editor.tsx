import { CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { type Ref, useActionState, useRef } from "react";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import { translate } from "../../../../../../i18n/i18n-string";
import type { Resource } from "../../../../../../resources/resource";
import Button from "../../../../../../ui/button";

//------------------------------------------------------------------------------
// Resource Editor
//------------------------------------------------------------------------------

export type ResourceEditorRefObject = {
  save: (formData: FormData) => Promise<void>;
};

export type ResourceEditorContentProps<R extends Resource> = {
  disabled: boolean;
  ref: Ref<ResourceEditorRefObject>;
  resource: R;
};

export function createResourceEditor<R extends Resource>(
  useEditedResource: () => R | undefined,
  useSetEditedResource: (
    campaignId: string
  ) => [(resource: R | undefined) => void, boolean],
  Content: React.FC<ResourceEditorContentProps<R>>
) {
  return function ResourceEditor({ campaignId }: { campaignId: string }) {
    const resource = useEditedResource();
    const [setEditedResource] = useSetEditedResource(campaignId);
    const { lang, t, ti } = useI18nLangContext(i18nContext);

    const contentRef = useRef<ResourceEditorRefObject>(null);

    const [, submitAction, saving] = useActionState<
      string | undefined,
      FormData
    >(async (_state, formData) => {
      await contentRef.current?.save(formData);
      return undefined;
    }, undefined);

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
                {resource && (
                  <form action={submitAction} id="edit-resource">
                    <Content
                      disabled={saving}
                      ref={contentRef}
                      resource={resource}
                    />
                  </form>
                )}
              </Dialog.Body>

              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button disabled={saving} variant="outline">
                    {t("cancel")}
                  </Button>
                </Dialog.ActionTrigger>
                <Button
                  disabled={saving}
                  form="edit-resource"
                  loading={saving}
                  type="submit"
                >
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
};
