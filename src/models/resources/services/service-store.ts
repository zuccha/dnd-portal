import { createResourceStore } from "../resource-store";
import { useLocalizeService } from "./localized-service";
import {
  defaultService,
  serviceSchema,
  serviceTranslationFields,
} from "./service";
import {
  defaultServiceFilters,
  serviceFiltersSchema,
  serviceOrderOptions,
} from "./service-filters";

//------------------------------------------------------------------------------
// Service Store
//------------------------------------------------------------------------------

export const serviceStore = createResourceStore(
  { p: "services", s: "service" },
  {
    defaultFilters: defaultServiceFilters,
    defaultResource: defaultService,
    filtersSchema: serviceFiltersSchema,
    kinds: ["service"],
    orderOptions: serviceOrderOptions,
    resourceSchema: serviceSchema,
    translationFields: serviceTranslationFields,
    useLocalizeResource: useLocalizeService,
  },
);
