import { Box, Text } from "@chakra-ui/react";
import PageTitle from "~/navigation/page-title";

//------------------------------------------------------------------------------
// Resource Detail Not Found
//------------------------------------------------------------------------------

export default function ResourceDetailNotFound({ message }: { message: string }) {
  return (
    <>
      <PageTitle title={message} />
      <Box h="full" p={{ base: 5, md: 8 }}>
        <Text role="alert">{message}</Text>
      </Box>
    </>
  );
}
