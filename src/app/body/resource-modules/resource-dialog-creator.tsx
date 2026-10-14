import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import ResourceRelationsDraftProvider from "~/models/catalogue/resource-relations-draft-provider";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import {
  splitResourceFormOutput,
  type ParsedResourceFormOutput,
} from "~/models/resources/resource-form";
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
// Resource Dialog Creator Extra
//------------------------------------------------------------------------------

export type ResourceCreatorExtra<R extends Resource, FF extends Record<string, unknown>> = {
  Editor: React.FC<{ resource: R; sourceId: string }>;
  form: Form<FF>;
  parseFormData: (data: Partial<FF>, lang: string) => ParsedResourceFormOutput<R> | string;
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
  FF extends Record<string, unknown>,
>(
  store: ResourceStore<R, L, F>,
  context: ResourcesContext<R>,
  { Editor, form, parseFormData }: ResourceCreatorExtra<R, FF>,
  { PreviewCard }: ResourceDialogCreatorPreviewExtra<R, L>,
) {
  async function submitForm(
    sourceId: string,
    data: Partial<FF>,
    { lang, resource }: { lang: string; resource: R },
  ) {
    const errorOrData = parseFormData(data, lang);
    if (typeof errorOrData === "string") return errorOrData;

    const output = splitResourceFormOutput(errorOrData);
    const nextResource = applyResourceEditorPreviewPatch(
      resource,
      output.resource as ResourceEditorPreviewPatch<R>,
      store.translationFields,
    );
    const { id: _id, ...resourcePatch } = nextResource;
    const error = await store.createResource(
      sourceId,
      resourcePatch as Partial<R>,
      output.relations,
    );

    return error;
  }

  const { useData, useSubmit, useSubmitError, useValid } = form;
  const { localizeResource, useLocalizationContext } = store;
  const { useCreatedResource, usePaletteName, useShowImage } = context;

  //----------------------------------------------------------------------------
  // Preview Card Content
  //----------------------------------------------------------------------------

  function PreviewCardContent({
    paletteName,
    resource,
    showImage,
  }: {
    paletteName: keyof typeof palettes;
    resource: R;
    showImage: boolean;
  }) {
    const localizationContext = useLocalizationContext(resource);
    return (
      <ResourceCardPreview
        Card={PreviewCard}
        localizedResource={localizeResource(resource, localizationContext)}
        palette={palettes[paletteName]}
        showImage={showImage}
      />
    );
  }

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
      const output = splitResourceFormOutput(errorOrData);
      return applyResourceEditorPreviewPatch(
        resource,
        output.resource as ResourceEditorPreviewPatch<R>,
        store.translationFields,
      );
    }, [formData, lang, resource]);

    const parsedFormData = parseFormData(formData, lang);
    const relationUpdates =
      typeof parsedFormData === "string" ? [] : splitResourceFormOutput(parsedFormData).relations;

    return (
      <ResourceRelationsDraftProvider endpoint={previewResource} updates={relationUpdates}>
        <PreviewCardContent
          paletteName={paletteName}
          resource={previewResource}
          showImage={showImage}
        />
      </ResourceRelationsDraftProvider>
    );
  }

  //----------------------------------------------------------------------------
  // Resources Creator
  //----------------------------------------------------------------------------

  return function ResourcesCreator({ sourceId }: ResourceDialogCreatorProps) {
    const { lang, t } = useI18nLangContext(i18nContext);

    const createdResource = useCreatedResource();
    const resource = createdResource ?? store.defaultResource;
    const formData = useData();
    const [editorLang, setEditorLang] = useState(lang);
    const [editorResource, setEditorResource] = useState(resource);
    const [editorRevision, setEditorRevision] = useState(0);
    const paletteName = usePaletteName();
    const showImage = useShowImage();

    useEffect(() => {
      setEditorLang(lang);
      setEditorResource(resource);
    }, [createdResource?.id, lang, resource]);

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
              splitResourceFormOutput(errorOrData).resource as ResourceEditorPreviewPatch<R>,
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
        (data) => submitForm(sourceId, data, { lang: editorLang, resource: editorResource }),
        [editorLang, editorResource, sourceId],
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

    const valid = useValid();
    const error = useSubmitError();

    return (
      <ResourceDialog
        editorLang={editorLang}
        error={error}
        onClose={unsetCreatedResource}
        onEditorLangChange={changeEditorLang}
        onCopyToClipboard={copyResourceToClipboard}
        onPasteFromClipboard={pasteResourceFromClipboard}
        onPrimaryAction={createAndAddMore}
        onSecondaryAction={createAndClose}
        open={!!createdResource}
        preview={
          <Preview
            lang={editorLang}
            paletteName={paletteName}
            resource={editorResource}
            showImage={showImage}
          />
        }
        primaryActionText={t("create_and_add_more")}
        saving={saving}
        secondaryActionText={t("create_and_close")}
        title={t("title")}
        valid={valid}
      >
        <Editor
          key={`${createdResource?.id ?? "new"}:${editorLang}:${editorRevision}`}
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
  paste_error: {
    en: "Unable to paste resource",
    it: "Impossibile incollare la risorsa",
  },
  paste_incompatible: {
    en: "The copied resource has a different type.",
    it: "La risorsa copiata è di un tipo diverso.",
  },
  paste_invalid: {
    en: "The clipboard content is not a valid resource.",
    it: "Il contenuto degli appunti non è una risorsa valida.",
  },
};
