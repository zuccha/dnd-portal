import { HStack, Span, VStack } from "@chakra-ui/react";
import { PackageIcon } from "lucide-react";
import CoinsIcon from "~/icons/coins-icon";
import type { LocalizedVehicle } from "~/models/resources/vehicles/localized-vehicle";
import type { Vehicle } from "~/models/resources/vehicles/vehicle";
import Icon from "~/ui/icon";
import PokerCard from "~/ui/poker-card";
import { ResourcePokerCard, type ResourcePokerCardProps } from "../../resource-poker-card";

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
  return (
    <ResourcePokerCard
      beforeDetails={
        <PokerCard.LabeledValues
          fields={[
            localizedResource.speed,
            { ...localizedResource.crew, label: localizedResource.crew.short_label },
            { ...localizedResource.passengers, label: localizedResource.passengers.short_label },
          ]}
          palette={palette}
        />
      }
      firstPageInfo={
        <HStack gap={0} justify="space-between" px={PokerCard.rem1000} w="full">
          <HStack gap={PokerCard.rem0750}>
            <StatIcon
              icon={shieldIcon}
              label={localizedResource.armor_class.short_label}
              value={localizedResource.armor_class.value}
            />
            <VStack align="flex-start" gap={0}>
              <Span>
                <b>{localizedResource.hit_points.short_label}</b>{" "}
                <Span>{localizedResource.hit_points.value}</Span>
              </Span>
              <Span>
                <b>{localizedResource.damage_threshold.short_label}</b>{" "}
                <Span>{localizedResource.damage_threshold.value}</Span>
              </Span>
            </VStack>
          </HStack>

          <VStack align="flex-end" gap={0}>
            <HStack gap={PokerCard.rem0250}>
              <Span>{localizedResource.cargo.value}</Span>
              <Icon Icon={PackageIcon} size="xs" />
            </HStack>

            <HStack gap={PokerCard.rem0250}>
              <Span>{localizedResource.cost.value}</Span>
              <Icon Icon={CoinsIcon} size="xs" />
            </HStack>
          </VStack>
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
