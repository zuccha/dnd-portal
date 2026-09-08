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

export const serviceStore = createResourceStore("service", {
  defaultFilters: defaultServiceFilters,
  defaultResource: defaultService,
  displayName: { en: "Services", it: "Servizi" },
  filtersSchema: serviceFiltersSchema,
  orderOptions: serviceOrderOptions,
  resourceSchema: serviceSchema,
  translationFields: serviceTranslationFields,
  useLocalizeResource: useLocalizeService,
});
