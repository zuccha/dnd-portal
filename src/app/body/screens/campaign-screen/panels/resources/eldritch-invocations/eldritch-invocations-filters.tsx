import { HStack, type StackProps } from "@chakra-ui/react";
import { eldritchInvocationStore } from "~/models/resources/eldritch-invocations/eldritch-invocation-store";
import NumberInput from "~/ui/number-input";

//------------------------------------------------------------------------------
// EldritchInvocations Filters
//------------------------------------------------------------------------------

export default function EldritchInvocationsFilters(props: StackProps) {
  const [filters, setFilters] = eldritchInvocationStore.useFilters();

  return (
    <HStack {...props}>
      <NumberInput
        onValueChange={(warlock_level) => setFilters({ warlock_level })}
        size="sm"
        value={filters.warlock_level ?? 20}
        w="4em"
      />
    </HStack>
  );
}
