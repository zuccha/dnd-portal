import { Box } from "@chakra-ui/react";
import type { LocalizedCreature } from "~/models/resources/creatures/localized-creature";
import type { LocalizedArmor } from "~/models/resources/equipment/armors/localized-armor";
import type { LocalizedItem } from "~/models/resources/equipment/items/localized-item";
import type { LocalizedWeapon } from "~/models/resources/equipment/weapons/localized-weapon";
import type { LocalizedSpell } from "~/models/resources/spells/localized-spell";
import PokerCard from "~/ui/poker-card";
import { palettes } from "~/utils/palette";
import { CreatureCard } from "../resources/creatures/panel/creature-card.tsx";
import { ArmorCard } from "../resources/equipment/armors/panel/armor-card.tsx";
import { ItemCard } from "../resources/equipment/items/panel/item-card.tsx";
import { WeaponCard } from "../resources/equipment/weapons/panel/weapon-card.tsx";
import { SpellCard } from "../resources/spells/panel/spell-card.tsx";
import type { ReactNode } from "react";

//------------------------------------------------------------------------------
// Home Card Fan
//------------------------------------------------------------------------------

type HomeCardFanProps = {
  breastplate: LocalizedArmor;
  crossbow: LocalizedWeapon;
  fireball: LocalizedSpell;
  owlbear: LocalizedCreature;
  potion: LocalizedItem;
};

export default function HomeCardFan({
  breastplate,
  crossbow,
  fireball,
  owlbear,
  potion,
}: HomeCardFanProps) {
  return (
    <Box
      aria-hidden="true"
      alignItems="flex-end"
      display="flex"
      flex={1}
      justifyContent="center"
      minH={{ base: "10rem", sm: "14rem", md: "16rem" }}
      mt={{ base: 4, md: 8 }}
      overflow="hidden"
      position="relative"
      w="full"
    >
      <HomeFanCard index={0} rotation={-18}>
        <CreatureCard
          localizedResource={owlbear}
          mode="paginated"
          palette={palettes.copper}
          position="absolute"
          selectedPageIndex={0}
          showImage
          {...homeFanCardFrameProps}
        />
      </HomeFanCard>
      <HomeFanCard index={1} rotation={-9}>
        <SpellCard
          localizedResource={fireball}
          mode="paginated"
          palette={palettes.brick}
          position="absolute"
          selectedPageIndex={0}
          showImage
          {...homeFanCardFrameProps}
        />
      </HomeFanCard>
      <HomeFanCard index={2} rotation={0}>
        <ItemCard
          localizedResource={potion}
          mode="paginated"
          palette={palettes.red}
          position="absolute"
          selectedPageIndex={0}
          showImage
          {...homeFanCardFrameProps}
        />
      </HomeFanCard>
      <HomeFanCard index={3} rotation={9}>
        <ArmorCard
          localizedResource={breastplate}
          mode="paginated"
          palette={palettes.slate}
          position="absolute"
          selectedPageIndex={0}
          showImage
          {...homeFanCardFrameProps}
        />
      </HomeFanCard>
      <HomeFanCard index={4} rotation={18}>
        <WeaponCard
          localizedResource={crossbow}
          mode="paginated"
          palette={palettes.brown}
          position="absolute"
          selectedPageIndex={0}
          showImage
          {...homeFanCardFrameProps}
        />
      </HomeFanCard>
    </Box>
  );
}

//------------------------------------------------------------------------------
// Home Fan Card
//------------------------------------------------------------------------------

type HomeFanCardProps = {
  children: ReactNode;
  index: number;
  rotation: number;
};

function HomeFanCard({ children, index, rotation }: HomeFanCardProps) {
  const translateY = index === 2 ? "0.25in" : index === 1 || index === 3 ? "0.4in" : "0.75in";
  const overlap = index === 0 ? undefined : { base: "-1.9in", md: "-1.34in" };

  return (
    <Box
      _hover={{
        transform: `translateY(calc(${translateY} - 0.16in)) rotate(${rotation}deg)`,
        zIndex: 10,
      }}
      h={`${PokerCard.cardH}in`}
      marginInlineStart={overlap}
      position="relative"
      scale={{ base: "0.42", sm: "0.66", md: "0.78" }}
      transform={`translateY(${translateY}) rotate(${rotation}deg)`}
      transformOrigin="center bottom"
      transition="transform 180ms ease-out"
      flexShrink={0}
      w={`${PokerCard.cardW}in`}
      zIndex={index + 1}
    >
      {children}
    </Box>
  );
}

//------------------------------------------------------------------------------
// Home Fan Card Frame Props
//------------------------------------------------------------------------------

const homeFanCardFrameProps = {
  h: "full",
  left: 0,
  top: 0,
  w: "full",
};
