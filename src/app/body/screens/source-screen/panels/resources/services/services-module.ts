import { type LocalizedService } from "~/models/resources/services/localized-service";
import { type Service } from "~/models/resources/services/service";
import { serviceForm, serviceFormDataToResource } from "~/models/resources/services/service-form";
import { serviceStore } from "~/models/resources/services/service-store";
import { Route } from "~/navigation/routes";
import { createResourceModule } from "../resources-panel";
import { createResourcesTableColumns } from "../resources-table-columns";
import ServiceDetail from "./detail/service-detail";
import { ServiceCard } from "./service-card";
import { createServiceEditor } from "./service-editor";
import ServicesFilters from "./services-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns = createResourcesTableColumns<Service, LocalizedService>([
  {
    key: "category",
    label: { en: "Category", it: "Categoria" },
  },
  {
    key: "availability",
    label: { en: "Availability", it: "Disponibilità" },
  },
  {
    key: "price",
    label: { en: "Price", it: "Prezzo" },
    textAlign: "right",
    w: "1%",
  },
]);

//------------------------------------------------------------------------------
// Services Panel
//------------------------------------------------------------------------------

export const resourceModule = createResourceModule(
  serviceStore,
  { initialPaletteName: "gold", path: Route.ResourcesMarketServices },
  {
    album: { AlbumCard: ServiceCard },
    Detail: ServiceDetail,
    filters: { Filters: ServicesFilters },
    form: {
      Editor: createServiceEditor(serviceForm),
      form: serviceForm,
      parseFormData: serviceFormDataToResource,
    },
    table: { columns, detailsKey: "details" },
  },
);
