import { useMemo, type ComponentType } from "react";
import type { PrintDeckEntry } from "~/models/print-deck/print-deck-entry";
import type { TranslationFields } from "~/models/resources/resource";
import type { ResourceUnion } from "~/models/resources/resource-union";
import { resourceUnionSchema } from "~/models/resources/resource-union";
import type { Form } from "~/utils/form";
import { palettes, type Palette } from "~/utils/palette";
import ResourceCardPreview from "../../../../resource-modules/resource-card-preview";
import { applyResourceEditorPreviewPatch } from "../../../../resource-modules/resource-editor-preview";
import { getPrintDeckCard } from "./print-deck-registry";
import type { PrintDeckEditorConfiguration } from "./print-deck-resource-dialog";

//------------------------------------------------------------------------------
// Print Deck Editor Preview Props
//------------------------------------------------------------------------------

type PrintDeckEditorPreviewProps = {
  entry: PrintDeckEntry;
  editorLang: string;
  localizeResource: PrintDeckEditorConfiguration["localizeResource"];
  parseFormData: PrintDeckEditorConfiguration["parseFormData"];
  translationFields: TranslationFields<ResourceUnion>[];
  useData: Form<Record<string, unknown>>["useData"];
  useLocalizationContext: PrintDeckEditorConfiguration["useLocalizationContext"];
};

//------------------------------------------------------------------------------
// Print Deck Editor Preview
//------------------------------------------------------------------------------

export default function PrintDeckEditorPreview({
  editorLang,
  entry,
  localizeResource,
  parseFormData,
  translationFields,
  useData,
  useLocalizationContext,
}: PrintDeckEditorPreviewProps) {
  const formData = useData();

  const previewRawResource = useMemo(() => {
    const errorOrPatch = parseFormData(formData, editorLang);
    if (typeof errorOrPatch === "string") return entry.resource;

    return resourceUnionSchema.parse(
      applyResourceEditorPreviewPatch(entry.resource, errorOrPatch, translationFields),
    );
  }, [editorLang, entry, formData, parseFormData, translationFields]);

  const localizationContext = useLocalizationContext(entry.resource);

  const previewLocalizedResource = useMemo(
    () => localizeResource(previewRawResource, localizationContext),
    [localizeResource, localizationContext, previewRawResource],
  );

  const Card = getPrintDeckCard(entry.resource.kind);

  const Preview = ResourceCardPreview as unknown as ComponentType<{
    Card: typeof Card;
    localizedResource: typeof previewLocalizedResource;
    palette: Palette;
    showImage: boolean;
  }>;

  return (
    <Preview
      Card={Card}
      localizedResource={previewLocalizedResource}
      palette={palettes[entry.palette_name]}
      showImage
    />
  );
}
