import type { FC } from "react";
import PageSpells from "./page-spells";
import PageWeapons from "./page-weapons";
import { type PageId, useSelectedPageId } from "./pages";

//------------------------------------------------------------------------------
// Page
//------------------------------------------------------------------------------

export default function Page() {
  const [selectedContentId] = useSelectedPageId();

  if (!selectedContentId) return null;

  const Page = pages[selectedContentId];
  return <Page />;
}

//------------------------------------------------------------------------------
// Pages
//------------------------------------------------------------------------------

const pages: Record<PageId, FC> = {
  spells: PageSpells,
  weapons: PageWeapons,
};
