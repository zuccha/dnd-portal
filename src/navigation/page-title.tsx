import { useEffect } from "react";
import { useLocation, useParams } from "react-router";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { useSource } from "~/models/catalogue/catalogue";
import { Route } from "./routes";

//------------------------------------------------------------------------------
// Page Title
//------------------------------------------------------------------------------

export default function PageTitle() {
  const { lang, t } = useI18nLangContext(i18nContext);
  const { pathname } = useLocation();
  const { sourceId } = useParams();
  const source = useSource(sourceId);

  useEffect(() => {
    const pageTitle = sourceId && source ? source.name[lang] || source.code : t(pathname);
    document.title = pathname === Route._ ? "D&D Portal" : `${pageTitle} - D&D Portal`;
  }, [lang, pathname, source, sourceId, t]);

  return null;
}

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  [Route._]: {
    en: "Home",
    it: "Home",
  },
  [Route.Guide]: {
    en: "Guide",
    it: "Guida",
  },
  [Route.PrintDeck]: {
    en: "Print",
    it: "Stampa",
  },
  [Route.Sources]: {
    en: "Sources",
    it: "Fonti",
  },
  [Route.SignIn]: {
    en: "Sign in",
    it: "Accedi",
  },
  [Route.SignUp]: {
    en: "Sign up",
    it: "Registrati",
  },
  [Route.ResourcesAbilitiesEldritchInvocations]: {
    en: "Eldritch Invocations",
    it: "Suppliche Occulte",
  },
  [Route.ResourcesAbilitiesManeuvers]: {
    en: "Maneuvers",
    it: "Manovre",
  },
  [Route.ResourcesAbilitiesMetamagic]: {
    en: "Metamagic",
    it: "Metamagia",
  },
  [Route.ResourcesAbilitiesSpells]: {
    en: "Spells",
    it: "Incantesimi",
  },
  [Route.ResourcesBestiaryMonsters]: {
    en: "Creatures",
    it: "Creature",
  },
  [Route.ResourcesBestiaryTags]: {
    en: "Groups",
    it: "Gruppi",
  },
  [Route.ResourcesBlocksFeatures]: {
    en: "Features",
    it: "Privilegi",
  },
  [Route.ResourcesCharacterBackgrounds]: {
    en: "Backgrounds",
    it: "Background",
  },
  [Route.ResourcesCharacterClasses]: {
    en: "Classes",
    it: "Classi",
  },
  [Route.ResourcesCharacterFeats]: {
    en: "Feats",
    it: "Talenti",
  },
  [Route.ResourcesCharacterSpecies]: {
    en: "Species",
    it: "Specie",
  },
  [Route.ResourcesCharacterSubclasses]: {
    en: "Subclasses",
    it: "Sottoclassi",
  },
  [Route.ResourcesEquipmentArmorModifiers]: {
    en: "Armor Variants",
    it: "Varianti armature",
  },
  [Route.ResourcesEquipmentArmors]: {
    en: "Armors",
    it: "Armature",
  },
  [Route.ResourcesEquipmentItemModifiers]: {
    en: "Item Variants",
    it: "Varianti attrezzatura",
  },
  [Route.ResourcesEquipmentItems]: {
    en: "Adventuring Gear",
    it: "Attrezzatura",
  },
  [Route.ResourcesEquipmentToolModifiers]: {
    en: "Tool Variants",
    it: "Varianti strumenti",
  },
  [Route.ResourcesEquipmentTools]: {
    en: "Tools",
    it: "Strumenti",
  },
  [Route.ResourcesEquipmentWeaponModifiers]: {
    en: "Weapon Variants",
    it: "Varianti armi",
  },
  [Route.ResourcesEquipmentWeapons]: {
    en: "Weapons",
    it: "Armi",
  },
  [Route.ResourcesMarketServices]: {
    en: "Services",
    it: "Servizi",
  },
  [Route.ResourcesMarketVehicles]: {
    en: "Vehicles",
    it: "Veicoli",
  },
  [Route.ResourcesWorldLanguages]: {
    en: "Languages",
    it: "Lingue",
  },
  [Route.ResourcesWorldPlanes]: {
    en: "Planes",
    it: "Piani",
  },
};
