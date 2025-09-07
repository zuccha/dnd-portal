import { CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
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
  form: Form<FF, { id: string; lang: string }>,
  Content: React.FC<ResourceEditorContentProps<R>>
) {
  const { useSubmit, useValid } = form;

  function SaveButton({ label, saving }: { label: string; saving: boolean }) {
    const valid = useValid();
    return (
      <Button
        disabled={!valid || saving}
        form="edit-resource"
        loading={saving}
        type="submit"
      >
        {label}
      </Button>
    );
  }

  return function ResourceEditor({ campaignId }: { campaignId: string }) {
    const resource = useEditedResource();
    const [setEditedResource] = useSetEditedResource(campaignId);
    const { lang, t, ti } = useI18nLangContext(i18nContext);

    const [submit, saving] = useSubmit(
      useMemo(() => ({ id: resource?.id ?? "", lang }), [lang, resource?.id])
    );

    const save = useCallback(
      (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        submit();
      },
      [submit]
    );

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
                  <form id="edit-resource" onSubmit={save}>
                    <Content resource={resource} />
                  </form>
                )}
              </Dialog.Body>

              <Dialog.Footer>
                <Dialog.ActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </Dialog.ActionTrigger>
                <SaveButton label={t("save")} saving={saving} />
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
