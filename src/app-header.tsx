import { Heading, HStack } from "@chakra-ui/react";
import ThemeButton from "./theme/theme-button";

export default function AppHeader() {
  return (
    <HStack justify="space-between" px={4} py={2} shadow="sm" w="full">
      <Heading size="lg">D&D</Heading>
      <ThemeButton />
    </HStack>
  );
}
