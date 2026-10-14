import type { Feature } from "~/models/resources/features/feature";
import { featureForm, featureFormDataToResource } from "~/models/resources/features/feature-form";
import { featureStore } from "~/models/resources/features/feature-store";
import type { LocalizedFeature } from "~/models/resources/features/localized-feature";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resources-panel";
import { createResourcesTableColumns } from "../resources-table-columns";
import FeatureDetail from "./detail/feature-detail";
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

export const resourceModule = createResourceModule(
  featureStore,
  { initialPaletteName: "navy", path: Route.ResourcesBlocksFeatures },
  {
    album: { AlbumCard: FeatureCard },
    Detail: FeatureDetail,
    filters: { Filters: FeaturesFilters },
    form: {
      Editor: createFeatureEditor(featureForm),
      form: featureForm,
      parseFormData: featureFormDataToResource,
    },
    table: { columns, detailsKey: "details" },
  },
);
