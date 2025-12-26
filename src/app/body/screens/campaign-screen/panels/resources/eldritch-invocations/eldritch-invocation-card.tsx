import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { EldritchInvocation } from "~/models/resources/eldritch-invocations/eldritch-invocation";
import { useIsEldritchInvocationSelected } from "~/models/resources/eldritch-invocations/eldritch-invocations-store";
import type { LocalizedEldritchInvocation } from "~/models/resources/eldritch-invocations/localized-eldritch-invocation";
import ResourceCard from "../_base/resource-card";

//------------------------------------------------------------------------------
// EldritchInvocation Card
//------------------------------------------------------------------------------

export type EldritchInvocationCardProps = {
  canEdit: boolean;
  localizedResource: LocalizedEldritchInvocation;
  onOpen: (resource: EldritchInvocation) => void;
};

export default function EldritchInvocationCard({
  canEdit,
  localizedResource,
  onOpen,
}: EldritchInvocationCardProps) {
  const { t } = useI18nLangContext(i18nContext);

  const { description, id, min_warlock_level, other_prerequisite } =
    localizedResource;

  const [selected, { toggle }] = useIsEldritchInvocationSelected(id);

  return (
    <ResourceCard
      canEdit={canEdit}
      localizedResource={localizedResource}
      onOpen={onOpen}
      onToggleSelected={toggle}
      selected={selected}
    >
      <ResourceCard.Caption>{t("eldritch_invocation")}</ResourceCard.Caption>

      {(min_warlock_level || other_prerequisite) && (
        <ResourceCard.Info>
          {min_warlock_level && (
            <ResourceCard.InfoCell label={t("min_warlock_level")}>
              {min_warlock_level}
            </ResourceCard.InfoCell>
          )}
          {other_prerequisite && (
            <ResourceCard.InfoCell label={t("other_prerequisite")}>
              {other_prerequisite}
            </ResourceCard.InfoCell>
          )}
        </ResourceCard.Info>
      )}

      <ResourceCard.Description description={description} />
    </ResourceCard>
  );
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  eldritch_invocation: {
    en: "Warlock's Eldritch Invocation",
    it: "Supplica Occulta del Warlock",
  },
  min_warlock_level: {
    en: "Min Level",
    it: "Livello Minimo",
  },
  other_prerequisite: {
    en: "Prerequisite",
    it: "Prerequisito",
  },
};
