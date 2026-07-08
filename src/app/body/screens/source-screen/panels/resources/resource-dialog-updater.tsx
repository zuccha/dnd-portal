import { useCallback, useMemo } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type {
  DBResource,
  DBResourceTranslation,
} from "~/models/resources/db-resource";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import type { Form } from "~/utils/form";
import { palettes } from "~/utils/palette";
import ResourceCardPreview from "./resource-card-preview";
import ResourceDialog from "./resource-dialog";
import {
  type ResourceEditorPreviewPatch,
  applyResourceEditorPreviewPatch,
} from "./resource-editor-preview";
import type { ResourcesAlbumExtra } from "./resources-album";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Resource Dialog Updater Extra
//------------------------------------------------------------------------------

export type ResourceDialogUpdaterExtra<
  R extends Resource,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
  FF extends Record<string, unknown>,
> = {
  Editor: React.FC<{ resource: R; sourceId: string }>;
  form: Form<FF>;
  parseFormData: (
    data: Partial<FF>,
  ) => { resource: Partial<DBR>; translation: Partial<DBT> } | string;
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
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
  FF extends Record<string, unknown>,
>(
  store: ResourceStore<R, L, F, DBR, DBT>,
  context: ResourcesContext<R>,
  { Editor, form, parseFormData }: ResourceDialogUpdaterExtra<R, DBR, DBT, FF>,
  { PreviewCard }: ResourceDialogUpdaterPreviewExtra<R, L>,
) {
  async function submitForm(
    data: Partial<FF>,
    { id, lang }: { id: string; lang: string },
  ) {
    const errorOrData = parseFormData(data);
    if (typeof errorOrData === "string") return errorOrData;

    const { resource, translation } = errorOrData;
    const response = await store.updateResource(id, lang, resource, translation)
      .promise;

    if (response.status === "failure") {
      console.error(response.error);
      return "form.error.update_failure";
    }

    return undefined;
  }

  //----------------------------------------------------------------------------
  // Preview
  //----------------------------------------------------------------------------

  function Preview({
    lang,
    paletteName,
    resource,
    showImage,
    sourceId,
  }: {
    lang: string;
    paletteName: keyof typeof palettes;
    resource: R;
    showImage: boolean;
    sourceId: string;
  }) {
    const localizeResource = store.useLocalizeResource(sourceId);
    const formData = form.useData();

    const previewResource = useMemo(() => {
      const errorOrData = parseFormData(formData);
      if (typeof errorOrData === "string") return resource;
      return applyResourceEditorPreviewPatch(
        resource,
        lang,
        errorOrData as ResourceEditorPreviewPatch,
      );
    }, [formData, lang, resource]);

    return (
      <ResourceCardPreview
        Card={PreviewCard}
        localizedResource={localizeResource(previewResource)}
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

    const editedResource = context.useEditedResource();
    const editedResourceId = editedResource?.id ?? "";
    const resource = editedResource ?? store.defaultResource;
    const paletteName = context.usePaletteName();
    const showImage = context.useShowImage();

    const [submit, saving] = form.useSubmit(
      useCallback(
        (data) => submitForm(data, { id: editedResourceId, lang }),
        [editedResourceId, lang],
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

    const valid = form.useValid();
    const error = form.useSubmitError();

    const name = editedResource?.name[lang] ?? "";

    return (
      <ResourceDialog
        error={error}
        onClose={unsetEditedResource}
        onCopyToClipboard={form.copyDataToClipboard}
        onPasteFromClipboard={form.pasteDataFromClipboard}
        onPrimaryAction={save}
        onSecondaryAction={saveAndClose}
        open={!!editedResource}
        preview={
          <Preview
            lang={lang}
            paletteName={paletteName}
            resource={resource}
            showImage={showImage}
            sourceId={sourceId}
          />
        }
        primaryActionText={t("save")}
        saving={saving}
        secondaryActionText={t("save_and_close")}
        title={name ? ti("title", name) : t("title.empty")}
        valid={valid}
      >
        <Editor
          resource={editedResource ?? store.defaultResource}
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
};
