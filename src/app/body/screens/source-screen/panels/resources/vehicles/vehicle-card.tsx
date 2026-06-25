import { HStack, Span, VStack } from "@chakra-ui/react";
import { PackageIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import CoinsIcon from "~/icons/coins-icon";
import type { LocalizedVehicle } from "~/models/resources/vehicles/localized-vehicle";
import type { Vehicle } from "~/models/resources/vehicles/vehicle";
import Icon from "~/ui/icon";
import PokerCard from "~/ui/poker-card";
import {
  ResourcePokerCard,
  type ResourcePokerCardProps,
} from "../resource-poker-card";

//------------------------------------------------------------------------------
// Vehicle Card
//------------------------------------------------------------------------------

export type VehicleCardProps = Omit<
  ResourcePokerCardProps<Vehicle, LocalizedVehicle>,
  "afterDetails" | "beforeDetails" | "firstPageInfo"
>;

export function VehicleCard({
  localizedResource,
  onPageCountChange = () => {},
  palette,
  ...rest
}: VehicleCardProps) {
  const { t } = useI18nLangContext(i18nContext);

  return (
    <ResourcePokerCard
      beforeDetails={
        localizedResource.info && (
          <PokerCard.Info palette={palette}>
            {localizedResource.info}
          </PokerCard.Info>
        )
      }
      firstPageInfo={
        <HStack gap={0} justify="space-between" px={PokerCard.rem1000} w="full">
          <HStack gap={PokerCard.rem0750}>
            <StatIcon
              icon={shieldIcon}
              label={t("armor_class")}
              value={localizedResource.ac}
            />
            <VStack align="flex-start" gap={0}>
              <Span>
                <b>{t("hit_points")}</b> <Span>{localizedResource.hp}</Span>
              </Span>
              <Span>
                <b>{t("damage_threshold")}</b>{" "}
                <Span>{localizedResource.damage_threshold}</Span>
              </Span>
            </VStack>
          </HStack>

          <VStack align="flex-end" gap={0}>
            <HStack gap={PokerCard.rem0250}>
              <Span>{localizedResource.cargo}</Span>
              <Icon Icon={PackageIcon} size="xs" />
            </HStack>

            <HStack gap={PokerCard.rem0250}>
              <Span>{localizedResource.cost}</Span>
              <Icon Icon={CoinsIcon} size="xs" />
            </HStack>
          </VStack>

          {/* <HStack gap={PokerCard.rem0750}>
            <VStack align="flex-end" flex={1} gap={0}>
              <Span>
                <b>{t("proficiency_bonus")}</b>{" "}
                <Span>{localizedResource.pb}</Span>
              </Span>
              <Span>
                <b>{t("exp")}</b> <Span>{localizedResource.exp}</Span>
              </Span>
            </VStack>
            <StatIcon
              icon={scrollIcon}
              label={t("challenge_rating")}
              value={localizedResource.cr}
            />
          </HStack> */}
        </HStack>
      }
      localizedResource={localizedResource}
      onPageCountChange={onPageCountChange}
      palette={palette}
      {...rest}
    />
  );
}

VehicleCard.Placeholder = ResourcePokerCard.Placeholder;
VehicleCard.h = ResourcePokerCard.h;
VehicleCard.w = ResourcePokerCard.w;

//------------------------------------------------------------------------------
// Stat Icon
//------------------------------------------------------------------------------

type StatIconProps = {
  icon: string;
  label: string;
  value: string;
};

function StatIcon({ icon, label, value }: StatIconProps) {
  return (
    <VStack
      bgImage={`url("data:image/svg+xml,${icon}")`}
      bgRepeat="no-repeat"
      bgSize="100% 100%"
      color="white"
      fontWeight="bold"
      gap={0}
      h={`${PokerCard.remToIn(2.5)}in`}
      justify="center"
      pt={PokerCard.rem0250}
      w={`${PokerCard.remToIn(2.5)}in`}
    >
      <Span fontSize={PokerCard.rem0625}>{label}</Span>
      <Span>{value}</Span>
    </VStack>
  );
}

//------------------------------------------------------------------------------
// Icons
//------------------------------------------------------------------------------

const shieldIcon = encodeURIComponent(`\
<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 0C21.875 0.999998 33.125 0.999998 50 0.000160217C66.875 0.999835 78.125 0.999842 95 4.02331e-06C93 22 95 34 95 57.0001C95 69 93.875 79 83.75 89C73.625 96 61.25 97 50 100C38.75 97 26.375 96 16.25 89C6.125 79 5 69.5 5 57.5C5 35 7 23 5 0Z" fill="${PokerCard.separatorColor}"/>
</svg>`);

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  armor_class: {
    en: "AC",
    it: "CA",
  },
  damage_threshold: {
    en: "Damage Treshold",
    it: "Soglia di Danno",
  },
  hit_points: {
    en: "HP",
    it: "PF",
  },
};
