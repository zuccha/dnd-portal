import { useMemo } from "react";
import z from "zod";
import { translate } from "~/i18n/i18n-string";
import catalogue from "~/models/catalogue/catalogue";
import { useTranslatePlaceType } from "~/models/types/place-type";
import { nilUuid } from "~/utils/uuid";
import {
  type ResourceLocalizationContext,
  localizeResource,
  localizedResourceLinkSchema,
  localizedResourceSchema,
  useResourceLocalizationContext,
} from "../localized-resource";
import { type Place, placeSchema } from "./place";
import type { Plane } from "../planes/plane";

//------------------------------------------------------------------------------
// Localized Place Schema
//------------------------------------------------------------------------------

const localizedPlacePositionLinkSchema = localizedResourceLinkSchema(z.enum(["place", "plane"]));

//------------------------------------------------------------------------------
// Localized Place Schema
//------------------------------------------------------------------------------

export const localizedPlaceSchema = localizedResourceSchema(placeSchema, z.literal("place")).extend(
  {
    description: z.string(),
    part_of: localizedPlacePositionLinkSchema.optional(),
    position: z.array(localizedPlacePositionLinkSchema),
    position_label: z.string(),
    type: z.string(),
    type_label: z.string(),
  },
);

//------------------------------------------------------------------------------
// Localized Place Type
//------------------------------------------------------------------------------

export type LocalizedPlace = z.infer<typeof localizedPlaceSchema>;

//------------------------------------------------------------------------------
// Place Localization Context
//------------------------------------------------------------------------------

type PlaceLocalizationContext = ResourceLocalizationContext & {
  position: LocalizedPlace["position"];
  translatePlaceType: (type: Place["type"]) => string;
};

const placeResources = catalogue.createResourceStore("place");
const planeResources = catalogue.createResourceStore("plane");
const usePlaceResources = placeResources.useResources as (resourceIds: string[]) => Place[];
const usePlaneResource = planeResources.useResource as (resourceId: string) => Plane | undefined;

//------------------------------------------------------------------------------
// Use Place Localization Context
//------------------------------------------------------------------------------

export function usePlaceLocalizationContext(place: Place): PlaceLocalizationContext {
  const context = useResourceLocalizationContext(i18nContext);
  const translatePlaceType = useTranslatePlaceType(context.lang);
  const placeIds = placeResources.useActiveSourceReferenceResourceIds();
  const places = usePlaceResources(placeIds);
  const placeById = useMemo(
    () => Object.fromEntries(places.map((resource) => [resource.id, resource])),
    [places],
  );
  const ancestors = useMemo(() => {
    const ancestors: Place[] = [];
    const visitedIds = new Set([place.id]);
    let parentId = place.part_of_kind === "place" ? place.part_of_id : undefined;

    while (parentId && !visitedIds.has(parentId)) {
      visitedIds.add(parentId);
      const ancestor = placeById[parentId];
      if (!ancestor) break;
      ancestors.push(ancestor);
      parentId = ancestor.part_of_kind === "place" ? ancestor.part_of_id : undefined;
    }

    return ancestors.reverse();
  }, [place.id, place.part_of_id, place.part_of_kind, placeById]);
  const rootAncestor = ancestors[0];
  let planeId: string | null | undefined;
  if (place.part_of_kind === "plane") planeId = place.part_of_id;
  else if (rootAncestor?.part_of_kind === "plane") planeId = rootAncestor.part_of_id;
  const plane = usePlaneResource(planeId ?? nilUuid);

  return useMemo(() => {
    const position = [
      ...(plane
        ? [{ id: plane.id, kind: "plane" as const, name: translate(plane.name, context.lang) }]
        : []),
      ...ancestors.map((ancestor) => ({
        id: ancestor.id,
        kind: "place" as const,
        name: translate(ancestor.name, context.lang),
      })),
    ];

    return {
      ...context,
      position,
      translatePlaceType,
    };
  }, [ancestors, context, plane, translatePlaceType]);
}

//------------------------------------------------------------------------------
// Localize Place
//------------------------------------------------------------------------------

export function localizePlace(place: Place, context: PlaceLocalizationContext): LocalizedPlace {
  let partOf: LocalizedPlace["part_of"] = undefined;
  if (place.part_of_kind === "plane") {
    partOf = context.position.find(({ kind }) => kind === "plane");
  } else if (place.part_of_kind === "place") {
    partOf = context.position.filter(({ kind }) => kind === "place").slice(-1)[0];
  }

  return {
    ...localizeResource(place, context),
    descriptor: context.translatePlaceType(place.type),
    description: translate(place.description, context.lang),

    part_of: partOf,
    position: context.position,
    position_label: context.t("part_of"),
    type: context.translatePlaceType(place.type),
    type_label: context.t("type"),
  };
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  part_of: { en: "Part of", it: "Parte di" },
  type: { en: "Type", it: "Tipo" },
};
