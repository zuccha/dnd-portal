import { useMemo } from "react";
import { useI18nLang } from "~/i18n/i18n-lang";
import { translate } from "~/i18n/i18n-string";
import catalogue from "~/models/catalogue/catalogue";
import { compareObjects } from "~/utils/object";
import type { ResourceOption } from "../resource";
import type { ResourceUnion } from "../resource-union";

//------------------------------------------------------------------------------
// Chronicle Entry Subject
//------------------------------------------------------------------------------

export type ChronicleEntrySubject = Extract<
  ResourceUnion,
  { kind: "deity" | "faction" | "npc" | "place" | "plane" }
>;

//------------------------------------------------------------------------------
// Catalogue Stores
//------------------------------------------------------------------------------

const deityResources = catalogue.createResourceStore("deity");
const factionResources = catalogue.createResourceStore("faction");
const npcResources = catalogue.createResourceStore("npc");
const placeResources = catalogue.createResourceStore("place");
const planeResources = catalogue.createResourceStore("plane");

//------------------------------------------------------------------------------
// Subject Resource Hooks
//------------------------------------------------------------------------------

const useActiveSourceReferenceDeityIds = deityResources.useActiveSourceReferenceResourceIds;
const useActiveSourceReferenceFactionIds = factionResources.useActiveSourceReferenceResourceIds;
const useActiveSourceReferenceNpcIds = npcResources.useActiveSourceReferenceResourceIds;
const useActiveSourceReferencePlaceIds = placeResources.useActiveSourceReferenceResourceIds;
const useActiveSourceReferencePlaneIds = planeResources.useActiveSourceReferenceResourceIds;
const useDeities = deityResources.useResources;
const useFactions = factionResources.useResources;
const useNpcs = npcResources.useResources;
const usePlaces = placeResources.useResources;
const usePlanes = planeResources.useResources;

//------------------------------------------------------------------------------
// Use Chronicle Entry Subject Resources
//------------------------------------------------------------------------------

function useChronicleEntrySubjectResources(): ChronicleEntrySubject[] {
  const deityIds = useActiveSourceReferenceDeityIds();
  const factionIds = useActiveSourceReferenceFactionIds();
  const npcIds = useActiveSourceReferenceNpcIds();
  const placeIds = useActiveSourceReferencePlaceIds();
  const planeIds = useActiveSourceReferencePlaneIds();

  const deities = useDeities(deityIds);
  const factions = useFactions(factionIds);
  const npcs = useNpcs(npcIds);
  const places = usePlaces(placeIds);
  const planes = usePlanes(planeIds);

  return useMemo(
    () => [...deities, ...factions, ...npcs, ...places, ...planes],
    [deities, factions, npcs, places, planes],
  );
}

//------------------------------------------------------------------------------
// Use Resource Options
//------------------------------------------------------------------------------

function useResourceOptions(): ResourceOption<ChronicleEntrySubject["kind"]>[] {
  const [lang] = useI18nLang();
  const resources = useChronicleEntrySubjectResources();

  return useMemo(() => {
    const options = resources
      .map(({ id, kind, name }) => ({ kind, label: translate(name, lang), name, value: id }))
      .sort(compareObjects("label"));
    return options;
  }, [lang, resources]);
}

//------------------------------------------------------------------------------
// Chronicle Entry Subject Reference Store
//------------------------------------------------------------------------------

export const chronicleEntrySubjectReferenceStore = {
  useResourceOptions,
};
