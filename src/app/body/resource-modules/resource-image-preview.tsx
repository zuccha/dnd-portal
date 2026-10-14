import { Box, type BoxProps, Image, Popover, Portal } from "@chakra-ui/react";
import Button from "../../../ui/button";

//------------------------------------------------------------------------------
// Resource Image Preview
//------------------------------------------------------------------------------

export default function ResourceImagePreview({
  alt,
  gridRow,
  imageUrl,
  label,
}: {
  alt: string;
  gridRow: BoxProps["gridRow"];
  imageUrl: string;
  label: string;
}) {
  return (
    <Box gridColumn={2} gridRow={gridRow} justifySelf="end" w="3rem">
      <Popover.Root positioning={{ placement: "left", gutter: 8 }}>
        <Popover.Trigger asChild>
          <Button
            aria-label={label}
            aspectRatio="1"
            h="auto"
            minW={0}
            outlineColor="gray.focusRing"
            overflow="hidden"
            p={0}
            position="relative"
            transition="outline-color 0.15s"
            variant="plain"
            w="full"
            _focusVisible={{
              outline: "2px solid",
              outlineColor: "gray.focusRing",
              outlineOffset: "2px",
            }}
            _hover={{
              outline: "2px solid",
              outlineColor: "gray.focusRing",
              outlineOffset: "2px",
            }}
          >
            <Image alt={alt} h="full" loading="lazy" objectFit="cover" src={imageUrl} w="full" />
          </Button>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content maxW={{ base: "calc(100vw - 2rem)", md: "24rem" }} p={2}>
              <Popover.Arrow>
                <Popover.ArrowTip />
              </Popover.Arrow>
              <Image alt={alt} maxH="70vh" objectFit="contain" src={imageUrl} w="full" />
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    </Box>
  );
}
