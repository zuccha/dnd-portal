import type { LocalizedPc } from "~/models/resources/pcs/localized-pc";
import type { Pc } from "~/models/resources/pcs/pc";
import PokerCard from "~/ui/poker-card";
import { ResourcePokerCard, type ResourcePokerCardProps } from "../../resource-poker-card";

//------------------------------------------------------------------------------
// PC Card
//------------------------------------------------------------------------------

export type PcCardProps = ResourcePokerCardProps<Pc, LocalizedPc>;

export function PcCard({
  linkResources = true,
  localizedResource,
  palette,
  ...props
}: PcCardProps) {
  const classes = localizedResource.classes;
  const classField =
    classes.resources.length > 0
      ? {
          ...classes,
          value: linkResources ? (
            <>
              {classes.resources.map(({ id, kind, name }, index) => (
                <span key={id}>
                  {index > 0 ? ", " : ""}
                  <PokerCard.Link id={id} kind={kind} palette={palette}>
                    {name}
                  </PokerCard.Link>
                </span>
              ))}
            </>
          ) : (
            classes.value
          ),
        }
      : undefined;
  const species = localizedResource.species;
  const speciesField = species.resource
    ? {
        ...species,
        value: linkResources ? (
          <PokerCard.Link id={species.resource.id} kind={species.resource.kind} palette={palette}>
            {species.resource.name}
          </PokerCard.Link>
        ) : (
          species.value
        ),
      }
    : undefined;
  const fields = [
    ...(classField ? [classField] : []),
    ...(speciesField ? [speciesField] : []),
    localizedResource.level,
    localizedResource.status,
    ...(localizedResource.date_of_birth.value ? [localizedResource.date_of_birth] : []),
    ...(localizedResource.date_of_death.value ? [localizedResource.date_of_death] : []),
  ];

  return (
    <ResourcePokerCard
      beforeDetails={<PokerCard.LabeledValues fields={fields} palette={palette} />}
      linkResources={linkResources}
      localizedResource={localizedResource}
      palette={palette}
      {...props}
    />
  );
}

PcCard.Placeholder = ResourcePokerCard.Placeholder;
PcCard.h = ResourcePokerCard.h;
PcCard.w = ResourcePokerCard.w;
