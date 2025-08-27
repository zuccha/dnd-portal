import { Center } from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Weapons Panel
//------------------------------------------------------------------------------

export type WeaponPanelProps = {
  campaignId: string;
};

export default function WeaponsPanel(_props: WeaponPanelProps) {
  return (
    <Center h="full" w="full">
      Weapons
    </Center>
  );
}
