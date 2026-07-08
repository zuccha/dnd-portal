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
// Resource Dialog Creator Extra
//------------------------------------------------------------------------------

export type ResourceCreatorExtra<
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
// Create Resource Dialog Creator
//------------------------------------------------------------------------------

export type ResourceDialogCreatorProps = {
  sourceId: string;
};

export type ResourceDialogCreatorPreviewExtra<
  R extends Resource,
  L extends LocalizedResource<R>,
> = {
  PreviewCard: ResourcesAlbumExtra<R, L>["AlbumCard"];
};

export function createResourceDialogCreator<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
  DBR extends DBResource,
  DBT extends DBResourceTranslation,
  FF extends Record<string, unknown>,
>(
  store: ResourceStore<R, L, F, DBR, DBT>,
  context: ResourcesContext<R>,
  { Editor, form, parseFormData }: ResourceCreatorExtra<R, DBR, DBT, FF>,
  { PreviewCard }: ResourceDialogCreatorPreviewExtra<R, L>,
) {
  async function submitForm(
    sourceId: string,
    data: Partial<FF>,
    { lang }: { lang: string },
  ) {
    const errorOrData = parseFormData(data);
    if (typeof errorOrData === "string") return errorOrData;

    const { resource, translation } = errorOrData;
    const response = await store.createResource(
      sourceId,
      lang,
      resource,
      translation,
    ).promise;

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
  // Resources Creator
  //----------------------------------------------------------------------------

  return function ResourcesCreator({ sourceId }: ResourceDialogCreatorProps) {
    const { lang, t } = useI18nLangContext(i18nContext);

    const createdResource = context.useCreatedResource();
    const resource = createdResource ?? store.defaultResource;
    const paletteName = context.usePaletteName();
    const showImage = context.useShowImage();

    const [submit, saving] = form.useSubmit(
      useCallback(
        (data) => submitForm(sourceId, data, { lang }),
        [sourceId, lang],
      ),
    );

    const unsetCreatedResource = useCallback(() => {
      context.setCreatedResource(undefined);
    }, []);

    const createAndAddMore = useCallback(async () => {
      const error = await submit();
      if (!error) form.reset();
    }, [submit]);

    const createAndClose = useCallback(async () => {
      const error = await submit();
      if (!error) unsetCreatedResource();
    }, [submit, unsetCreatedResource]);

    const valid = form.useValid();
    const error = form.useSubmitError();

    return (
      <ResourceDialog
        error={error}
        onClose={unsetCreatedResource}
        onCopyToClipboard={form.copyDataToClipboard}
        onPasteFromClipboard={form.pasteDataFromClipboard}
        onPrimaryAction={createAndAddMore}
        onSecondaryAction={createAndClose}
        open={!!createdResource}
        preview={
          <Preview
            lang={lang}
            paletteName={paletteName}
            resource={resource}
            showImage={showImage}
            sourceId={sourceId}
          />
        }
        primaryActionText={t("create_and_add_more")}
        saving={saving}
        secondaryActionText={t("create_and_close")}
        title={t("title")}
        valid={valid}
      >
        <Editor resource={resource} sourceId={sourceId} />
      </ResourceDialog>
    );
  };
}

//------------------------------------------------------------------------------
// I18nContext
//------------------------------------------------------------------------------

const i18nContext = {
  create_and_add_more: {
    en: "Save and add more",
    it: "Salva e aggiungi altri",
  },
  create_and_close: {
    en: "Save and close",
    it: "Salva e chiudi",
  },
  title: {
    en: "Create new",
    it: "Crea nuovo",
  },
};
