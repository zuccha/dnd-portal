import { CloseButton, Dialog, Portal } from "@chakra-ui/react";
import { type Ref, useCallback, useRef, useState } from "react";
import { useI18nLangContext } from "../../../../../../i18n/i18n-lang-context";
import { translate } from "../../../../../../i18n/i18n-string";
import type { Resource } from "../../../../../../resources/resource";
import Button from "../../../../../../ui/button";

//------------------------------------------------------------------------------
// Resource Editor
//------------------------------------------------------------------------------

export type ResourceEditorRefObject = {
  save: (formData: FormData) => Promise<Record<string, string>>;
};

export type ResourceEditorContentProps<R extends Resource> = {
  disabled: boolean;
  errors: Record<string, string>;
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

    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const save = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!contentRef.current) return;

      setSaving(true);
      const formData = new FormData(e.currentTarget);
      const errors = await contentRef.current.save(formData);
      setErrors(errors);
      setSaving(false);
    }, []);

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
                    <Content
                      disabled={saving}
                      errors={errors}
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
