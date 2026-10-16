import type { Feature } from "~/models/resources/features/feature";
import { featureForm, featureFormDataToResource } from "~/models/resources/features/feature-form";
import { featureStore } from "~/models/resources/features/feature-store";
import type { LocalizedFeature } from "~/models/resources/features/localized-feature";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import FeatureDetail from "./detail/feature-detail";
import { createFeatureEditor } from "./feature-editor";
import { FeatureCard } from "./panel/feature-card";
import FeaturesFilters from "./panel/features-filters";

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
    detail: { Detail: FeatureDetail },
    filters: { Filters: FeaturesFilters },
    form: {
      Editor: createFeatureEditor(featureForm),
      form: featureForm,
      parseFormData: featureFormDataToResource,
    },
    table: { columns, hasDescription: true },
  },
);
