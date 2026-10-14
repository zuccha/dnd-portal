import { Box, Text, VStack } from "@chakra-ui/react";
import type { ReactNode } from "react";

//------------------------------------------------------------------------------
// Resource Detail Field
//------------------------------------------------------------------------------

export default function ResourceDetailField({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <VStack align="stretch" as="dl" gap={0}>
      <Text as="dt" color="fg.muted" fontSize="sm">
        {label}
      </Text>
      <Box as="dd" minW={0}>
        {children}
      </Box>
    </VStack>
  );
}
