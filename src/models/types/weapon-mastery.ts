import { useCallback } from "react";
import { z } from "zod";
import { type I18nString, translate } from "~/i18n/i18n-string";
import { createTypeTranslationHooks } from "./_base";

//------------------------------------------------------------------------------
// Weapon Mastery
//------------------------------------------------------------------------------

export const weaponMasterySchema = z.enum([
  "cleave",
  "graze",
  "nick",
  "push",
  "sap",
  "slow",
  "topple",
  "vex",
]);

export const weaponMasteries = weaponMasterySchema.options;

export type WeaponMastery = z.infer<typeof weaponMasterySchema>;

//------------------------------------------------------------------------------
// Weapon Mastery Hooks
//------------------------------------------------------------------------------

export const {
  useSortedOptions: useWeaponMasteryOptions,
  useTranslate: useTranslateWeaponMastery,
  useTranslations: useWeaponMasteryTranslations,
} = createTypeTranslationHooks(weaponMasteries, {
  cleave: { en: "Cleave", it: "Doppio fendente" },
  graze: { en: "Graze", it: "Colpo di striscio" },
  nick: { en: "Nick", it: "Graffio" },
  push: { en: "Push", it: "Spinta" },
  sap: { en: "Sap", it: "Prosciugamento" },
  slow: { en: "Slow", it: "Lentezza" },
  topple: { en: "Topple", it: "Rovesciamento" },
  vex: { en: "Vex", it: "Vessazione" },
});

//------------------------------------------------------------------------------
// Use Translate Weapon Mastery Ruling
//------------------------------------------------------------------------------

export function useTranslateWeaponMasteryRuling(
  lang: string,
): (weaponMastery: WeaponMastery) => string {
  return useCallback(
    (weaponMastery: WeaponMastery) =>
      translate(weaponMasteryRulings[weaponMastery], lang),
    [lang],
  );
}

//------------------------------------------------------------------------------
// Weapon Mastery Rulings
//------------------------------------------------------------------------------

const weaponMasteryRulings: Record<WeaponMastery, I18nString> = {
  cleave: {
    en: "If you hit a creature with a melee attack roll using this weapon, you can make a melee attack roll with the weapon against a second creature within 5 feet of the first that is also within your reach. On a hit, the second creature takes the weapon's da mage, but don't add your ability modifier to that damage unless that modifier is negative. You can make this extra attack only once per turn.",
    it: "Se il personaggio colpisce una creatura con un tiro per colpire in mischia usando quest'arma, può effettuarne un altro con la stessa arma contro un altro bersaglio entro 1,5 metri dal primo che sia a portata. Se il colpo va a segno, la seconda creatura subisce i danni inferti dall'arma, ma non puoi aggiungere il modificatore di caratteristica del personaggio al danno a meno che questo non sia di valore negativo. L'attacco extra può essere eseguito solo una volta per turno.",
  },
  graze: {
    en: "If your attack roll with this weapon misses a creature, you can deal damage to that creature equal to the ability modifier you used to make the attack roll. This damage is the same type dealt by the weapon, and the damage can be increased only by increasing the ability modifier.",
    it: "Se il tiro per colpire con quest'arma non va a segno contro una creatura, il personaggio può infliggere una quantità di danni alla creatura pari al modificatore di caratteristica utilizzato per il tiro per colpire. Il danno è della stessa tipologia dell'arma e può essere aumentato solo incrementando il modificatore di caratteristica.",
  },
  nick: {
    en: "When you make the extra attack of the Light property, you can make it as part of the Attack action instead of as a Bonus Action. You can make this extra attack only once per turn.",
    it: "Quando il personaggio effettua l'attacco extra della proprietà leggera, può renderlo parte dell'azione di Attacco invece che dell'azione bonus. L'attacco extra può essere eseguito solo una volta per turno.",
  },
  push: {
    en: "If you hit a creature with this weapon, you can push the creature up to 10 feet straight away from yourself if it is Large or smaller.",
    it: "Se il personaggio colpisce una creatura con quest'arma, può spingerla via da sé di almeno 3 metri se è di taglia Grande o inferiore.",
  },
  sap: {
    en: "If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of your next turn.",
    it: "Se il personaggio colpisce una creatura con quest'arma, la creatura avrà svantaggio al prossimo tiro per colpire prima dell'inizio del prossimo turno del personaggio.",
  },
  slow: {
    en: "If you hit a creature with this weapon and deal damage to it, you can reduce its Speed by 10 feet until the start of your next turn. If the creature is hit more than once by weapons that have this property, the Speed reduction doesn't exceed 10 feet.",
    it: "Se il personaggio colpisce una creatura con quest'arma e le infligge dei danni, può ridurne la velocità di 3 metri fino all'inizio del turno successivo del personaggio. Se la creatura viene colpita più di una volta da armi con questa proprietà, la riduzione di velocità non supera i 3 metri.",
  },
  topple: {
    en: "If you hit a creature with this weapon, you can force the creature to make a Constitution saving throw (DC 8 plus the ability modifier used to make the attack roll and your Proficiency Bonus). On a failed save, the creature has the P, one condition.",
    it: "Se il personaggio colpisce una creatura con quest'arma, può costringerla a effettuare un tiro salvezza su Costituzione (CD 8 più il modificatore di caratteristica utilizzato per il tiro salvezza su Costituzione e il bonus di competenza del personaggio). Se lo fallisce, cade a terra prona.",
  },
  vex: {
    en: "If you hit a creature with this weapon and deal damage to the creature, you have add Advantage on your next attack roll against that creature before the end of your next turn.",
    it: "Se il personaggio colpisce una creatura con quest'arma e le infligge dei danni, avrà vantaggio al prossimo tiro per colpire eseguito contro la creatura prima del termine del turno successivo.",
  },
};
