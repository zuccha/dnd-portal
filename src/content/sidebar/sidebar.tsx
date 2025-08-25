import { VStack, createListCollection } from "@chakra-ui/react";
import Select from "../../ui/select";

//------------------------------------------------------------------------------
// Sidebar
//------------------------------------------------------------------------------

export default function Sidebar() {
  return (
    <VStack borderRightWidth={1} flex={1} h="full" maxW="20em" p={4}>
      <Select onValueChange={() => {}} options={campaigns} value="arvenna" />
    </VStack>
  );
}

// TODO: Replace with actual data.
const campaigns = createListCollection({
  items: [{ label: "Arvenna", value: "arvenna" }],
});
