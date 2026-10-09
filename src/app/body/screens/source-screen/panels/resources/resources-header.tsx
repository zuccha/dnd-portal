import { HStack } from "@chakra-ui/react";
import { Grid2X2Icon, ListIcon } from "lucide-react";
import { useI18nLangContext } from "~/i18n/i18n-lang-context";
import { translate } from "~/i18n/i18n-string";
import type { LocalizedResource } from "~/models/resources/localized-resource";
import type { Resource } from "~/models/resources/resource";
import type { ResourceFilters } from "~/models/resources/resource-filters";
import type { ResourceStore } from "~/models/resources/resource-store";
import BinaryButton, { type BinaryButtonProps } from "~/ui/binary-button";
import SectionHeading from "~/ui/section-heading";
import { createResourcesCounter } from "./resources-counter";
import type { ResourcesContext } from "./resources-context";

//------------------------------------------------------------------------------
// Create Resources Header
//------------------------------------------------------------------------------

export function createResourcesHeader<
  R extends Resource,
  L extends LocalizedResource<R>,
  F extends ResourceFilters,
>(store: ResourceStore<R, L, F>, context: ResourcesContext<R>) {
  const ResourcesCounter = createResourcesCounter(store, context);

  return function ResourcesHeader({ sourceId }: { sourceId: string }) {
    const { lang, t } = useI18nLangContext(i18nContext);
    const view = context.useView();

    return (
      <HStack
        borderBottomWidth={1}
        flexShrink={0}
        justify="space-between"
        minH={12}
        px={{ base: 4, md: 6 }}
        w="full"
      >
        <SectionHeading fontSize="md">{translate(store.displayName, lang)}</SectionHeading>

        <HStack gap={3} ml="auto">
          <ResourcesCounter sourceId={sourceId} />

          <BinaryButton
            labels={[t("view.list"), t("view.cards")]}
            onValueChange={context.setView}
            options={viewOptions}
            value={view}
            zoom={0.8}
          />
        </HStack>
      </HStack>
    );
  };
}

//------------------------------------------------------------------------------
// View Options
//------------------------------------------------------------------------------

const viewOptions: BinaryButtonProps<"table", "cards">["options"] = [
  { Icon: ListIcon, value: "table" },
  { Icon: Grid2X2Icon, value: "cards" },
];

//------------------------------------------------------------------------------
// I18n Context
//------------------------------------------------------------------------------

const i18nContext = {
  "view.cards": {
    en: "Cards",
    it: "Carte",
  },
  "view.list": {
    en: "List",
    it: "Lista",
  },
};
