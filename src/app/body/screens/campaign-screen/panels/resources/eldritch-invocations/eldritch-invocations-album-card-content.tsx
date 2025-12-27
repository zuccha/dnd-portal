import { type StackProps, VStack } from "@chakra-ui/react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import type { LocalizedEldritchInvocation } from "~/models/resources/eldritch-invocations/localized-eldritch-invocation";
import AlbumCard from "~/ui/album-card";

//------------------------------------------------------------------------------
// Eldritch Invocations Album Card Content
//------------------------------------------------------------------------------

export type EldritchInvocationsAlbumCardContentProps = StackProps & {
  localizedResource: LocalizedEldritchInvocation;
};

export default function EldritchInvocationsAlbumCardContent({
  localizedResource,
  ...rest
}: EldritchInvocationsAlbumCardContentProps) {
  const { t } = useI18nLangContext(i18nContext);

  const { description, min_warlock_level, other_prerequisite } =
    localizedResource;

  return (
    <VStack {...rest}>
      <AlbumCard.Caption>{t("eldritch_invocation")}</AlbumCard.Caption>

      {(min_warlock_level || other_prerequisite) && (
        <AlbumCard.Info>
          {min_warlock_level && (
            <AlbumCard.InfoCell label={t("min_warlock_level")}>
              {min_warlock_level}
            </AlbumCard.InfoCell>
          )}
          {other_prerequisite && (
            <AlbumCard.InfoCell label={t("other_prerequisite")}>
              {other_prerequisite}
            </AlbumCard.InfoCell>
          )}
        </AlbumCard.Info>
      )}

      <AlbumCard.Description description={description} />
    </VStack>
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
