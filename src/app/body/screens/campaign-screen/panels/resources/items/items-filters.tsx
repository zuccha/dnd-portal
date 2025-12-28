import { HStack, type StackProps } from "@chakra-ui/react";
import { WandIcon } from "lucide-react";
import { itemStore } from "~/models/resources/equipment/items/item-store";
import Icon from "~/ui/icon";
import InclusionButton from "~/ui/inclusion-button";

//------------------------------------------------------------------------------
// Items Filters
//------------------------------------------------------------------------------

export default function ItemsFilters(props: StackProps) {
  const [filters, setFilters] = itemStore.useFilters();

  return (
    <HStack {...props}>
      <InclusionButton
        include={filters.magic}
        onValueChange={(magic) => setFilters({ magic })}
        size="sm"
      >
        <Icon Icon={WandIcon} size="sm" />
      </InclusionButton>
    </HStack>
  );
}
