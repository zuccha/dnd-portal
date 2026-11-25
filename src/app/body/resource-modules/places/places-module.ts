import type { LocalizedPlace } from "~/models/resources/places/localized-place";
import type { Place } from "~/models/resources/places/place";
import { placeForm, placeFormDataToResource } from "~/models/resources/places/place-form";
import { placeStore } from "~/models/resources/places/place-store";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resource-module";
import { createResourcesTableColumns } from "../resources-table-columns";
import PlaceDetail from "./detail/place-detail";
import { PlaceCard } from "./panel/place-card";
import PlacesFilters from "./panel/places-filters";
import { createPlaceEditor } from "./place-editor";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<Place, LocalizedPlace>([
  { key: "type", label: { en: "Type", it: "Tipo" } },
]);

//------------------------------------------------------------------------------
// Place Module
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  placeStore,
  { initialPaletteName: "moss", path: Route.ResourcesWorldPlaces },
  {
    album: { AlbumCard: PlaceCard },
    detail: { Detail: PlaceDetail },
    filters: { Filters: PlacesFilters },
    form: {
      Editor: createPlaceEditor(placeForm),
      form: placeForm,
      parseFormData: placeFormDataToResource,
    },
    table: { columns },
  },
);
