import z from "zod";
import { Route } from "~/navigation/routes";
import { createLocalStore } from "~/store/local-store";
import { resourcePanels } from "../panels/panels";

//------------------------------------------------------------------------------
// Resource Navigation Tab
//------------------------------------------------------------------------------

export type ResourceNavigationTab = "all" | "favorites";

//------------------------------------------------------------------------------
// Resource Navigation Tab Store
//------------------------------------------------------------------------------

export const resourceNavigationTabStore = createLocalStore<ResourceNavigationTab>(
  "sidebar.resource_tab",
  "all",
  z.enum(["all", "favorites"]).parse,
);

//------------------------------------------------------------------------------
// Resource Favorite Routes
//------------------------------------------------------------------------------

const resourceRoutes = new Set<string>(
  resourcePanels.flatMap(({ items }) => items.map(({ route }) => route)),
);

//------------------------------------------------------------------------------
// Parse Resource Favorite Routes
//------------------------------------------------------------------------------

function parseResourceFavoriteRoutes(value: unknown): string[] {
  return [
    ...new Set(
      z
        .array(z.string())
        .parse(value)
        .filter((route) => resourceRoutes.has(route)),
    ),
  ];
}

//------------------------------------------------------------------------------
// Resource Favorite Routes Store
//------------------------------------------------------------------------------

export const resourceFavoriteRoutesStore = createLocalStore(
  "sidebar.resource_favorites",
  [
    Route.ResourcesBestiaryMonsters,
    Route.ResourcesAbilitiesSpells,
    Route.ResourcesEquipmentItems,
    Route.ResourcesEquipmentWeapons,
    Route.ResourcesEquipmentArmors,
  ],
  parseResourceFavoriteRoutes,
);
