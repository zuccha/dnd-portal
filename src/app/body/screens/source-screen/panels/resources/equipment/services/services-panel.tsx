import { type LocalizedService } from "~/models/resources/services/localized-service";
import { type Service } from "~/models/resources/services/service";
import {
  serviceForm,
  serviceFormDataToDB,
} from "~/models/resources/services/service-form";
import { serviceStore } from "~/models/resources/services/service-store";
import { createResourcesPanel } from "../../resources-panel";
import type { ResourcesTableExtra } from "../../resources-table";
import { ServiceCard } from "./service-card";
import { createServiceEditor } from "./service-editor";
import ServicesFilters from "./services-filters";

//------------------------------------------------------------------------------
// Columns
//------------------------------------------------------------------------------

const columns: ResourcesTableExtra<Service, LocalizedService>["columns"] = [
  {
    key: "name",
    label: { en: "Name", it: "Nome" },
  },
  {
    key: "category",
    label: { en: "Category", it: "Categoria" },
    w: "1%",
  },
  {
    key: "price",
    label: { en: "Price", it: "Prezzo" },
    textAlign: "right",
    w: "1%",
  },
  {
    key: "availability",
    label: { en: "Availability", it: "Disponibilità" },
    w: "1%",
  },
] as const;

//------------------------------------------------------------------------------
// Services Panel
//------------------------------------------------------------------------------

const ServicesPanel = createResourcesPanel(
  serviceStore,
  { initialPaletteName: "gold" },
  {
    album: { AlbumCard: ServiceCard },
    filters: { Filters: ServicesFilters },
    form: {
      Editor: createServiceEditor(serviceForm),
      form: serviceForm,
      parseFormData: serviceFormDataToDB,
    },
    table: { columns, detailsKey: "details" },
  },
);

export default ServicesPanel;
