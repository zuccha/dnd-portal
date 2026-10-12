import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import { resourceUnionSchema } from "~/models/resources/resource-union";
import { toaster } from "~/ui/toaster";
import type { Form } from "~/utils/form";
import { palettes } from "~/utils/palette";
import ResourceCardPreview from "./resource-card-preview";
import ResourceDialog from "./resource-dialog";
import {
  applyResourceEditorPaste,
  type ResourceEditorPreviewPatch,
  applyResourceEditorPreviewPatch,
} from "./resource-editor-preview";
import type { ResourcesAlbumExtra } from "./resources-album";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Resource Dialog Updater Extra
//------------------------------------------------------------------------------

export type ResourceDialogUpdaterExtra<R extends Resource, FF extends Record<string, unknown>> = {
  Editor: React.FC<{ resource: R; sourceId: string }>;
  form: Form<FF>;
  parseFormData: (data: Partial<FF>, lang: string) => Partial<R> | string;
};

//------------------------------------------------------------------------------
// Create Resource Dialog Updater
//------------------------------------------------------------------------------

export type ResourceDialogUpdaterProps = {
  sourceId: string;
};

export type ResourceDialogUpdaterPreviewExtra<
  R extends Resource,
  L extends LocalizedResource<R>,
> = {
  PreviewCard: ResourcesAlbumExtra<R, L>["AlbumCard"];
};

export function createResourceDialogUpdater<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  FF extends Record<string, unknown>,
>(
  store: ResourceStore<R, L, F>,
  context: ResourcesContext<R>,
  { Editor, form, parseFormData }: ResourceDialogUpdaterExtra<R, FF>,
  { PreviewCard }: ResourceDialogUpdaterPreviewExtra<R, L>,
) {
  async function submitForm(
    data: Partial<FF>,
    { id, lang, resource }: { id: string; lang: string; resource: R },
  ) {
    const errorOrData = parseFormData(data, lang);
    if (typeof errorOrData === "string") return errorOrData;

    return store.updateResource(
      id,
      applyResourceEditorPreviewPatch(
        resource,
        errorOrData as ResourceEditorPreviewPatch<R>,
        store.translationFields,
      ),
    );
  }

  const { useData, useSubmit, useSubmitError, useValid } = form;
  const { localizeResource, useLocalizationContext } = store;
  const { useEditedResource, usePaletteName, useShowImage } = context;

  //----------------------------------------------------------------------------
  // Preview
  //----------------------------------------------------------------------------

  function Preview({
    lang,
    paletteName,
    resource,
    showImage,
  }: {
    lang: string;
    paletteName: keyof typeof palettes;
    resource: R;
    showImage: boolean;
  }) {
    const formData = useData();

    const previewResource = useMemo(() => {
      const errorOrData = parseFormData(formData, lang);
      if (typeof errorOrData === "string") return resource;
      return applyResourceEditorPreviewPatch(
        resource,
        errorOrData as ResourceEditorPreviewPatch<R>,
        store.translationFields,
      );
    }, [formData, lang, resource]);

    const localizationContext = useLocalizationContext(previewResource);

    return (
      <ResourceCardPreview
        Card={PreviewCard}
        localizedResource={localizeResource(previewResource, localizationContext)}
        palette={palettes[paletteName]}
        showImage={showImage}
      />
    );
  }

  //----------------------------------------------------------------------------
  // Resources Updater
  //----------------------------------------------------------------------------

  return function ResourcesUpdater({ sourceId }: ResourceDialogUpdaterProps) {
    const { lang, t, ti } = useI18nLangContext(i18nContext);

    const editedResource = useEditedResource();
    const editedResourceId = editedResource?.id ?? "";
    const resource = editedResource ?? store.defaultResource;
    const formData = useData();
    const [editorLang, setEditorLang] = useState(lang);
    const [editorResource, setEditorResource] = useState(resource);
    const [editorRevision, setEditorRevision] = useState(0);
    const paletteName = usePaletteName();
    const showImage = useShowImage();

    useEffect(() => {
      setEditorLang(lang);
      setEditorResource(resource);
    }, [editedResourceId, lang, resource]);

    const changeEditorLang = useCallback(
      (nextLang: string) => {
        const errorOrData = parseFormData(formData, editorLang);
        if (typeof errorOrData !== "string") {
          setEditorResource((current) =>
            applyResourceEditorPreviewPatch(
              current,
              errorOrData as ResourceEditorPreviewPatch<R>,
              store.translationFields,
            ),
          );
        }
        setEditorLang(nextLang);
      },
      [editorLang, formData],
    );

    const copyResourceToClipboard = useCallback(async () => {
      const errorOrData = parseFormData(formData, editorLang);
      const draftResource =
        typeof errorOrData === "string"
          ? editorResource
          : applyResourceEditorPreviewPatch(
              editorResource,
              errorOrData as ResourceEditorPreviewPatch<R>,
              store.translationFields,
            );
      await navigator.clipboard.writeText(JSON.stringify(draftResource, null, 2));
    }, [editorLang, editorResource, formData]);

    const pasteResourceFromClipboard = useCallback(async () => {
      try {
        const pastedResource = resourceUnionSchema.parse(
          JSON.parse(await navigator.clipboard.readText()),
        );
        if (pastedResource.kind !== editorResource.kind) {
          toaster.error({
            description: t("paste_incompatible"),
            title: t("paste_error"),
          });
          return;
        }
        setEditorResource(
          applyResourceEditorPaste(editorResource, pastedResource, Object.keys(formData)),
        );
        setEditorRevision((revision) => revision + 1);
      } catch {
        toaster.error({
          description: t("paste_invalid"),
          title: t("paste_error"),
        });
      }
    }, [editorResource, formData, t]);

    const [submit, saving] = useSubmit(
      useCallback(
        (data) =>
          submitForm(data, { id: editedResourceId, lang: editorLang, resource: editorResource }),
        [editorLang, editorResource, editedResourceId],
      ),
    );

    const unsetEditedResource = useCallback(() => {
      context.setEditedResource(undefined);
    }, []);

    const save = useCallback(async () => {
      await submit();
    }, [submit]);

    const saveAndClose = useCallback(async () => {
      if (!(await submit())) unsetEditedResource();
    }, [submit, unsetEditedResource]);

    const valid = useValid();
    const error = useSubmitError();

    const name = editorResource.name[editorLang] ?? "";

    return (
      <ResourceDialog
        editorLang={editorLang}
        error={error}
        onClose={unsetEditedResource}
        onEditorLangChange={changeEditorLang}
        onCopyToClipboard={copyResourceToClipboard}
        onPasteFromClipboard={pasteResourceFromClipboard}
        onPrimaryAction={save}
        onSecondaryAction={saveAndClose}
        open={!!editedResource}
        preview={
          <Preview
            lang={editorLang}
            paletteName={paletteName}
            resource={editorResource}
            showImage={showImage}
          />
        }
        primaryActionText={t("save")}
        saving={saving}
        secondaryActionText={t("save_and_close")}
        title={name ? ti("title", name) : t("title.empty")}
        valid={valid}
      >
        <Editor
          key={`${editedResourceId}:${editorLang}:${editorRevision}`}
          resource={editorResource}
          sourceId={sourceId}
        />
      </ResourceDialog>
    );
  };
}

//------------------------------------------------------------------------------
// I18nContext
//------------------------------------------------------------------------------

const i18nContext = {
  "save": {
    en: "Save",
    it: "Salva",
  },
  "save_and_close": {
    en: "Save and close",
    it: "Salva e chiudi",
  },
  "title": {
    en: 'Edit "<1>"',
    it: 'Modifica "<1>"',
  },
  "title.empty": {
    en: "Edit resource",
    it: "Modifica risorsa",
  },
  "paste_error": {
    en: "Unable to paste resource",
    it: "Impossibile incollare la risorsa",
  },
  "paste_incompatible": {
    en: "The copied resource has a different type.",
    it: "La risorsa copiata è di un tipo diverso.",
  },
  "paste_invalid": {
    en: "The clipboard content is not a valid resource.",
    it: "Il contenuto degli appunti non è una risorsa valida.",
  },
};
