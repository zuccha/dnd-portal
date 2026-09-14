import type { Feature } from "~/models/resources/features/feature";
import { featureForm, featureFormDataToResource } from "~/models/resources/features/feature-form";
import { featureStore } from "~/models/resources/features/feature-store";
import type { LocalizedFeature } from "~/models/resources/features/localized-feature";
import { createResourcesPanel } from "../resources-panel";
import { createResourcesTableColumns } from "../resources-table-columns";
import { FeatureCard } from "./feature-card";
import { createFeatureEditor } from "./feature-editor";
import FeaturesFilters from "./features-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<Feature, LocalizedFeature>([]);

//------------------------------------------------------------------------------
// Features Panel
//------------------------------------------------------------------------------

const FeaturesPanel = createResourcesPanel(
  featureStore,
  { initialPaletteName: "navy" },
  {
    album: { AlbumCard: FeatureCard },
    filters: { Filters: FeaturesFilters },
    form: {
      Editor: createFeatureEditor(featureForm),
      form: featureForm,
      parseFormData: featureFormDataToResource,
    },
    table: { columns, detailsKey: "details" },
  },
);

export default FeaturesPanel;
