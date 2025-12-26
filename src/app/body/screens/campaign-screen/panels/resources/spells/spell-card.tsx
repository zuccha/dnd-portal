import { Span } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedSpell } from "~/models/resources/spells/localized-spell";
import type { Spell } from "~/models/resources/spells/spell";
import { useIsSpellSelected } from "~/models/resources/spells/spells-store";
import ResourceCard from "../_base/resource-card";

//------------------------------------------------------------------------------
// Spell Card
//------------------------------------------------------------------------------

export type SpellCardProps = {
  canEdit: boolean;
  localizedResource: LocalizedSpell;
  onOpen: (resource: Spell) => void;
};

export default function SpellCard({
  canEdit,
  localizedResource,
  onOpen,
}: SpellCardProps) {
  const {
    casting_time_with_ritual,
    character_classes,
    components,
    description,
    duration_with_concentration,
    id,
    materials,
    range,
    school_with_level,
  } = localizedResource;

  const { t } = useI18nLangContext(i18nContext);

  const [selected, { toggle }] = useIsSpellSelected(id);

  return (
    <ResourceCard
      canEdit={canEdit}
      localizedResource={localizedResource}
      onOpen={onOpen}
      onToggleSelected={toggle}
      selected={selected}
    >
      <ResourceCard.Caption>
        <Span whiteSpace="nowrap">{school_with_level}</Span>
        <Span textAlign="right">{character_classes}</Span>
      </ResourceCard.Caption>

      <ResourceCard.Info>
        <ResourceCard.InfoCell label={t("casting_time")}>
          {casting_time_with_ritual}
        </ResourceCard.InfoCell>

        <ResourceCard.InfoCell label={t("range")}>
          {range}
        </ResourceCard.InfoCell>

        <ResourceCard.InfoCell label={t("duration")}>
          {duration_with_concentration}
        </ResourceCard.InfoCell>

        <ResourceCard.InfoCell label={t("components")}>
          {components}
        </ResourceCard.InfoCell>

        {materials && (
          <ResourceCard.InfoCell label={t("materials")}>
            {materials}
          </ResourceCard.InfoCell>
        )}
      </ResourceCard.Info>

      <ResourceCard.Description description={description} />
    </ResourceCard>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  casting_time: {
    en: "Casting Time",
    it: "Tempo di Lancio",
  },
  components: {
    en: "Components",
    it: "Componenti",
  },
  duration: {
    en: "Duration",
    it: "Durata",
  },
  materials: {
    en: "Materials",
    it: "Materiali",
  },
  range: {
    en: "Range",
    it: "Gittata",
  },
};
