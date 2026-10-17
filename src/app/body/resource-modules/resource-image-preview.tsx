import { Flex, Image, Popover, Portal } from "@chakra-ui/react";
import Button from "../../../ui/button";

//------------------------------------------------------------------------------
// Resource Image Preview
//------------------------------------------------------------------------------

export default function ResourceImagePreview({
  alt,
  imageUrl,
  label,
}: {
  alt: string;
  imageUrl: string;
  label: string;
}) {
  return (
    <Flex alignSelf="stretch" contain="size" flex={1} justifyContent="flex-end">
      <Popover.Root positioning={{ placement: "left", gutter: 8 }}>
        <Popover.Trigger asChild>
          <Button
            aria-label={label}
            h="full"
            outlineColor="gray.focusRing"
            overflow="hidden"
            p={0}
            position="relative"
            transition="outline-color 0.15s"
            variant="plain"
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
            <Image alt={alt} h="full" objectFit="contain" src={imageUrl} />
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
    </Flex>
  );
}
