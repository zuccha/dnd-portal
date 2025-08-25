import { Center } from "@chakra-ui/react";

//------------------------------------------------------------------------------
// Page Weapons
//------------------------------------------------------------------------------

export type PageWeaponProps = {
  campaignId: string;
};

export default function PageWeapons(_props: PageWeaponProps) {
  return (
    <Center h="full" w="full">
      Weapons
    </Center>
  );
}
